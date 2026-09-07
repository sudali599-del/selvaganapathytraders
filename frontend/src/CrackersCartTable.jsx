import React, { useState, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, ShoppingBag, Search, Sparkles, Flame, Rocket, Package, Check, Filter } from "lucide-react";
import generateBill from "./generateBill.js";

const CATEGORY_META = {
  'ONE SOUND CRACKERS': { icon: '💥', color: 'from-red-600 via-rose-600 to-orange-600', badge: 'Classic Sound' },
  'FLOWER POTS': { icon: '🌸', color: 'from-amber-500 via-orange-600 to-rose-600', badge: 'Color Fountains' },
  'GROUND CHAKKAR': { icon: '🌀', color: 'from-emerald-500 via-teal-600 to-cyan-600', badge: 'Spinning Wheels' },
  'ROCKETS': { icon: '🚀', color: 'from-blue-600 via-indigo-600 to-purple-600', badge: 'Sky High' },
  'TWINKLING STAR': { icon: '⭐', color: 'from-yellow-400 via-amber-500 to-orange-500', badge: 'Twinkling Lights' },
  'ELECTRIC CRACKERS': { icon: '⚡', color: 'from-red-600 via-pink-600 to-purple-600', badge: 'High Decibel' },
  'DELUXE CRACKERS': { icon: '👑', color: 'from-purple-600 via-pink-600 to-rose-600', badge: 'Deluxe Sound' },
  'SPECIAL GARLANDS': { icon: '🎊', color: 'from-red-700 via-orange-600 to-yellow-500', badge: 'Festive Walas' },
  'BIJILI': { icon: '✨', color: 'from-pink-500 via-rose-600 to-red-600', badge: 'Party Strips' },
  'BOMBS': { icon: '💣', color: 'from-red-600 via-orange-600 to-amber-600', badge: 'Mega Blasts' },
  'PENCIL': { icon: '✏️', color: 'from-cyan-500 via-blue-600 to-indigo-600', badge: 'Color Candles' },
  'SPARKLERS': { icon: '🎇', color: 'from-amber-400 via-orange-500 to-red-500', badge: 'Family Favorite' },
  'FANCY FOUNTAINS': { icon: '⛲', color: 'from-fuchsia-600 via-purple-600 to-indigo-600', badge: 'Magic Fountains' },
  'MUSICAL ITEMS': { icon: '🎵', color: 'from-violet-600 via-purple-600 to-pink-600', badge: 'Whistle & Sound' },
  'AERIAL FANCY': { icon: '🎆', color: 'from-indigo-600 via-blue-600 to-cyan-600', badge: 'Sky Shots' },
  'AERIAL FANCY SHOTS': { icon: '🌌', color: 'from-purple-700 via-indigo-700 to-blue-700', badge: 'Multi Aerial' },
  'AERIAL MULTI SHOTS FANCY': { icon: '🌠', color: 'from-pink-600 via-purple-600 to-indigo-600', badge: 'Grand Fireworks' },
  'SPECIAL FANCY FOUNTAIN': { icon: '🌺', color: 'from-rose-600 via-pink-600 to-purple-600', badge: 'Cascade Fountains' },
  'SPECIAL FOUNTAINS': { icon: '⛲', color: 'from-emerald-600 via-teal-600 to-blue-600', badge: 'Special Show' },
  'NEW ARRIVAL FOUNTAINS': { icon: '🌟', color: 'from-amber-500 via-orange-500 to-red-600', badge: '2026 Arrivals' },
  'CHILDRENS FANCY': { icon: '🎈', color: 'from-lime-500 via-emerald-600 to-teal-600', badge: 'Kids Safe Fun' },
  'CAPS & SERPENT': { icon: '🎯', color: 'from-red-600 via-pink-600 to-rose-600', badge: 'Caps & Serpents' },
  'GIFT BOXES': { icon: '🎁', color: 'from-yellow-500 via-amber-600 to-orange-600', badge: 'Diwali Combo Packs' }
};

const productTypes = Object.keys(CATEGORY_META);

const CrackersCartTable = ({
  products,
  quantities,
  updateQuantity,
  setQuantityForId,
  isLoading,
  error,
  showModal,
  setShowModal,
}) => {
  const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [searchQueryByName, setSearchQueryByName] = useState("");
  const [searchQueryBySno, setSearchQueryBySno] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'compact'

  const groupByCategory = (productsList) => {
    const list = productsList || [];
    const grouped = list.reduce((acc, product) => {
      const category = product.productType || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});

    const orderedGrouped = {};
    productTypes.forEach((type) => {
      if (grouped[type]) {
        orderedGrouped[type] = grouped[type];
      }
    });

    Object.keys(grouped).forEach((category) => {
      if (!productTypes.includes(category)) {
        orderedGrouped[category] = grouped[category];
      }
    });

    return orderedGrouped;
  };

  const calculateTotal = (price, quantity) => {
    return ((price || 0) * (quantity || 0)).toFixed(2);
  };

  const getTotalItems = () => {
    return Object.values(quantities || {}).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  const calculateGrandTotal = () => {
    return (products || [])
      .reduce((total, item) => {
        const quantity = (quantities && quantities[item._id]) || 0;
        const price = item.discountedPrice || item.actualPrice || 0;
        return total + price * quantity;
      }, 0)
      .toFixed(2);
  };

  const getDiscountedTotal = () => {
    const total = parseFloat(calculateGrandTotal()) || 0;
    return (total * (1 - (cartDiscount || 0) / 100)).toFixed(2);
  };

  const getSelectedItems = () => {
    return (products || []).filter((item) => quantities && quantities[item._id] > 0);
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      return;
    }
    setPhoneError("");

    const selected = getSelectedItems();
    if (selected.length === 0) {
      alert("Please select at least one item to generate the bill.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address to receive the PDF.");
      return;
    }

    setLoading(true);
    try {
      const productsWithQuantities = selected.map((product) => ({
        ...product,
        selectedQuantity: quantities[product._id] || 0,
      }));

      const pdfBlob = await generateBill(
        productsWithQuantities,
        phone,
        email,
        discountApplied ? cartDiscount : 0
      );

      if (email && pdfBlob) {
        try {
          const formData = new FormData();
          formData.append("file", pdfBlob, `bill_${phone}_${Date.now()}.pdf`);
          formData.append("email", email);

          const serverUrl = import.meta.env.VITE_SERVER_URL || 'https://fireworksserverref.vercel.app';
          const emailResponse = await fetch(`${serverUrl}/mail/send-pdf`, {
            method: "POST",
            body: formData,
          });

          if (emailResponse.ok) {
            alert("Bill generated and sent to your email successfully!");
          } else {
            alert("Bill generated and downloaded! (Email service notice)");
          }
        } catch (emailError) {
          console.warn("Email sending error:", emailError);
          alert("Bill generated and downloaded successfully!");
        }
      } else {
        alert("Bill generated and downloaded successfully!");
      }

      setShowModal(false);
      setPhone("");
      setEmail("");
      Object.keys(quantities).forEach((id) => setQuantityForId(id, 0));
    } catch (err) {
      console.error("Bill generation error:", err);
      alert("Failed to generate bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search & selected category
  const filteredProducts = products.filter((product, index) => {
    const nameQuery = searchQueryByName.toLowerCase();
    const snoQuery = searchQueryBySno.toLowerCase();

    const matchesName =
      product.name.toLowerCase().includes(nameQuery) ||
      (product.productDescription &&
        product.productDescription.toLowerCase().includes(nameQuery));

    const matchesSno =
      snoQuery === "" || (product.sno || index + 1).toString().includes(snoQuery);

    const matchesCategory =
      selectedCategory === "ALL" || product.productType === selectedCategory;

    return matchesName && matchesSno && matchesCategory;
  });

  const categorizedProducts = groupByCategory(filteredProducts);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent shadow-xl"></div>
        <p className="text-yellow-300 font-bold text-lg animate-pulse">Loading Fireworks Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-8 bg-red-950/40 rounded-2xl border border-red-500/30 p-6">
        <p className="font-bold text-lg">Error loading products</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* 1. TOP CONTROL BAR: SEARCH & FILTERS CONTAINER */}
      <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-950/80 backdrop-blur-xl border border-white/20 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Dual Search Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-2/3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400" size={18} />
              <input
                type="text"
                value={searchQueryByName}
                onChange={(e) => setSearchQueryByName(e.target.value)}
                placeholder="🔍 Search crackers by name..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-gray-400 rounded-2xl border border-white/20 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/40 focus:outline-none transition-all duration-200 text-sm font-medium"
              />
              {searchQueryByName && (
                <button
                  onClick={() => setSearchQueryByName("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold text-xs bg-yellow-400/20 px-1.5 py-0.5 rounded">
                #
              </span>
              <input
                type="text"
                value={searchQueryBySno}
                onChange={(e) => setSearchQueryBySno(e.target.value)}
                placeholder="Filter by S.No (1-167)..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-gray-400 rounded-2xl border border-white/20 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/40 focus:outline-none transition-all duration-200 text-sm font-medium"
              />
              {searchQueryBySno && (
                <button
                  onClick={() => setSearchQueryBySno("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats & View Mode Toggle */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-xs sm:text-sm text-gray-300 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Showing <strong>{filteredProducts.length}</strong> items</span>
            </div>

            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  viewMode === "cards"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  viewMode === "compact"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Quick-Nav Pills */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-transparent">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
              selectedCategory === "ALL"
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-yellow-300 shadow-lg shadow-yellow-500/20 scale-105"
                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/15"
            }`}
          >
            🔥 All Categories ({products.length})
          </button>
          {productTypes.map((cat) => {
            const meta = CATEGORY_META[cat] || { icon: '💥' };
            const count = products.filter((p) => p.productType === cat).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white border-pink-400 shadow-lg shadow-pink-500/30 scale-105"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/15 hover:text-white"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{cat}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CATEGORY CONTAINERS */}
      {Object.keys(categorizedProducts).length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
          <p className="text-xl text-gray-300 font-bold mb-2">No crackers found matching your filter</p>
          <p className="text-sm text-gray-400 mb-4">Try clearing your search query or selecting another category.</p>
          <button
            onClick={() => {
              setSearchQueryByName("");
              setSearchQueryBySno("");
              setSelectedCategory("ALL");
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        Object.entries(categorizedProducts).map(([category, catProducts]) => {
          const meta = CATEGORY_META[category] || {
            icon: '💥',
            color: 'from-pink-600 to-purple-600',
            badge: 'Crackers'
          };
          const categorySelectedCount = catProducts.reduce(
            (sum, item) => sum + (quantities[item._id] || 0),
            0
          );

          return (
            <div
              key={category}
              id={`cat-${category.replace(/[^a-zA-Z0-9]/g, '-')}`}
              className="bg-gradient-to-b from-slate-900/90 via-purple-950/60 to-slate-950/90 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-pink-500/40"
            >
              {/* Category Container Header */}
              <div className={`bg-gradient-to-r ${meta.color} p-4 md:p-5 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg border-b border-white/20`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl bg-black/30 p-2.5 rounded-2xl backdrop-blur-sm border border-white/20 shadow-inner">
                    {meta.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg md:text-xl font-extrabold tracking-wide uppercase">
                        {category}
                      </h3>
                      <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
                        {meta.badge}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 font-medium mt-0.5">
                      {catProducts.length} Premium Fireworks in this category
                    </p>
                  </div>
                </div>

                {categorySelectedCount > 0 && (
                  <div className="bg-yellow-400 text-black px-3.5 py-1 rounded-full text-xs font-extrabold shadow-lg animate-pulse flex items-center gap-1.5">
                    <Check size={14} />
                    <span>{categorySelectedCount} In Cart</span>
                  </div>
                )}
              </div>

              {/* Category Products Container Grid / List */}
              <div className="p-4 md:p-6">
                {viewMode === "cards" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {catProducts.map((item) => {
                      const qty = quantities[item._id] || 0;
                      const itemTotal = (item.actualPrice * qty).toFixed(2);
                      const isSelected = qty > 0;

                      return (
                        <div
                          key={item._id}
                          className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between border ${
                            isSelected
                              ? "bg-gradient-to-b from-purple-900/60 via-indigo-900/50 to-pink-950/60 border-pink-500/70 shadow-lg shadow-pink-500/10 scale-[1.02]"
                              : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/25"
                          }`}
                        >
                          {/* Top Row: S.No & Unit Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-2 py-0.5 rounded-lg shadow-sm">
                              #{item.sno || item._id}
                            </span>
                            <span className="text-[11px] font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                              {item.per || '1 Box'}
                            </span>
                          </div>

                          {/* Product Title */}
                          <div className="mb-3">
                            <h4 className="text-white font-bold text-base leading-snug break-words">
                              {item.name}
                            </h4>
                            {item.productDescription && (
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                {item.productDescription}
                              </p>
                            )}
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="pt-3 border-t border-white/10 mt-auto space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">Price</span>
                                <span className="text-lg font-extrabold text-green-400">
                                  ₹{Number(item.actualPrice).toFixed(2)}
                                </span>
                              </div>

                              {isSelected && (
                                <div className="text-right">
                                  <span className="text-[10px] uppercase tracking-wider text-yellow-400 block font-bold">Subtotal</span>
                                  <span className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
                                    ₹{itemTotal}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Quantity Stepper */}
                            <div className="flex items-center justify-between gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
                              <button
                                onClick={() => setQuantityForId(item._id, Math.max(0, qty - 1))}
                                className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-600 to-red-600 text-white flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all shadow"
                              >
                                <Minus size={14} />
                              </button>

                              <input
                                type="text"
                                value={qty.toString()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^\d+$/.test(val)) {
                                    setQuantityForId(item._id, parseInt(val, 10) || 0);
                                  }
                                }}
                                className="w-12 text-center bg-transparent text-white font-extrabold text-base focus:outline-none"
                              />

                              <button
                                onClick={() => setQuantityForId(item._id, qty + 1)}
                                className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all shadow"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Compact List View */
                  <div className="space-y-2">
                    {catProducts.map((item) => {
                      const qty = quantities[item._id] || 0;
                      const itemTotal = (item.actualPrice * qty).toFixed(2);
                      const isSelected = qty > 0;

                      return (
                        <div
                          key={item._id}
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                            isSelected
                              ? "bg-purple-950/60 border-pink-500/50"
                              : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-xs font-extrabold bg-yellow-400 text-black px-2 py-0.5 rounded-lg flex-shrink-0">
                              #{item.sno || item._id}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                              <span className="text-xs text-gray-400">{item.per || '1 Box'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <span className="text-sm font-bold text-green-400 min-w-[70px] text-right">
                              ₹{Number(item.actualPrice).toFixed(2)}
                            </span>

                            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                              <button
                                onClick={() => setQuantityForId(item._id, Math.max(0, qty - 1))}
                                className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="text"
                                value={qty.toString()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^\d+$/.test(val)) {
                                    setQuantityForId(item._id, parseInt(val, 10) || 0);
                                  }
                                }}
                                className="w-10 text-center bg-transparent text-white font-bold text-sm focus:outline-none"
                              />
                              <button
                                onClick={() => setQuantityForId(item._id, qty + 1)}
                                className="w-7 h-7 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <span className="text-sm font-extrabold text-yellow-400 min-w-[80px] text-right">
                              ₹{itemTotal}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* 3. CHECKOUT & BILL GENERATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 rounded-3xl shadow-2xl w-full max-w-xl border border-pink-500/30 overflow-hidden relative my-8">
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={24} />
                <h3 className="text-xl font-bold">Your Crackers Order Cart</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Selected Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {getSelectedItems().map((item) => {
                  const qty = quantities[item._id];
                  return (
                    <div
                      key={item._id}
                      className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs text-gray-200"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[11px] text-gray-400">
                          ₹{item.actualPrice} × {qty}
                        </span>
                      </div>
                      <span className="font-extrabold text-green-400 text-sm">
                        ₹{(item.actualPrice * qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Order Totals Summary */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Total Selected Items:</span>
                  <span className="font-bold text-white">{getTotalItems()} Items</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Grand Total:</span>
                  <span className="text-yellow-400 text-xl">₹{calculateGrandTotal()}</span>
                </div>
              </div>

              {/* Customer Contact Form */}
              <form onSubmit={handleGenerateBill} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                    Phone Number (Required) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:border-pink-400 text-sm"
                    required
                  />
                  {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                    Email Address (Optional - for instant PDF receipt)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:border-pink-400 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-3 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generate Bill PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrackersCartTable;
