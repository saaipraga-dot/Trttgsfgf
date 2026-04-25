/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Baby, 
  Package, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  AlertCircle, 
  ChevronRight, 
  Settings,
  LayoutDashboard,
  Box,
  Heart,
  Droplets,
  Shirt,
  Stethoscope,
  MoreHorizontal,
  LucideIcon,
  Zap,
  History,
  Tag,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem, Category, Assignment, FeedingLog, FeedType, CategoryInfo, SharedData } from './types';

// Map icon names to components
const ICON_MAP: Record<string, LucideIcon> = {
  Droplets, Heart, Shirt, Stethoscope, Package, MoreHorizontal, Baby, ShoppingCart, Zap, History, Tag, Box, LayoutDashboard, Clock
};

// Mock initial data
const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Size 1 Diapers', category: 'Diapers', currentCount: 45, minThreshold: 20, assignment: 'Both', unit: 'ct', updatedAt: Date.now(), imageUrl: 'https://images.unsplash.com/photo-1594833297330-80d88574c3d9?w=200&h=200&fit=crop' },
  { id: '2', name: 'Hypoallergenic Formula', category: 'Feeding', currentCount: 2, minThreshold: 5, assignment: 'Baby A', unit: 'cans', updatedAt: Date.now(), imageUrl: 'https://images.unsplash.com/photo-1555529731-118a0ea6733f?w=200&h=200&fit=crop' },
  { id: '3', name: 'Standard Formula', category: 'Feeding', currentCount: 8, minThreshold: 5, assignment: 'Baby B', unit: 'cans', updatedAt: Date.now(), imageUrl: 'https://images.unsplash.com/photo-1555529731-118a0ea6733f?w=200&h=200&fit=crop' },
  { id: '4', name: 'Cotton Onesies (0-3m)', category: 'Clothing', currentCount: 12, minThreshold: 6, assignment: 'Both', unit: 'pcs', updatedAt: Date.now(), imageUrl: 'https://images.unsplash.com/photo-1522771917583-244a1e78077e?w=200&h=200&fit=crop' },
];

interface CategoryConfig {
  name: Category;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  shadowColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  { name: 'Diapers', icon: Droplets, color: 'sky-400', borderColor: 'sky-100', shadowColor: 'sky-50' },
  { name: 'Feeding', icon: Heart, color: 'pink-400', borderColor: 'pink-100', shadowColor: 'pink-50' },
  { name: 'Clothing', icon: Shirt, color: 'amber-400', borderColor: 'amber-100', shadowColor: 'amber-50' },
  { name: 'Health', icon: Stethoscope, color: 'emerald-400', borderColor: 'emerald-100', shadowColor: 'emerald-50' },
  { name: 'Gear', icon: Package, color: 'indigo-500', borderColor: 'indigo-100', shadowColor: 'indigo-50' },
  { name: 'Other', icon: MoreHorizontal, color: 'slate-400', borderColor: 'slate-100', shadowColor: 'slate-50' },
];

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'shopping' | 'feeding' | 'settings'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch data from server
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data: SharedData = await res.json();
      setItems(data.items);
      setCategories(data.categories);
      setFeedingLogs(data.feedingLogs || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save all shared data to server
  const saveToServer = async (updates: Partial<SharedData>) => {
    const freshData: SharedData = {
      items: updates.items ?? items,
      categories: updates.categories ?? categories,
      feedingLogs: updates.feedingLogs ?? feedingLogs,
    };
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(freshData),
      });
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateCount = (id: string, delta: number) => {
    const updated = items.map(item => 
      item.id === id 
        ? { ...item, currentCount: Math.max(0, item.currentCount + delta), updatedAt: Date.now() }
        : item
    );
    setItems(updated);
    saveToServer({ items: updated });
  };

  const addItem = (newItem: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: Math.random().toString(36).substring(7),
      updatedAt: Date.now(),
    };
    const updated = [...items, item];
    setItems(updated);
    saveToServer({ items: updated });
    setIsAddModalOpen(false);
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      saveToServer({ items: updated });
    }
  };

  // Feeding Log Logic
  const addFeedingLog = (baby: 'Baby A' | 'Baby B', type: FeedType) => {
    const now = Date.now();
    const newLog: FeedingLog = {
      id: Math.random().toString(36).substring(7),
      baby,
      timestamp: now,
      nextFeedAt: now + (3 * 60 * 60 * 1000), // Default 3 hours
      type
    };
    const updated = [newLog, ...feedingLogs].slice(0, 50); // Keep last 50
    setFeedingLogs(updated);
    saveToServer({ feedingLogs: updated });
  };

  // Category Logic
  const addCategory = (name: string) => {
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    const newCat: CategoryInfo = {
      name,
      icon: 'Tag',
      color: 'slate-400',
      borderColor: 'slate-100',
      shadowColor: 'slate-50'
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveToServer({ categories: updated });
  };

  const removeCategory = (name: string) => {
    if (confirm(`Remove category "${name}"? Items in this category will stay but lose their tag.`)) {
      const updated = categories.filter(c => c.name !== name);
      setCategories(updated);
      saveToServer({ categories: updated });
    }
  };

  const lowStockItems = useMemo(() => items.filter(i => i.currentCount <= i.minThreshold), [items]);

  return (
    <div className="min-h-screen bg-amber-50 text-slate-800 font-sans pb-28">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b-2 border-amber-200 z-40 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md">
            <Baby size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">CHOTU & MOTTU</h1>
            <p className="text-indigo-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">Inventory Command Center</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-pink-400 text-white px-4 py-2 rounded-xl shadow-md border-b-2 border-pink-600 active:translate-y-0.5 active:border-b-0 transition-all flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[3px]" />
          <span className="font-black text-[10px] uppercase">Add</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Syncing Command Center...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {/* Feeding Alert Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Baby A', 'Baby B'].map((babyId) => {
                  const lastFeed = feedingLogs.find(l => l.baby === babyId);
                  const isChotu = babyId === 'Baby A';
                  const name = isChotu ? 'Chotu' : 'Mottu';
                  const color = isChotu ? 'sky' : 'pink';
                  const nextFeed = lastFeed ? lastFeed.nextFeedAt : null;
                  const isUrgent = nextFeed ? Date.now() > nextFeed : false;

                  return (
                    <div key={babyId} className={`p-5 bg-white border-4 ${isUrgent ? 'border-rose-400 animate-pulse' : `border-${color}-100`} rounded-[2rem] shadow-xl`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black text-${color}-600 uppercase tracking-widest bg-${color}-50 px-3 py-1 rounded-full`}>{name}</span>
                        <Clock size={16} className={isUrgent ? 'text-rose-500' : 'text-slate-300'} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Feeding Target</p>
                        <div className="text-2xl font-black text-slate-800 italic">
                          {nextFeed ? new Date(nextFeed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOT LOGGED'}
                        </div>
                        {isUrgent && <p className="text-[10px] font-black text-rose-500 uppercase italic">Urgent: Past Due!</p>}
                      </div>
                      <button 
                        onClick={() => setActiveTab('feeding')}
                        className={`w-full mt-4 py-2 bg-${color}-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md border-b-4 border-${color}-700 active:translate-y-1 active:border-b-0`}
                      >
                        LOG FEED
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quick Summary */}
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-lg relative overflow-hidden group">
                  <div className="relative z-10">
                    <h2 className="text-slate-400 font-black uppercase tracking-widest text-[8px] mb-1">Status</h2>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-800 italic">{lowStockItems.length}</span>
                      <span className="text-rose-500 font-black uppercase text-[8px] italic tracking-tight leading-none">Need Buy</span>
                    </div>
                  </div>
                  <AlertCircle className="absolute -right-3 -bottom-3 text-slate-50 size-16 group-hover:text-rose-50 transition-colors" />
                </div>

                <div className="bg-indigo-600 p-4 rounded-3xl shadow-lg relative overflow-hidden text-white flex flex-col justify-center">
                  <div className="relative z-10">
                    <h2 className="text-indigo-200 font-black uppercase tracking-widest text-[8px] mb-1">Health</h2>
                    <span className="text-xl font-black italic">OPTIMAL</span>
                  </div>
                </div>
              </div>

              {/* Twin Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-2xl border-2 border-sky-100 shadow-md flex flex-col items-center">
                  <span className="text-[8px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded-full mb-1">Chotu</span>
                  <div className="text-2xl font-black text-slate-800">
                    {items.filter(i => i.assignment === 'Baby A' && i.currentCount <= i.minThreshold).length}
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Alerts</p>
                </div>
                <div className="p-3 bg-white rounded-2xl border-2 border-pink-100 shadow-md flex flex-col items-center">
                  <span className="text-[8px] font-black text-pink-600 uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded-full mb-1">Mottu</span>
                  <div className="text-2xl font-black text-slate-800">
                    {items.filter(i => i.assignment === 'Baby B' && i.currentCount <= i.minThreshold).length}
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Alerts</p>
                </div>
              </div>

              {/* Low Stock List */}
              <section className="bg-white rounded-3xl border-2 border-slate-100 p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                     <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                     URGENT
                  </h2>
                  <button onClick={() => setActiveTab('shopping')} className="text-indigo-600 font-black text-[9px] uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg">
                    Full List
                  </button>
                </div>
                <div className="space-y-2">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.slice(0, 3).map(item => (
                      <InventoryCard key={item.id} item={item} onUpdate={updateCount} />
                    ))
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-black italic uppercase tracking-widest text-[9px]">All clear!</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {categories.map(category => {
                const categoryItems = items.filter(i => i.category === category.name);
                if (categoryItems.length === 0) return null;
                const Icon = ICON_MAP[category.icon] || Tag;
                return (
                  <div key={category.name} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-white border-2 border-${category.borderColor} rounded-lg shadow-sm`}>
                        <Icon size={16} className={`text-${category.color}`} />
                      </div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{category.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {categoryItems.map(item => (
                        <InventoryCard key={item.id} item={item} onUpdate={updateCount} onDelete={deleteItem} showDelete categories={categories} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'feeding' && (
            <motion.div
              key="feeding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border-4 border-indigo-100 shadow-xl">
                 <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">FEEDING PROTOCOL</h2>
                 <History size={24} className="text-indigo-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['Baby A', 'Baby B'].map(babyId => {
                  const isChotu = babyId === 'Baby A';
                  const name = isChotu ? 'Chotu' : 'Mottu';
                  const color = isChotu ? 'sky' : 'pink';

                  return (
                    <div key={babyId} className="space-y-4">
                      <div className={`p-4 bg-white rounded-2xl border-4 border-${color}-100 shadow-md`}>
                        <h4 className={`font-black text-${color}-600 uppercase tracking-widest text-[10px] mb-4`}>{name}</h4>
                        <div className="space-y-3">
                           <button 
                            onClick={() => addFeedingLog(babyId as any, 'Breast Milk')}
                            className="w-full py-3 bg-white border-2 border-slate-100 hover:border-indigo-400 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm"
                           >
                            Breast Milk
                           </button>
                           <button 
                            onClick={() => addFeedingLog(babyId as any, 'Formula')}
                            className="w-full py-3 bg-white border-2 border-slate-100 hover:border-indigo-400 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm"
                           >
                            Formula
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-[2rem] border-4 border-slate-100 p-6 shadow-xl">
                 <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-6 underline">Feeding Chronology</h3>
                 <div className="space-y-3">
                   {feedingLogs.slice(0, 10).map(log => {
                     const isChotu = log.baby === 'Baby A';
                     return (
                       <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-[10px] ${isChotu ? 'bg-sky-400' : 'bg-pink-400'}`}>
                                {isChotu ? 'C' : 'M'}
                             </div>
                             <div>
                                <div className="text-[10px] font-black text-slate-800 uppercase">{log.type}</div>
                                <div className="text-[8px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                             </div>
                          </div>
                          <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                             Next: {new Date(log.nextFeedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                     );
                   })}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 rounded-[2rem] border-4 border-slate-100 shadow-xl">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">SYSTEM ARCHITECTURE</h2>
                 
                 <div className="space-y-6">
                    <section>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Command Tags (Categories)</label>
                       <div className="grid grid-cols-2 gap-3 mb-6">
                          {categories.map(cat => (
                            <div key={cat.name} className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-100 rounded-xl">
                               <span className="font-black text-[10px] uppercase tracking-widest">{cat.name}</span>
                               <button onClick={() => removeCategory(cat.name)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                  <Trash2 size={14} />
                               </button>
                            </div>
                          ))}
                       </div>
                       
                       <form onSubmit={(e) => {
                          e.preventDefault();
                          const input = (e.target as any).categoryName;
                          if (input.value) {
                             addCategory(input.value);
                             input.value = '';
                          }
                       }} className="flex gap-2">
                          <input 
                            name="categoryName"
                            placeholder="New Tag Name" 
                            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-400" 
                          />
                          <button type="submit" className="px-6 bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase shadow-md active:translate-y-0.5">
                             Add
                          </button>
                       </form>
                    </section>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'shopping' && (
            <motion.div
              key="shopping"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-black italic uppercase italic">BUY SOON</h2>
                    <span className="bg-amber-400 text-indigo-900 font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest shadow-md">
                       {lowStockItems.length} Urgent
                    </span>
                  </div>
                  <p className="text-indigo-200 font-bold text-[8px] uppercase tracking-widest mb-6 opacity-70">Automated List</p>

                  <div className="space-y-3">
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map(item => (
                        <div key={item.id} className="flex gap-4 items-center p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group transition-all">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-white/20 shadow-md" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border-2 border-indigo-400 bg-indigo-700 flex items-center justify-center shrink-0">
                              <ShoppingCart size={16} className="text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-sm tracking-tight truncate">{item.name}</div>
                            <div className="text-[8px] text-indigo-300 font-black uppercase tracking-widest">{item.assignment}</div>
                          </div>
                          <div className="text-amber-400 font-black italic text-xl pr-2">X{Math.max(1, item.minThreshold + 1 - item.currentCount)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 opacity-30 bg-indigo-700/50 rounded-2xl border-2 border-dashed border-indigo-400">
                        <p className="font-black italic uppercase tracking-widest text-[10px]">Zero Items</p>
                      </div>
                    )}
                  </div>

                  <button className="w-full mt-8 py-3 bg-amber-400 text-indigo-900 font-black rounded-2xl shadow-xl transform transition-all active:translate-y-1 flex items-center justify-center gap-2 text-xs uppercase">
                    <Zap size={16} className="fill-indigo-900" />
                    Instacart
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </main>

      {/* Bottom Floating Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 rounded-full px-4 py-2 z-40 shadow-2xl border-2 border-slate-700 flex gap-1 min-w-[320px] justify-between">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={18} className="stroke-[3px]" />} 
          />
          <NavButton 
            active={activeTab === 'feeding'} 
            onClick={() => setActiveTab('feeding')} 
            icon={<History size={18} className="stroke-[3px]" />} 
          />
          <NavButton 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
            icon={<Box size={18} className="stroke-[3px]" />} 
          />
          <NavButton 
            active={activeTab === 'shopping'} 
            onClick={() => setActiveTab('shopping')} 
            icon={<ShoppingCart size={18} className="stroke-[3px]" />} 
            badge={lowStockItems.length > 0 ? lowStockItems.length : undefined}
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<Settings size={18} className="stroke-[3px]" />} 
          />
      </nav>

      {/* Global Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900 px-4 py-1.5 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] border-t border-slate-800 z-50">
         <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></span>
            {isLoading ? 'SYNCING...' : 'LIVE: CHOTU & MOTTU'}
         </div>
         <button onClick={fetchData} className="text-indigo-400 hover:text-white transition-colors">REFRESH</button>
         <div className="flex gap-4">
            <span className="text-sky-400 opacity-60">● CHOTU</span>
            <span className="text-pink-400 opacity-60">● MOTTU</span>
         </div>
      </footer>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddItemModal onAdd={addItem} onClose={() => setIsAddModalOpen(false)} categories={categories} />
        )}
      </AnimatePresence>
    </div>
  );
}

interface InventoryCardProps {
  item: InventoryItem;
  onUpdate: (id: string, delta: number) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
  categories: CategoryInfo[];
}

const InventoryCard: React.FC<InventoryCardProps> = ({ 
  item, 
  onUpdate, 
  onDelete, 
  showDelete,
  categories
}) => {
  const isLow = item.currentCount <= item.minThreshold;
  const catConfig = categories.find(c => c.name === item.category) || categories[0] || { borderColor: 'slate-100', shadowColor: 'slate-50', color: 'slate-400' };
  
  return (
    <div className={`p-4 bg-white border-2 ${isLow ? 'border-rose-200 shadow-md shadow-rose-50' : `border-${catConfig.borderColor} shadow-md shadow-${catConfig.shadowColor}`} rounded-2xl flex items-center justify-between group transition-all`}>
      <div className="flex-1 min-w-0 pr-3 flex items-center gap-3">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" referrerPolicy="no-referrer" />
        ) : (
          <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-slate-100`}>
            <Package size={20} />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-black text-slate-800 text-sm truncate uppercase tracking-tighter italic">{item.name}</span>
            {isLow && <AlertCircle size={14} className="text-rose-500 fill-rose-50" />}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg font-black text-[7px] uppercase tracking-wider ${
              item.assignment === 'Baby A' ? 'bg-sky-100 text-sky-600' : 
              item.assignment === 'Baby B' ? 'bg-pink-100 text-pink-600' : 'bg-indigo-50 text-indigo-500'
            }`}>
              {item.assignment === 'Baby A' ? 'Chotu' : item.assignment === 'Baby B' ? 'Mottu' : 'Shared'}
            </span>
            <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{item.category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <button 
            onClick={() => onUpdate(item.id, -1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-500 hover:text-rose-500 active:translate-y-0.5 transition-all border-b-2 border-slate-100 active:border-b-0"
          >
            <Minus size={14} className="stroke-[4px]" />
          </button>
          <div className="px-1 text-center min-w-[32px]">
            <span className={`text-2xl font-black italic block leading-none ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>{item.currentCount}</span>
            <span className="text-[7px] block text-slate-400 font-black uppercase tracking-widest pr-0.5">{item.unit}</span>
          </div>
          <button 
            onClick={() => onUpdate(item.id, 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-500 hover:text-indigo-500 active:translate-y-0.5 transition-all border-b-2 border-slate-100 active:border-b-0"
          >
            <Plus size={14} className="stroke-[4px]" />
          </button>
        </div>
        
        {showDelete && (
          <button 
            onClick={() => onDelete?.(item.id)}
            className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl active:scale-90 border border-slate-100"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

interface NavButtonProps {
  active: boolean; 
  onClick: () => void; 
  icon: ReactNode; 
  badge?: number;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, badge }) => {
  return (
    <button 
      onClick={onClick}
      className={`relative p-3 rounded-full transition-all ${active ? 'bg-amber-400 text-indigo-900 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-800 shadow-lg">
          {badge}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-900 rounded-full"
        />
      )}
    </button>
  );
}

interface AddItemModalProps {
  onAdd: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void; 
  onClose: () => void;
  categories: CategoryInfo[];
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onAdd, onClose, categories }) => {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'updatedAt'>>({
    name: '',
    category: categories[0]?.name || 'Other',
    currentCount: 0,
    minThreshold: 5,
    assignment: 'Both',
    unit: 'ct',
    imageUrl: '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ y: '100%', scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.98 }}
        className="relative bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl border-t-8 border-indigo-100"
      >
        <h2 className="text-2xl font-black mb-6 italic text-slate-800 tracking-tighter uppercase">NEW ESSENTIAL</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); }} className="space-y-4">
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Item Title</label>
            <input 
              required
              autoFocus
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none text-sm font-black transition-all"
              placeholder="e.g. Baby Wipes"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Image URL (Optional)</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none text-[10px] font-bold"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
              <select 
                className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-[10px] uppercase italic"
                value={formData.category}
                onChange={e => setFormData(f => ({ ...f, category: e.target.value as Category }))}
              >
                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Split</label>
              <select 
                className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-[10px] uppercase italic"
                value={formData.assignment}
                onChange={e => setFormData(f => ({ ...f, assignment: e.target.value as Assignment }))}
              >
                <option value="Both">Shared</option>
                <option value="Baby A">Chotu</option>
                <option value="Baby B">Mottu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Qty</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 outline-none font-black text-lg italic shadow-inner"
                value={formData.currentCount}
                onChange={e => setFormData(f => ({ ...f, currentCount: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Min</label>
              <input 
                type="number"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 outline-none font-black text-lg italic shadow-inner"
                value={formData.minThreshold}
                onChange={e => setFormData(f => ({ ...f, minThreshold: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 outline-none font-black text-[10px] uppercase shadow-inner"
                value={formData.unit}
                onChange={e => setFormData(f => ({ ...f, unit: e.target.value }))}
                placeholder="ct"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 font-black text-slate-400 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[9px]"
            >
              Back
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 font-black text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 shadow-lg border-b-4 border-indigo-700 active:translate-y-1 active:border-b-0 transition-all uppercase tracking-widest text-[9px]"
            >
              Update Command
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

