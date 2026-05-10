import { useEffect, useState, useRef, useCallback } from 'react';
import { getProducts, deleteProduct, createProduct } from '../api/productService';
import { getCategories } from '../api/categoryService';

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const isMounted = useRef(true);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category_id: '',
        description: '',
        base_price: 0,
        current_stock_in_pcs: 0,
        min_stock_limit: 10,
        units: [{ unit_name: '', conversion_factor: 1, price: 0, is_default_selling: true }]
    });

    const fetchData = useCallback(async () => {
        if (!isMounted.current) return;

        setIsFetching(true);

        try {
            const [pData, cData] = await Promise.all([getProducts(), getCategories()]);
            if (isMounted.current) {
                setProducts(pData);
                setCategories(cData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (isMounted.current) setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        const timer = setTimeout(() => {
            fetchData();
        }, 0);

        return () => {
            isMounted.current = false;
            clearTimeout(timer);
        };
    }, [fetchData]);

    const addUomRow = () => {
        setFormData({
            ...formData,
            units: [...formData.units, { unit_name: '', conversion_factor: 1, price: 0, is_default_selling: false }]
        });
    };

    const handleSetDefault = (index) => {
        const newUnits = formData.units.map((unit, i) => ({
            ...unit,
            is_default_selling: i === index 
        }));
        setFormData({ ...formData, units: newUnits });
    };

    const removeUomRow = (index) => {
        const newUnits = formData.units.filter((_, i) => i !== index);
        setFormData({ ...formData, units: newUnits });
    };

    const handleUomChange = (index, field, value) => {
        const newUnits = [...formData.units];
        newUnits[index][field] = value;
        setFormData({ ...formData, units: newUnits });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                category_id: Number(formData.category_id),
                base_price: Number(formData.base_price),
                current_stock_in_pcs: Number(formData.current_stock_in_pcs),
                min_stock_limit: Number(formData.min_stock_limit),
                units: formData.units.map(u => ({
                    unit_name: u.unit_name, // Pastikan nama field ini string
                    conversion_factor: Number(u.conversion_factor),
                    price: Number(u.price),
                    is_default_selling: u.is_default_selling
                }))
            };

            await createProduct(payload);
            setShowModal(false);

            // Reset form dengan field yang lengkap
            setFormData({
                name: '', sku: '', category_id: '', description: '',
                base_price: 0, current_stock_in_pcs: 0, min_stock_limit: 10,
                units: [{ unit_name: '', conversion_factor: 1, price: 0, is_default_selling: true }]
            });
            fetchData();
        } catch (err) {
            alert("Gagal simpan produk. Periksa log di console.");
            console.log(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hapus produk ini?")) {
            try {
                await deleteProduct(id);
                fetchData();
            } catch (err) { console.log(err); }
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-800">Inventaris Produk</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        + Produk Baru
                    </button>
                </header>

                <div className="bg-white rounded-4xl shadow-sm border border-blue-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-blue-50/30 border-b border-blue-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Barang</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Kategori</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50/50">
                            {isFetching ? (
                                <tr><td colSpan="3" className="px-8 py-20 text-center text-blue-300">Loading...</td></tr>
                            ) : products.map((prod) => (
                                <tr key={prod.id} className="group hover:bg-blue-50/40 transition-all">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-slate-700">{prod.name}</div>
                                        <div className="text-xs text-slate-400">{prod.sku} | Stok: {prod.current_stock_in_pcs} Pcs</div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">{prod.Category?.name}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => handleDelete(prod.id)}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                            title="Hapus Produk"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-4xl shadow-2xl w-full max-w-3xl my-auto">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Tambah Produk Baru</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Nama Produk"
                                    className="w-full px-4 py-3 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="SKU"
                                    className="w-full px-4 py-3 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200"
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    required
                                />
                            </div>

                            <textarea
                                placeholder="Deskripsi Produk"
                                className="w-full px-4 py-3 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200 min-h-20"
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select
                                    className="w-full px-4 py-3 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200"
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Harga Modal"
                                    className="w-full px-4 py-3 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200"
                                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Stok Awal (Pcs)"
                                    className="w-full px-4 py-3 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200"
                                    onChange={(e) => setFormData({ ...formData, current_stock_in_pcs: e.target.value })}
                                    required
                                />
                            </div>

                            {/* UOM Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Satuan & Harga Jual</span>
                                    <button type="button" onClick={addUomRow} className="text-blue-600 text-xs font-bold">+ Tambah Satuan</button>
                                </div>
                                {formData.units.map((uom, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl mb-2">
                                        <div className="flex flex-col items-center justify-center">
                                            <label className="text-[10px] text-slate-400 mb-1">Default</label>
                                            <input
                                                type="radio"
                                                name="default_selling"
                                                checked={uom.is_default_selling}
                                                onChange={() => handleSetDefault(index)}
                                                className="w-5 h-5 accent-blue-600 cursor-pointer"
                                            />
                                        </div>

                                        <input
                                            placeholder="Satuan (Dus/Pcs)"
                                            className="flex-1 px-3 py-2 bg-white rounded-lg outline-none border border-slate-200"
                                            onChange={(e) => handleUomChange(index, 'unit_name', e.target.value)}
                                            required
                                        />

                                        <input
                                            type="number"
                                            placeholder="Isi"
                                            className="w-30 px-3 py-2 bg-white rounded-lg outline-none border border-slate-200"
                                            onChange={(e) => handleUomChange(index, 'conversion_factor', e.target.value)}
                                            required
                                        />

                                        <input
                                            type="number"
                                            placeholder="Harga Jual"
                                            className="flex-1 px-3 py-2 bg-white rounded-lg outline-none border border-slate-200 font-bold text-blue-600"
                                            onChange={(e) => handleUomChange(index, 'price', e.target.value)}
                                            required
                                        />

                                        {formData.units.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeUomRow(index)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold">Batal</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">Simpan Produk</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}