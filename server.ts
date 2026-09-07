import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/restaurantDb';

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- TENANTS & SAAS ONBOARDING ---
app.get('/api/tenants', (_req, res) => {
  res.json(db.tenants);
});

app.post('/api/tenants', (req, res) => {
  const { name, country, currency, taxRatePct, branchName } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Restaurant name is required' });
  }
  const newTenant = db.createTenant(
    name,
    country || 'Saudi Arabia',
    currency || 'SAR',
    Number(taxRatePct) || 15,
    branchName || `${name} - Main Branch`
  );
  res.status(201).json(newTenant);
});

// --- BRANCHES ---
app.get('/api/branches', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branches = db.getBranchesByTenant(tenantId);
  res.json(branches);
});

app.get('/api/tenants/:tenantId/branches', (req, res) => {
  const { tenantId } = req.params;
  const branches = db.getBranchesByTenant(tenantId);
  res.json(branches);
});

// --- MENU & PRODUCTS (WITH RECIPES / BOM) ---
app.get('/api/menu', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const categories = db.categories.filter((c) => c.tenantId === tenantId);
  const products = db.getProducts(tenantId);
  res.json({ categories, products });
});

const handleToggle86 = (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const product = db.products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  product.is86d = !product.is86d;
  res.json(product);
};

app.patch('/api/products/:id/toggle-86', handleToggle86);
app.patch('/api/products/:id/86', handleToggle86);

// --- TABLES & FLOOR MANAGEMENT ---
app.get('/api/tables', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const tables = db.getTables(tenantId, branchId);
  res.json(tables);
});

app.patch('/api/tables/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, assignedWaiter } = req.body;
  const table = db.tables.find((t) => t.id === id);
  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }
  if (status) table.status = status;
  if (assignedWaiter !== undefined) table.assignedWaiter = assignedWaiter;
  res.json(table);
});

// --- ORDERS & POS / WAITER / QR ---
app.get('/api/orders', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const orders = db.getOrders(tenantId, branchId);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { tenantId, branchId, orderData } = req.body;
  if (!tenantId || !branchId || !orderData) {
    return res.status(400).json({ error: 'Missing order payload' });
  }
  const created = db.createOrder(tenantId, branchId, orderData);
  res.status(201).json(created);
});

app.post('/api/orders/:id/pay', (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentBreakdown } = req.body;
  const result = db.payOrder(id, paymentMethod || 'CASH', paymentBreakdown);
  if (!result.success) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(result);
});

app.post('/api/orders/:id/bump', (req, res) => {
  const { id } = req.params;
  const { nextStatus } = req.body;
  const updated = db.bumpOrderStatus(id, nextStatus);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = db.bumpOrderStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

app.post('/api/orders/:id/void', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  order.status = 'VOIDED';
  order.voidReason = reason || 'Customer cancellation';

  if (order.tableId) {
    const tbl = db.tables.find((t) => t.id === order.tableId);
    if (tbl) {
      tbl.status = 'FREE';
      tbl.activeOrderId = undefined;
    }
  }
  res.json(order);
});

app.post('/api/orders/:id/items/:itemId/void', (req, res) => {
  const { id, itemId } = req.params;
  const { reason } = req.body;
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const itemIndex = order.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in order' });
  }

  const removedItem = order.items.splice(itemIndex, 1)[0];
  removedItem.voidReason = reason || 'Server voided un-fired item';
  removedItem.voidedAt = new Date().toISOString();

  // Recalculate totals
  const subtotal = order.items.reduce((acc, i) => acc + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0);
  const tenant = db.getTenant(order.tenantId);
  const taxRate = tenant?.taxRatePct ?? 15;
  order.subtotal = subtotal;
  order.taxAmount = (subtotal * taxRate) / 100;
  order.total = order.subtotal + order.taxAmount - (order.discountAmount || 0);

  if (order.items.length === 0) {
    order.status = 'VOIDED';
    order.voidReason = `All items voided: ${reason || 'Item voided'}`;
    if (order.tableId) {
      const tbl = db.tables.find((t) => t.id === order.tableId);
      if (tbl) {
        tbl.status = 'FREE';
        tbl.activeOrderId = undefined;
      }
    }
  }

  res.json({ order, removedItem, reason });
});

// --- INVENTORY & RECIPES (BOM) ---
app.get('/api/inventory', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const ingredients = db.getIngredients(tenantId).map((ing) => ({
    ...ing,
    branchStock: ing.currentStock[branchId] ?? 0,
    isLowStock: (ing.currentStock[branchId] ?? 0) <= ing.minStockThreshold,
  }));
  res.json(ingredients);
});

app.post('/api/inventory/adjust', (req, res) => {
  const { ingredientId, branchId, delta, reason } = req.body;
  const ing = db.ingredients.find((i) => i.id === ingredientId);
  if (!ing) return res.status(404).json({ error: 'Ingredient not found' });

  const current = ing.currentStock[branchId] || 0;
  ing.currentStock[branchId] = Math.max(0, current + Number(delta));

  // Log waste/adjustment into accounting if it's waste
  if (Number(delta) < 0 && reason?.toLowerCase().includes('waste')) {
    const cost = Math.abs(Number(delta)) * ing.costPerUnit;
    db.journalEntries.unshift({
      id: `je-waste-${Date.now()}`,
      tenantId: ing.tenantId,
      branchId,
      date: new Date().toISOString().split('T')[0],
      reference: `WASTE-${ing.name.slice(0, 5).toUpperCase()}`,
      description: `Spoilage/Waste: ${Math.abs(Number(delta))} ${ing.uom} of ${ing.name} (${reason})`,
      lines: [
        { accountCode: '5020', accountName: 'Kitchen Spoilage & Waste Expense', debit: cost, credit: 0 },
        { accountCode: '1100', accountName: 'Raw Ingredient Inventory Asset', debit: 0, credit: cost },
      ],
    });
  }

  res.json({ success: true, updatedStock: ing.currentStock[branchId] });
});

// --- PURCHASING & SUPPLIERS ---
app.get('/api/purchasing', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const suppliers = db.suppliers.filter((s) => s.tenantId === tenantId);
  const purchaseOrders = db.purchaseOrders.filter((p) => p.tenantId === tenantId && p.branchId === branchId);
  res.json({ suppliers, purchaseOrders });
});

app.post('/api/purchasing/orders', (req, res) => {
  const { tenantId, branchId, poData, supplierId, items } = req.body;
  const sId = supplierId || poData?.supplierId;
  const supplier = db.suppliers.find((s) => s.id === sId);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

  const lineItems = items || poData?.items || [];
  const totalAmount = poData?.totalAmount || lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.unitCost), 0);

  const newPo = {
    id: `po-${Date.now()}`,
    tenantId: tenantId || poData?.tenantId || db.tenants[0]?.id,
    branchId: branchId || poData?.branchId || db.branches[0]?.id,
    supplierId: sId,
    supplierName: supplier.name,
    poNumber: `PO-2026-${String(db.purchaseOrders.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    status: (poData?.status || 'SENT') as any,
    items: lineItems,
    totalAmount,
  };
  db.purchaseOrders.unshift(newPo);
  res.status(201).json(newPo);
});

app.post('/api/purchasing/orders/:id/receive', (req, res) => {
  const { id } = req.params;
  const received = db.receivePurchaseOrder(id);
  if (!received) return res.status(404).json({ error: 'PO not found' });
  res.json(received);
});

// --- ACCOUNTING & FINANCIALS ---
const getAccountingData = (tenantId: string, branchId: string) => {
  const entries = db.journalEntries.filter((j) => j.tenantId === tenantId && j.branchId === branchId);
  const branchOrders = db.orders.filter((o) => o.tenantId === tenantId && o.branchId === branchId && o.status === 'PAID');
  const grossSales = branchOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const netSales = branchOrders.reduce((acc, o) => acc + (o.subtotal - o.discountAmount), 0);
  const totalTax = branchOrders.reduce((acc, o) => acc + o.taxAmount, 0);

  let totalCogs = 0;
  branchOrders.forEach((o) => {
    o.items.forEach((item) => {
      totalCogs += (item.costPrice || 0) * item.quantity;
    });
  });

  const grossProfit = netSales - totalCogs;
  const foodCostPct = netSales > 0 ? (totalCogs / netSales) * 100 : 0;

  return {
    journalEntries: entries,
    summary: {
      grossSales,
      discounts: grossSales - netSales,
      netSales,
      taxCollected: totalTax,
      totalTax,
      cogs: totalCogs,
      grossProfit,
      foodCostPct: Number(foodCostPct.toFixed(1)),
      orderCount: branchOrders.length,
      operatingExpenses: 4500,
      netProfit: grossProfit - 4500,
    },
  };
};

app.get('/api/accounting', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const data = getAccountingData(tenantId, branchId);
  res.json({
    journalEntries: data.journalEntries,
    pnl: data.summary,
  });
});

app.get('/api/accounting/journals', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const data = getAccountingData(tenantId, branchId);
  res.json(data.journalEntries);
});

app.get('/api/accounting/summary', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const data = getAccountingData(tenantId, branchId);
  res.json(data.summary);
});

// --- SHIFTS & CASH DRAWER ---
const getActiveShiftHandler = (req: express.Request, res: express.Response) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branchId = (req.query.branchId as string) || db.branches[0]?.id;
  const shift = db.shifts.find((s) => s.tenantId === tenantId && s.branchId === branchId && s.status === 'OPEN');
  res.json(shift || null);
};

app.get('/api/shifts/current', getActiveShiftHandler);
app.get('/api/shifts/active', getActiveShiftHandler);

app.post('/api/shifts/open', (req, res) => {
  const { tenantId, branchId, cashierName, openingFloat, startingFloat } = req.body;
  const floatVal = Number(openingFloat ?? startingFloat) || 500;
  const newShift = {
    id: `shift-${Date.now()}`,
    tenantId: tenantId || db.tenants[0]?.id,
    branchId: branchId || db.branches[0]?.id,
    cashierName: cashierName || 'Cashier Ahmed',
    openedAt: new Date().toISOString(),
    openingFloat: floatVal,
    startingFloat: floatVal,
    expectedCash: floatVal,
    cashSalesCollected: 0,
    status: 'OPEN' as const,
    totalSales: 0,
    orderCount: 0,
  };
  db.shifts.unshift(newShift as any);
  res.status(201).json(newShift);
});

app.post('/api/shifts/close', (req, res) => {
  const { shiftId, actualCash, actualCashCount } = req.body;
  const shift = db.shifts.find((s) => s.id === shiftId || s.status === 'OPEN');
  if (!shift) return res.status(404).json({ error: 'Shift not found' });

  const cashCount = Number(actualCash ?? actualCashCount) || 0;
  shift.status = 'CLOSED';
  shift.closedAt = new Date().toISOString();
  shift.actualCash = cashCount;
  (shift as any).actualCashCount = cashCount;
  shift.difference = cashCount - shift.expectedCash;

  res.json(shift);
});

app.post('/api/shifts/:id/close', (req, res) => {
  const { id } = req.params;
  const { actualCash, actualCashCount } = req.body;
  const shift = db.shifts.find((s) => s.id === id);
  if (!shift) return res.status(404).json({ error: 'Shift not found' });

  const cashCount = Number(actualCash ?? actualCashCount) || 0;
  shift.status = 'CLOSED';
  shift.closedAt = new Date().toISOString();
  shift.actualCash = cashCount;
  (shift as any).actualCashCount = cashCount;
  shift.difference = cashCount - shift.expectedCash;

  res.json(shift);
});

// --- MULTI-BRANCH ANALYTICS ---
app.get('/api/analytics', (req, res) => {
  const tenantId = (req.query.tenantId as string) || db.tenants[0]?.id;
  const branches = db.getBranchesByTenant(tenantId);

  const branchesData = branches.map((b) => {
    const bOrders = db.orders.filter((o) => o.tenantId === tenantId && o.branchId === b.id && o.status === 'PAID');
    const sales = bOrders.reduce((acc, o) => acc + o.total, 0);
    const orderCount = bOrders.length;
    const avgBasket = orderCount > 0 ? sales / orderCount : 0;
    const occupiedTables = db.tables.filter((t) => t.branchId === b.id && t.status === 'OCCUPIED').length;
    const totalTables = db.tables.filter((t) => t.branchId === b.id).length || 1;

    return {
      branchId: b.id,
      branchName: b.name,
      city: b.city,
      sales,
      orderCount,
      avgBasket: Number(avgBasket.toFixed(1)),
      occupancyPct: Math.round((occupiedTables / totalTables) * 100),
    };
  });

  // Top products calculation
  const productSalesMap: Record<string, { name: string; quantitySold: number; revenue: number }> = {};
  db.orders
    .filter((o) => o.tenantId === tenantId && o.status === 'PAID')
    .forEach((o) => {
      o.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.productName, quantitySold: 0, revenue: 0 };
        }
        productSalesMap[item.productId].quantitySold += item.quantity;
        productSalesMap[item.productId].revenue += item.quantity * item.unitPrice;
      });
    });

  const topProducts = Object.entries(productSalesMap)
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  // If no orders yet, populate top products from menu items
  const finalTopProducts = topProducts.length > 0
    ? topProducts
    : db.products.filter(p => p.tenantId === tenantId).slice(0, 4).map(p => ({
        productId: p.id,
        name: p.name,
        quantitySold: 18,
        revenue: p.price * 18,
      }));

  const hourlySales = [
    { hour: '12 PM', sales: 420 },
    { hour: '1 PM', sales: 890 },
    { hour: '2 PM', sales: 740 },
    { hour: '3 PM', sales: 310 },
    { hour: '6 PM', sales: 520 },
    { hour: '7 PM', sales: 980 },
    { hour: '8 PM', sales: 1350 },
    { hour: '9 PM', sales: 1120 },
    { hour: '10 PM', sales: 670 },
  ];

  res.json({
    branchesData,
    topProducts: finalTopProducts,
    hourlySales,
  });
});

// Catch-all 404 for any unmatched /api/* route
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RestoOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
