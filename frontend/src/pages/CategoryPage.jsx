import { useEffect, useState, useRef, useCallback } from 'react';
import { getCategories, createCategory, deleteCategory } from '../api/categoryService';

export default function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const isMounted = useRef(true);

    const fetchData = useCallback(async () => {
        try {
            const data = await getCategories();
            if (isMounted.current) setCategories(data);
        } catch (err) {
            console.error(err);
        } finally {
            if (isMounted.current) setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        const timeoutId = setTimeout(() => fetchData(), 0);
        return () => {
            isMounted.current = false;
            clearTimeout(timeoutId);
        };
    }, [fetchData]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        setLoading(true);
        try {
            await createCategory(newCategory);
            setNewCategory('');
            await fetchData();
        } catch (err) {
            alert('Gagal menambah kategori');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus kategori ini?')) {
            try {
                await deleteCategory(id);
                await fetchData();
            } catch (err) {
                alert('Gagal menghapus kategori');
                console.log(err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Kategori Produk</h1>
                        <p className="text-slate-500 mt-1 text-sm md:text-base font-medium">
                            Kelola pengelompokan produk Berkah Grosir Anda.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-100/50 text-blue-700 px-4 py-2 rounded-2xl border border-blue-200/50 text-sm font-bold">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        {categories.length} Total Kategori
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form Section - Sidebar Style */}
                    <aside className="lg:col-span-4">
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-blue-50 sticky top-10">
                            <h3 className="text-lg font-bold text-slate-800 mb-5">Tambah Baru</h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-[0.15em] mb-2 px-1">
                                        Nama Kategori
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-blue-50/50 border border-transparent rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all outline-none text-slate-700 placeholder:text-blue-200 shadow-inner"
                                        placeholder="Sembako, Minuman, dll."
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !newCategory.trim()}
                                    className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.97] transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                >
                                    {loading ? 'Memproses...' : 'Simpan Kategori'}
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* Table Section */}
                    <main className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-blue-50 bg-blue-50/30">
                                        <th className="px-8 py-5 text-left text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">
                                            Detail List
                                        </th>
                                        <th className="px-8 py-5 text-right text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-50/50">
                                    {isFetching ? (
                                        <tr>
                                            <td colSpan="2" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                                                    <span className="text-blue-300 font-medium animate-pulse">Menyinkronkan...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <tr key={cat.id} className="group hover:bg-blue-50/40 transition-all">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                                            {cat.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                                        title="Hapus Kategori"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-slate-400 font-bold mt-4">Belum ada data</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}