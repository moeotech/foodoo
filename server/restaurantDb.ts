import {
  Tenant,
  Branch,
  Category,
  Product,
  Ingredient,
  RestaurantTable,
  Order,
  PurchaseOrder,
  Supplier,
  JournalEntry,
  Shift,
  KitchenStation,
} from '../src/types/restaurant';

// In-Memory Multi-Tenant Restaurant Database Store
class RestaurantDatabase {
  public tenants: Tenant[] = [
    {
      id: 'tenant-sultan',
      name: 'Sultan Burger & Smokehouse',
      slug: 'sultan-burger',
      country: 'Saudi Arabia',
      currency: 'SAR',
      taxRatePct: 15,
      taxName: 'ZATCA VAT 15%',
      createdAt: '2025-01-15T08:00:00Z',
    },
    {
      id: 'tenant-zaatar',
      name: 'Zaatar & Olive Bistro',
      slug: 'zaatar-olive',
      country: 'United Arab Emirates',
      currency: 'AED',
      taxRatePct: 5,
      taxName: 'UAE FTA VAT 5%',
      createdAt: '2025-02-10T09:00:00Z',
    },
  ];

  public branches: Branch[] = [
    {
      id: 'branch-olaya',
      tenantId: 'tenant-sultan',
      name: 'Riyadh - Al Olaya Flagship',
      code: 'RUH-01',
      city: 'Riyadh',
      address: 'King Fahd Road, Al Olaya District',
      phone: '+966 11 456 7890',
      isActive: true,
    },
    {
      id: 'branch-jeddah',
      tenantId: 'tenant-sultan',
      name: 'Jeddah - Waterfront Corniche',
      code: 'JED-02',
      city: 'Jeddah',
      address: 'Corniche Rd, Ash Shati District',
      phone: '+966 12 654 3210',
      isActive: true,
    },
    {
      id: 'branch-dubai',
      tenantId: 'tenant-zaatar',
      name: 'Dubai - Marina Promenade',
      code: 'DXB-01',
      city: 'Dubai',
      address: 'Marina Walk, Dubai Marina',
      phone: '+971 4 399 1234',
      isActive: true,
    },
  ];

  public categories: Category[] = [
    { id: 'cat-burgers', tenantId: 'tenant-sultan', name: 'Gourmet Burgers', icon: 'Beef', displayOrder: 1 },
    { id: 'cat-combos', tenantId: 'tenant-sultan', name: 'Signature Combos', icon: 'Flame', displayOrder: 2 },
    { id: 'cat-sides', tenantId: 'tenant-sultan', name: 'Loaded Sides', icon: 'Utensils', displayOrder: 3 },
    { id: 'cat-drinks', tenantId: 'tenant-sultan', name: 'Craft Beverages', icon: 'Coffee', displayOrder: 4 },
    { id: 'cat-desserts', tenantId: 'tenant-sultan', name: 'Sweet Desserts', icon: 'Cake', displayOrder: 5 },
  ];

  public ingredients: Ingredient[] = [
    {
      id: 'ing-patty-angus',
      tenantId: 'tenant-sultan',
      name: 'Black Angus Beef Patty (150g)',
      category: 'Meat & Poultry',
      uom: 'pcs',
      minStockThreshold: 50,
      costPerUnit: 8.5,
      currentStock: { 'branch-olaya': 142, 'branch-jeddah': 88 },
    },
    {
      id: 'ing-bun-brioche',
      tenantId: 'tenant-sultan',
      name: 'Golden Brioche Bun',
      category: 'Bakery',
      uom: 'pcs',
      minStockThreshold: 60,
      costPerUnit: 1.8,
      currentStock: { 'branch-olaya': 180, 'branch-jeddah': 120 },
    },
    {
      id: 'ing-truffle-mayo',
      tenantId: 'tenant-sultan',
      name: 'Black Truffle Aioli',
      category: 'Sauces',
      uom: 'ml',
      minStockThreshold: 1000,
      costPerUnit: 0.08,
      currentStock: { 'branch-olaya': 4500, 'branch-jeddah': 2800 },
    },
    {
      id: 'ing-cheddar',
      tenantId: 'tenant-sultan',
      name: 'Aged Cheddar Cheese Slice',
      category: 'Dairy',
      uom: 'pcs',
      minStockThreshold: 80,
      costPerUnit: 1.2,
      currentStock: { 'branch-olaya': 220, 'branch-jeddah': 140 },
    },
    {
      id: 'ing-potatoes',
      tenantId: 'tenant-sultan',
      name: 'Skin-on Russet Fries',
      category: 'Frozen/Produce',
      uom: 'g',
      minStockThreshold: 5000,
      costPerUnit: 0.015,
      currentStock: { 'branch-olaya': 24000, 'branch-jeddah': 15000 },
    },
    {
      id: 'ing-parmesan',
      tenantId: 'tenant-sultan',
      name: 'Shaved Parmigiano-Reggiano',
      category: 'Dairy',
      uom: 'g',
      minStockThreshold: 500,
      costPerUnit: 0.12,
      currentStock: { 'branch-olaya': 1800, 'branch-jeddah': 950 },
    },
    {
      id: 'ing-soda-syrup',
      tenantId: 'tenant-sultan',
      name: 'Fountain Soda Concentrate',
      category: 'Beverages',
      uom: 'ml',
      minStockThreshold: 2000,
      costPerUnit: 0.008,
      currentStock: { 'branch-olaya': 8500, 'branch-jeddah': 6200 },
    },
    {
      id: 'ing-lemon-mint',
      tenantId: 'tenant-sultan',
      name: 'Fresh Mint & Meyer Lemons',
      category: 'Produce',
      uom: 'g',
      minStockThreshold: 600,
      costPerUnit: 0.025,
      currentStock: { 'branch-olaya': 1200, 'branch-jeddah': 750 },
    },
  ];

  public products: Product[] = [
    {
      id: 'prod-truffle-angus',
      tenantId: 'tenant-sultan',
      categoryId: 'cat-burgers',
      name: 'Truffle Angus Burger',
      description: 'Charbroiled 150g Angus beef, aged cheddar, caramelised onions & black truffle aioli in a toasted brioche bun.',
      price: 48,
      costPrice: 13.9,
      isCombo: false,
      is86d: false,
      station: 'GRILL',
      recipe: [
        { ingredientId: 'ing-patty-angus', ingredientName: 'Black Angus Beef Patty (150g)', quantity: 1, uom: 'pcs', unitCost: 8.5 },
        { ingredientId: 'ing-bun-brioche', ingredientName: 'Golden Brioche Bun', quantity: 1, uom: 'pcs', unitCost: 1.8 },
        { ingredientId: 'ing-cheddar', ingredientName: 'Aged Cheddar Cheese Slice', quantity: 1, uom: 'pcs', unitCost: 1.2 },
        { ingredientId: 'ing-truffle-mayo', ingredientName: 'Black Truffle Aioli', quantity: 30, uom: 'ml', unitCost: 0.08 },
      ],
      modifierGroups: [
        {
          id: 'mod-cheese',
          name: 'Cheese Level',
          minSelection: 0,
          maxSelection: 1,
          options: [
            { id: 'opt-double-cheese', name: 'Double Cheddar', priceDelta: 5 },
            { id: 'opt-no-cheese', name: 'No Cheese', priceDelta: 0 },
          ],
        },
        {
          id: 'mod-custom',
          name: 'Special Request',
          minSelection: 0,
          maxSelection: 2,
          options: [
            { id: 'opt-no-onion', name: 'No Caramelized Onions', priceDelta: 0 },
            { id: 'opt-extra-truffle', name: 'Extra Truffle Aioli (+20ml)', priceDelta: 6 },
          ],
        },
      ],
    },
    {
      id: 'prod-brisket-burger',
      tenantId: 'tenant-sultan',
      categoryId: 'cat-burgers',
      name: '14-Hr Smoked Brisket Burger',
      description: 'Slow-smoked prime brisket slices, crunchy pickles, smoky BBQ glaze and melted Monterey Jack.',
      price: 54,
      costPrice: 16.5,
      isCombo: false,
      is86d: false,
      station: 'GRILL',
      recipe: [
        { ingredientId: 'ing-patty-angus', ingredientName: 'Black Angus Beef Patty (150g)', quantity: 1, uom: 'pcs', unitCost: 8.5 },
        { ingredientId: 'ing-bun-brioche', ingredientName: 'Golden Brioche Bun', quantity: 1, uom: 'pcs', unitCost: 1.8 },
        { ingredientId: 'ing-cheddar', ingredientName: 'Aged Cheddar Cheese Slice', quantity: 1, uom: 'pcs', unitCost: 1.2 },
      ],
    },
    {
      id: 'prod-truffle-combo',
      tenantId: 'tenant-sultan',
      categoryId: 'cat-combos',
      name: 'Truffle Master Combo Meal',
      description: 'Truffle Angus Burger served with hot Truffle Parmesan Fries and refillable craft fountain soda.',
      price: 68,
      costPrice: 18.2,
      isCombo: true,
      is86d: false,
      station: 'GRILL',
      recipe: [
        { ingredientId: 'ing-patty-angus', ingredientName: 'Black Angus Beef Patty (150g)', quantity: 1, uom: 'pcs', unitCost: 8.5 },
        { ingredientId: 'ing-bun-brioche', ingredientName: 'Golden Brioche Bun', quantity: 1, uom: 'pcs', unitCost: 1.8 },
        { ingredientId: 'ing-cheddar', ingredientName: 'Aged Cheddar Cheese Slice', quantity: 1, uom: 'pcs', unitCost: 1.2 },
        { ingredientId: 'ing-truffle-mayo', ingredientName: 'Black Truffle Aioli', quantity: 30, uom: 'ml', unitCost: 0.08 },
        { ingredientId: 'ing-potatoes', ingredientName: 'Skin-on Russet Fries', quantity: 180, uom: 'g', unitCost: 0.015 },
        { ingredientId: 'ing-soda-syrup', ingredientName: 'Fountain Soda Concentrate', quantity: 50, uom: 'ml', unitCost: 0.008 },
      ],
    },
    {
      id: 'prod-parm-fries',
      tenantId: 'tenant-sultan',
      categoryId: 'cat-sides',
      name: 'Truffle Parmesan Fries',
      description: 'Crisp golden russet fries tossed in black truffle oil, freshly shaved parmesan & fresh rosemary.',
      price: 24,
      costPrice: 5.6,
      isCombo: false,
      is86d: false,
      station: 'FRYER',
      recipe: [
        { ingredientId: 'ing-potatoes', ingredientName: 'Skin-on Russet Fries', quantity: 220, uom: 'g', unitCost: 0.015 },
        { ingredientId: 'ing-parmesan', ingredientName: 'Shaved Parmigiano-Reggiano', quantity: 20, uom: 'g', unitCost: 0.12 },
      ],
    },
    {
      id: 'prod-lemonade-mint',
      tenantId: 'tenant-sultan',
      categoryId: 'cat-drinks',
      name: 'Fresh Mint Lemonade',
      description: 'Handcrafted crushed Meyer lemons with bruised wild garden mint and pure cane syrup.',
      price: 18,
      costPrice: 3.2,
      isCombo: false,
      is86d: false,
      station: 'DRINKS',
      recipe: [
        { ingredientId: 'ing-lemon-mint', ingredientName: 'Fresh Mint & Meyer Lemons', quantity: 80, uom: 'g', unitCost: 0.025 },
      ],
    },
  ];

  public tables: RestaurantTable[] = [
    { id: 'tbl-1', tenantId: 'tenant-sultan', branchId: 'branch-olaya', number: 'T-01', section: 'MAIN_HALL', capacity: 4, status: 'FREE' },
    { id: 'tbl-2', tenantId: 'tenant-sultan', branchId: 'branch-olaya', number: 'T-02', section: 'MAIN_HALL', capacity: 2, status: 'OCCUPIED', activeOrderId: 'ord-101', assignedWaiter: 'Tariq Mansoor' },
    { id: 'tbl-3', tenantId: 'tenant-sultan', branchId: 'branch-olaya', number: 'T-03', section: 'MAIN_HALL', capacity: 6, status: 'BILL_REQUESTED', activeOrderId: 'ord-102', assignedWaiter: 'Fahad Al-Harbi' },
    { id: 'tbl-4', tenantId: 'tenant-sultan', branchId: 'branch-olaya', number: 'T-04', section: 'MAIN_HALL', capacity: 4, status: 'DIRTY' },
    { id: 'tbl-5', tenantId: 'tenant-sultan', branchId: 'branch-olaya', number: 'P-01', section: 'OUTDOOR_TERRACE', capacity: 4, status: 'FREE' },
    { id: 'tbl-6', tenantId: 'tenant-sultan', branchId: 'branch-olaya', number: 'P-02', section: 'OUTDOOR_TERRACE', capacity: 4, status: 'OCCUPIED', activeOrderId: 'ord-103', assignedWaiter: 'Tariq Mansoor' },
    { id: 'tbl-7', tenantId: 'tenant-sultan', branchId: 'branch-olaya', number: 'VIP-1', section: 'VIP_LOUNGE', capacity: 8, status: 'FREE' },
  ];

  public orders: Order[] = [
    {
      id: 'ord-101',
      tenantId: 'tenant-sultan',
      branchId: 'branch-olaya',
      orderNumber: '#4081',
      type: 'DINE_IN',
      tableId: 'tbl-2',
      tableName: 'T-02',
      customerName: 'Sultan Al-Otaibi',
      status: 'PREPARING',
      waiterName: 'Tariq Mansoor',
      cashierName: 'Ahmad Cashier',
      subtotal: 96,
      taxAmount: 14.4,
      discountAmount: 0,
      total: 110.4,
      items: [
        {
          id: 'item-1',
          productId: 'prod-truffle-angus',
          productName: 'Truffle Angus Burger',
          quantity: 2,
          unitPrice: 48,
          costPrice: 13.9,
          station: 'GRILL',
          modifiers: [{ groupId: 'mod-cheese', optionId: 'opt-double-cheese', name: 'Double Cheddar', price: 5 }],
          notes: 'Medium well, extra napkins',
          status: 'COOKING',
        },
      ],
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'ord-102',
      tenantId: 'tenant-sultan',
      branchId: 'branch-olaya',
      orderNumber: '#4080',
      type: 'DINE_IN',
      tableId: 'tbl-3',
      tableName: 'T-03',
      customerName: 'Khalid & Family',
      status: 'READY',
      waiterName: 'Fahad Al-Harbi',
      cashierName: 'Ahmad Cashier',
      subtotal: 116,
      taxAmount: 17.4,
      discountAmount: 10,
      total: 123.4,
      items: [
        {
          id: 'item-2',
          productId: 'prod-truffle-combo',
          productName: 'Truffle Master Combo Meal',
          quantity: 1,
          unitPrice: 68,
          costPrice: 18.2,
          station: 'GRILL',
          modifiers: [],
          status: 'READY',
        },
        {
          id: 'item-3',
          productId: 'prod-parm-fries',
          productName: 'Truffle Parmesan Fries',
          quantity: 2,
          unitPrice: 24,
          costPrice: 5.6,
          station: 'FRYER',
          modifiers: [],
          status: 'READY',
        },
      ],
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
  ];

  public suppliers: Supplier[] = [
    {
      id: 'sup-almarai',
      tenantId: 'tenant-sultan',
      name: 'Almarai Foodservice & Dairy',
      contactPerson: 'Ziad Nabil',
      phone: '+966 11 234 5678',
      email: 'orders@almarai-b2b.sa',
      category: 'Dairy & Cheese',
    },
    {
      id: 'sup-gourmet-meat',
      tenantId: 'tenant-sultan',
      name: 'Najd Prime Meat Wholesalers',
      contactPerson: 'Bandar Al-Shehri',
      phone: '+966 11 889 0011',
      email: 'sales@najdmeat.com',
      category: 'Halal Beef & Poultry',
    },
    {
      id: 'sup-bakery',
      tenantId: 'tenant-sultan',
      name: 'L’Artisan Artisan Bakery B2B',
      contactPerson: 'Marc Antoine',
      phone: '+966 11 999 4433',
      email: 'buns@lartisan.sa',
      category: 'Buns & Pastries',
    },
  ];

  public purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-1001',
      tenantId: 'tenant-sultan',
      branchId: 'branch-olaya',
      supplierId: 'sup-gourmet-meat',
      supplierName: 'Najd Prime Meat Wholesalers',
      poNumber: 'PO-2026-081',
      date: '2026-09-05',
      status: 'RECEIVED',
      items: [
        {
          ingredientId: 'ing-patty-angus',
          ingredientName: 'Black Angus Beef Patty (150g)',
          quantity: 100,
          uom: 'pcs',
          unitCost: 8.5,
          total: 850,
        },
      ],
      totalAmount: 850,
      receivedAt: '2026-09-06T14:30:00Z',
    },
  ];

  public journalEntries: JournalEntry[] = [
    {
      id: 'je-init-1',
      tenantId: 'tenant-sultan',
      branchId: 'branch-olaya',
      date: '2026-09-07',
      reference: 'INV-4079',
      description: 'POS Sales Receipt #4079 via Mada Card',
      lines: [
        { accountCode: '1020', accountName: 'Mada / Card Bank Clearing', debit: 92.0, credit: 0 },
        { accountCode: '4010', accountName: 'Food & Beverage Revenue', debit: 0, credit: 80.0 },
        { accountCode: '2200', accountName: 'ZATCA Output VAT 15%', debit: 0, credit: 12.0 },
      ],
    },
    {
      id: 'je-cogs-1',
      tenantId: 'tenant-sultan',
      branchId: 'branch-olaya',
      date: '2026-09-07',
      reference: 'COGS-4079',
      description: 'Automatic COGS Depletion for #4079',
      lines: [
        { accountCode: '5010', accountName: 'Cost of Goods Sold (BOM Food Cost)', debit: 24.5, credit: 0 },
        { accountCode: '1100', accountName: 'Raw Ingredient Inventory Asset', debit: 0, credit: 24.5 },
      ],
    },
  ];

  public shifts: Shift[] = [
    {
      id: 'shift-current',
      tenantId: 'tenant-sultan',
      branchId: 'branch-olaya',
      cashierName: 'Ahmad Cashier',
      openedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      startingFloat: 500,
      openingFloat: 500,
      cashSalesCollected: 480,
      expectedCash: 980,
      status: 'OPEN',
      totalSales: 2480,
      orderCount: 18,
    },
  ];

  // Helper Methods
  public getTenant(id: string): Tenant | undefined {
    return this.tenants.find((t) => t.id === id);
  }

  public getBranchesByTenant(tenantId: string): Branch[] {
    return this.branches.filter((b) => b.tenantId === tenantId);
  }

  public getProducts(tenantId: string): Product[] {
    return this.products.filter((p) => p.tenantId === tenantId);
  }

  public getIngredients(tenantId: string): Ingredient[] {
    return this.ingredients.filter((i) => i.tenantId === tenantId);
  }

  public getTables(tenantId: string, branchId: string): RestaurantTable[] {
    return this.tables.filter((t) => t.tenantId === tenantId && t.branchId === branchId);
  }

  public getOrders(tenantId: string, branchId: string): Order[] {
    return this.orders.filter((o) => o.tenantId === tenantId && o.branchId === branchId);
  }

  // Create new Order with Recipe BOM auto-deduction
  public createOrder(tenantId: string, branchId: string, payload: Partial<Order>): Order {
    const orderNumber = `#${4000 + this.orders.length + 1}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tenantId,
      branchId,
      orderNumber,
      type: payload.type || 'DINE_IN',
      tableId: payload.tableId,
      tableName: payload.tableName,
      customerName: payload.customerName || 'Guest Customer',
      status: payload.status || 'NEW',
      items: payload.items || [],
      subtotal: payload.subtotal || 0,
      taxAmount: payload.taxAmount || 0,
      discountAmount: payload.discountAmount || 0,
      total: payload.total || 0,
      notes: payload.notes,
      waiterName: payload.waiterName || 'POS Cashier',
      cashierName: payload.cashierName || 'POS Terminal 1',
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // If assigned to a table, update table status
    if (newOrder.tableId) {
      const table = this.tables.find((t) => t.id === newOrder.tableId);
      if (table) {
        table.status = 'OCCUPIED';
        table.activeOrderId = newOrder.id;
        table.assignedWaiter = newOrder.waiterName;
      }
    }

    // Automatically trigger recipe BOM inventory deduction
    this.deductInventoryForOrder(newOrder, branchId);

    return newOrder;
  }

  // Deduct ingredient inventory based on recipe BOM
  private deductInventoryForOrder(order: Order, branchId: string): number {
    let totalCogs = 0;

    for (const item of order.items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (!product || !product.recipe) continue;

      for (const recipeItem of product.recipe) {
        const ing = this.ingredients.find((i) => i.id === recipeItem.ingredientId);
        if (ing) {
          const qtyNeeded = recipeItem.quantity * item.quantity;
          const current = ing.currentStock[branchId] || 0;
          ing.currentStock[branchId] = Math.max(0, current - qtyNeeded);
          totalCogs += recipeItem.unitCost * qtyNeeded;
        }
      }
    }

    return totalCogs;
  }

  // Pay Order & Generate Accounting Journal
  public payOrder(
    orderId: string,
    paymentMethod: 'CASH' | 'MADA' | 'VISA' | 'APPLE_PAY' | 'SPLIT',
    paymentBreakdown?: Record<string, number>
  ): { success: boolean; order?: Order; journalEntry?: JournalEntry } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false };

    order.status = 'PAID';
    order.paymentMethod = paymentMethod;
    order.paymentBreakdown = paymentBreakdown;
    order.paidAt = new Date().toISOString();

    // Free table if dine in
    if (order.tableId) {
      const tbl = this.tables.find((t) => t.id === order.tableId);
      if (tbl) {
        tbl.status = 'DIRTY';
        tbl.activeOrderId = undefined;
      }
    }

    // Generate Double-Entry Accounting Journal
    const tenant = this.getTenant(order.tenantId);
    const accountCode = paymentMethod === 'CASH' ? '1010' : '1020';
    const accountName = paymentMethod === 'CASH' ? 'Cash in Register Till' : `${paymentMethod} Merchant Clearing`;

    const salesEntry: JournalEntry = {
      id: `je-sale-${Date.now()}`,
      tenantId: order.tenantId,
      branchId: order.branchId,
      date: new Date().toISOString().split('T')[0],
      reference: `RCPT-${order.orderNumber}`,
      description: `Sale Receipt for ${order.orderNumber} via ${paymentMethod}`,
      lines: [
        { accountCode, accountName, debit: order.total, credit: 0 },
        { accountCode: '4010', accountName: 'Food & Beverage Sales Revenue', debit: 0, credit: order.subtotal - order.discountAmount },
        { accountCode: '2200', accountName: `${tenant?.taxName || 'Output Tax'} Payable`, debit: 0, credit: order.taxAmount },
      ],
    };
    this.journalEntries.unshift(salesEntry);

    // Also update shift
    const openShift = this.shifts.find((s) => s.branchId === order.branchId && s.status === 'OPEN');
    if (openShift) {
      openShift.totalSales += order.total;
      openShift.orderCount += 1;
      if (paymentMethod === 'CASH') {
        openShift.expectedCash += order.total;
      }
    }

    return { success: true, order, journalEntry: salesEntry };
  }

  // Bump KDS Order or Item
  public bumpOrderStatus(orderId: string, nextStatus: 'PREPARING' | 'READY' | 'SERVED'): Order | undefined {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    order.status = nextStatus;
    // update items status as well
    order.items.forEach((item) => {
      if (nextStatus === 'PREPARING') item.status = 'COOKING';
      if (nextStatus === 'READY') item.status = 'READY';
      if (nextStatus === 'SERVED') item.status = 'SERVED';
    });
    return order;
  }

  // Receive Purchase Order into Inventory
  public receivePurchaseOrder(poId: string): PurchaseOrder | undefined {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'RECEIVED') return po;

    po.status = 'RECEIVED';
    po.receivedAt = new Date().toISOString();

    // Automatically increase stock
    for (const item of po.items) {
      const ing = this.ingredients.find((i) => i.id === item.ingredientId);
      if (ing) {
        const current = ing.currentStock[po.branchId] || 0;
        ing.currentStock[po.branchId] = current + item.quantity;
      }
    }

    // Journal Entry for Inventory Receipt & Accounts Payable
    this.journalEntries.unshift({
      id: `je-grn-${Date.now()}`,
      tenantId: po.tenantId,
      branchId: po.branchId,
      date: new Date().toISOString().split('T')[0],
      reference: `GRN-${po.poNumber}`,
      description: `Goods Received Note: ${po.supplierName}`,
      lines: [
        { accountCode: '1100', accountName: 'Raw Ingredient Inventory Asset', debit: po.totalAmount, credit: 0 },
        { accountCode: '2010', accountName: `Accounts Payable - ${po.supplierName}`, debit: 0, credit: po.totalAmount },
      ],
    });

    return po;
  }

  // Create new tenant (SaaS multi-tenant onboarding)
  public createTenant(name: string, country: string, currency: string, taxRatePct: number, branchName: string): Tenant {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tenantId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id: tenantId,
      name,
      slug,
      country,
      currency,
      taxRatePct,
      taxName: `${country} VAT ${taxRatePct}%`,
      createdAt: new Date().toISOString(),
    };
    this.tenants.push(newTenant);

    const branchId = `branch-${Date.now()}`;
    this.branches.push({
      id: branchId,
      tenantId,
      name: branchName,
      code: `${country.slice(0, 3).toUpperCase()}-01`,
      city: 'Capital City',
      address: 'Main Commercial Avenue',
      phone: '+966 50 000 0000',
      isActive: true,
    });

    // Seed default categories and tables for the new tenant
    this.categories.push(
      { id: `cat-${Date.now()}-1`, tenantId, name: 'Main Courses', icon: 'Utensils', displayOrder: 1 },
      { id: `cat-${Date.now()}-2`, tenantId, name: 'Beverages', icon: 'Coffee', displayOrder: 2 }
    );

    for (let i = 1; i <= 6; i++) {
      this.tables.push({
        id: `tbl-${Date.now()}-${i}`,
        tenantId,
        branchId,
        number: `T-${i < 10 ? '0' + i : i}`,
        section: i <= 4 ? 'MAIN_HALL' : 'OUTDOOR_TERRACE',
        capacity: i % 2 === 0 ? 4 : 2,
        status: 'FREE',
      });
    }

    return newTenant;
  }
}

export const db = new RestaurantDatabase();
