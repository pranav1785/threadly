"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { db, collection, addDoc, query, where, onSnapshot, deleteDoc, doc, serverTimestamp } from "@/lib/firebase";
import type { Product } from "@/types";
import { CATEGORIES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { Package, Plus, Trash2, Edit2, X, Loader2, Search, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const INITIAL_FORM = {
  name: "", description: "", category: "", brand: "",
  price: "", originalPrice: "", imageURL: "", inStock: true,
  sizes: "", colors: "", tags: "",
};

export default function InventoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<(Product & { docId: string })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "products"), where("retailerId", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      setProducts(snap.docs.map(d => ({ docId: d.id, ...(d.data() as Product) })));
    });
    return () => unsub();
  }, [user]);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error("Name, price and category are required"); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "products"), {
        retailerId: user!.uid, name: form.name, description: form.description,
        category: form.category, brand: form.brand,
        price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        imageURL: form.imageURL || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        inStock: form.inStock, platform: "local",
        sizes: form.sizes ? form.sizes.split(",").map(s => s.trim()) : [],
        colors: form.colors ? form.colors.split(",").map(c => c.trim()) : [],
        tags: form.tags ? form.tags.split(",").map(t => t.trim().toLowerCase()) : [],
        createdAt: serverTimestamp(),
      });
      toast.success("Product added successfully!");
      setForm(INITIAL_FORM);
      setShowForm(false);
    } catch { toast.error("Failed to add product"); }
    finally { setSubmitting(false); }
  };

  const deleteProduct = async (docId: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteDoc(doc(db, "products", docId));
    toast.success("Product deleted");
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main id="main-content" className="pt-20 max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between py-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-600" aria-hidden="true" /> Inventory
            <span className="text-lg font-normal text-muted">({products.length} products)</span>
          </h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 px-4">
            {showForm ? <X className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {/* Add Product Form */}
        <AnimatePresence>
          {showForm && (
            <motion.section initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="card mb-8 border-2 border-primary-100" aria-labelledby="add-product-form">
              <h2 id="add-product-form" className="font-heading text-xl font-bold text-gray-900 mb-6">Add New Product</h2>
              <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5" noValidate>
                <div className="md:col-span-2">
                  <label htmlFor="p-name" className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span className="text-accent" aria-hidden="true">*</span></label>
                  <input id="p-name" type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Sony WH-1000XM5 Headphones" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="p-desc" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea id="p-desc" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" placeholder="Brief product description" />
                </div>
                <div>
                  <label htmlFor="p-cat" className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-accent" aria-hidden="true">*</span></label>
                  <select id="p-cat" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="p-brand" className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                  <input id="p-brand" type="text" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="input-field" placeholder="e.g. Sony" />
                </div>
                <div>
                  <label htmlFor="p-price" className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) <span className="text-accent" aria-hidden="true">*</span></label>
                  <input id="p-price" type="number" required min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="24999" />
                </div>
                <div>
                  <label htmlFor="p-orig" className="block text-sm font-medium text-gray-700 mb-1.5">Original Price (₹)</label>
                  <input id="p-orig" type="number" min="0" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className="input-field" placeholder="34999 (optional)" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="p-img" className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                  <input id="p-img" type="url" value={form.imageURL} onChange={e => setForm(f => ({ ...f, imageURL: e.target.value }))} className="input-field" placeholder="https://images.unsplash.com/..." />
                </div>
                <div>
                  <label htmlFor="p-sizes" className="block text-sm font-medium text-gray-700 mb-1.5">Sizes (comma separated)</label>
                  <input id="p-sizes" type="text" value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} className="input-field" placeholder="S, M, L, XL" />
                </div>
                <div>
                  <label htmlFor="p-colors" className="block text-sm font-medium text-gray-700 mb-1.5">Colors (comma separated)</label>
                  <input id="p-colors" type="text" value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} className="input-field" placeholder="Black, White, Blue" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="p-tags" className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input id="p-tags" type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="electronics, wireless, premium" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input id="p-stock" type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} className="w-4 h-4 rounded text-primary-600 cursor-pointer" />
                  <label htmlFor="p-stock" className="text-sm font-medium text-gray-700 cursor-pointer">In Stock</label>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Package className="w-4 h-4" aria-hidden="true" />}
                    Add Product
                  </button>
                </div>
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <label htmlFor="inv-search" className="sr-only">Search inventory</label>
          <input id="inv-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your products..." className="input-field pl-10" />
        </div>

        {/* Products Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-heading text-xl font-semibold text-gray-900">No products yet</h2>
            <p className="text-muted mt-2">Add your first product to start reaching customers.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-6 inline-flex">Add First Product</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Inventory table">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wide">Product</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wide">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wide">Price</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <motion.tr key={p.docId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {p.imageURL && <Image src={p.imageURL} alt="" fill className="object-cover" sizes="40px" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</p>
                            {p.brand && <p className="text-xs text-muted">{p.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className="tag text-xs">{p.category}</span></td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 text-sm">{formatPrice(p.price)}</p>
                        {p.originalPrice && p.originalPrice > p.price && <p className="text-xs text-muted line-through">{formatPrice(p.originalPrice)}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${p.inStock ? "text-green-600" : "text-red-500"}`}>
                          {p.inStock ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> : <XCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                          {p.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-muted hover:text-blue-600 transition-colors cursor-pointer" aria-label={`Edit ${p.name}`}>
                            <Edit2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button onClick={() => deleteProduct(p.docId, p.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors cursor-pointer" aria-label={`Delete ${p.name}`}>
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
