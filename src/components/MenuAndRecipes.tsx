import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Flame,
  Utensils,
  Layers,
  Sparkles,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { Product, Category, Tenant } from '../types/restaurant';

interface MenuAndRecipesProps {
  tenant: Tenant;
  categories: Category[];
  products: Product[];
  onToggle86: (productId: string) => void;
}

export const MenuAndRecipes: React.FC<MenuAndRecipesProps> = ({
  tenant,
  categories,
  products,
  onToggle86,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(products[0] || null);

  const filtered = products.filter((p) => selectedCat === 'ALL' || p.categoryId === selectedCat);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] overflow-hidden">
      {/* Left: Products Catalog & 86'd Toggle */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold text-white">Menu & Recipes (BOM)</h2>
            </div>
            <p className="text-xs text-slate-400">
              {products.length} Items • Recipe Bill of Materials & 86 Availability Control
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCat('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedCat === 'ALL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedCat === c.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {filtered.map((product) => {
            const margin = product.price - product.costPrice;
            const foodCostPct = product.price > 0 ? (product.costPrice / product.price) * 100 : 0;
            const isSelected = inspectingProduct?.id === product.id;

            return (
              <div
                key={product.id}
                onClick={() => setInspectingProduct(product)}
                className={`p-3 rounded-xl border transition flex flex-wrap items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{product.name}</h4>
                    {product.isCombo && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        Combo
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {product.station}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{product.description}</p>
                </div>

                {/* Price, Cost & Margin Metrics */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block font-sans">Selling Price</span>
                    <span className="font-extrabold text-amber-400">
                      {(product.price ?? 0).toFixed(2)} {tenant.currency}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block font-sans">BOM Cost</span>
                    <span className="font-bold text-slate-300">
                      {(product.costPrice ?? 0).toFixed(2)} {tenant.currency}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block font-sans">Food Cost %</span>
                    <span
                      className={`font-bold ${
                        foodCostPct > 35 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {(foodCostPct ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 86'd Out-of-stock toggle */}
                <div
                  className="flex items-center gap-2 border-l border-slate-800 pl-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    className={`text-[11px] font-bold ${
                      product.is86d ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {product.is86d ? "86'd (Out)" : 'Available'}
                  </span>
                  <button
                    onClick={() => onToggle86(product.id)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Toggle 86 availability in POS and QR menu"
                  >
                    {product.is86d ? (
                      <ToggleLeft className="w-6 h-6 text-rose-500" />
                    ) : (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Recipe / BOM Inspector */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {inspectingProduct ? (
          <>
            <div className="p-4 border-b border-slate-800 bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Recipe & Bill of Materials (BOM)
              </span>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                {inspectingProduct.name}
              </h3>
              <p className="text-xs text-slate-400">
                Ingredients deducted automatically on every order
              </p>
            </div>

            {/* Recipe Ingredients Breakdown */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ingredient Composition
                </span>

                {inspectingProduct.recipe && inspectingProduct.recipe.length > 0 ? (
                  inspectingProduct.recipe.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{r.ingredientName}</div>
                        <div className="text-[11px] text-slate-400">
                          Usage: <span className="text-amber-400 font-bold">{r.quantity} {r.uom}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-300 font-mono font-bold">
                          {((r.unitCost ?? 0) * (r.quantity ?? 0)).toFixed(2)} {tenant.currency}
                        </span>
                        <span className="text-[10px] block text-slate-500">
                          @{r.unitCost}/{r.uom}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No recipe ingredients assigned</p>
                )}
              </div>

              {/* Financial Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Unit Economics
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selling Price:</span>
                  <span className="font-bold text-white">
                    {(inspectingProduct.price ?? 0).toFixed(2)} {tenant.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Ingredient Cost:</span>
                  <span className="font-bold text-rose-400">
                    -{(inspectingProduct.costPrice ?? 0).toFixed(2)} {tenant.currency}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-400 font-bold">
                  <span>Gross Profit Contribution:</span>
                  <span>
                    +{((inspectingProduct.price ?? 0) - (inspectingProduct.costPrice ?? 0)).toFixed(2)}{' '}
                    {tenant.currency}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-slate-500 text-xs text-center">
            Select an item from the menu to inspect its Recipe BOM
          </div>
        )}
      </div>
    </div>
  );
};
