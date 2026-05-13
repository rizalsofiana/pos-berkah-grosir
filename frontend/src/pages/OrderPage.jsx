import { useEffect, useState, useRef, useCallback } from 'react';
import { getProducts } from '../api/productService';
import { createOrder } from '../api/orderService';
import { useReactToPrint } from 'react-to-print';
import ReceiptPrint from '../components/ReceiptPrint';

export default function OrderPage() {
    // --- States ---
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetching, setIsFetching] = useState(true);
    const isMounted = useRef(true);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastOrderData, setLastOrderData] = useState(null);
    const componentRef = useRef();

    const [customerData, setCustomerData] = useState({
        customer_name: '',
        customer_whatsapp: '',
        fulfillment_method: 'pickup',
        payment_method: 'cash',
        amount_paid: ''
    });

    const finalizeOrder = (response) => {
        const result = response.data || response;

        // Kita gabungkan data dari API dengan data cart untuk keperluan cetak struk
        const dataForReceipt = {
            ...result.order,
            items: cart, // Kita gunakan item dari cart agar mendapatkan 'name' produk
            amount_paid: customerData.amount_paid,
            change_amount: customerData.payment_method === 'cash' ? (Number(customerData.amount_paid) - result.order.total_amount) : 0
        };

        setLastOrderData(dataForReceipt);
        setShowReceiptModal(true); // Munculkan Modal Struk

        // Reset Form & Keranjang
        setCart([]);
        setCustomerData({
            customer_name: '',
            customer_whatsapp: '',
            fulfillment_method: 'pickup',
            payment_method: 'cash',
            amount_paid: ''
        });
    };

    // --- Fetch Data Logic (Sesuai pola ProductPage) ---
    const fetchData = useCallback(async () => {
        if (!isMounted.current) return;
        setIsFetching(true);
        try {
            const data = await getProducts();
            if (isMounted.current) {
                setProducts(data);
            }
        } catch (err) {
            console.error("Gagal memuat produk:", err);
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

    // --- Cart Logic ---
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.product_id === product.id);
        if (existingItem) return; // Mencegah duplikat, cukup tambah qty di keranjang nanti

        // Cari unit default
        const defaultUnit = product.ProductUnits?.find(u => u.is_default_selling) || product.ProductUnits?.[0];
        const price = Number(defaultUnit?.ProductPrices?.[0]?.price) || 0;

        const newItem = {
            product_id: product.id,
            name: product.name,
            unit_id: defaultUnit?.id,
            unit_name: defaultUnit?.unit_name,
            qty: 1,
            price_per_unit: price,
            sub_total: price,
            available_units: product.ProductUnits
        };

        setCart([...cart, newItem]);
    };

    const updateCartQty = (index, newQty) => {
        const updatedCart = [...cart];
        updatedCart[index].qty = Math.max(1, Number(newQty));
        updatedCart[index].sub_total = updatedCart[index].qty * updatedCart[index].price_per_unit;
        setCart(updatedCart);
    };

    const updateCartUnit = (index, unitId) => {
        const updatedCart = [...cart];
        const selectedUnit = updatedCart[index].available_units.find(u => u.id === Number(unitId));

        updatedCart[index].unit_id = selectedUnit.id;
        updatedCart[index].unit_name = selectedUnit.unit_name;
        updatedCart[index].price_per_unit = selectedUnit.ProductPrices[0].price;
        updatedCart[index].sub_total = updatedCart[index].qty * updatedCart[index].price_per_unit;

        setCart(updatedCart);
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    // --- Calculations ---
    const totalAmount = cart.reduce((sum, item) => {
        const subTotal = Number(item.sub_total) || 0;
        return sum + subTotal;
    }, 0);
    const changeAmount = customerData.amount_paid - totalAmount;

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert("Keranjang masih kosong!");

        try {
            const payload = {
                customer_name: customerData.customer_name,
                customer_whatsapp: customerData.customer_whatsapp,
                fulfillment_method: customerData.fulfillment_method,
                payment_method: customerData.payment_method,
                amount_paid: customerData.payment_method === 'cash' || customerData.payment_method === 'qris_offline' ? Number(customerData.amount_paid) : 0,
                items: cart.map(item => ({
                    product_id: item.product_id,
                    unit_id: item.unit_id,
                    qty: Number(item.qty),
                    price_per_unit: Number(item.price_per_unit),
                    sub_total: Number(item.sub_total),
                    name: item.name
                }))
            };

            const response = await createOrder(payload);

            // LOGIKA PEMBAYARAN MIDTRANS
            const result = response.data || response;
            const token = result.snap_token || result.payment_token;

            if (customerData.payment_method === 'midtrans_online') {
                if (token) {
                    window.snap.pay(token, {
                        onSuccess: () => finalizeOrder(response),
                        onPending: () => finalizeOrder(response),
                        onError: () => alert("Pembayaran Gagal!"),
                        onClose: () => alert('Anda menutup pop-up.')
                    });
                } else {
                    alert("Error: Token Midtrans tidak ditemukan.");
                }
            } else {
                finalizeOrder(response);
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat memproses order.");
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Struk-${lastOrderData?.order_number}`,
    });

    // --- Render ---
    return (
        <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 grid grid-cols-12 gap-6">
            {/* Bagian Kiri: Produk */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
                <div className="bg-white p-6 rounded-4xl shadow-sm border border-blue-50">
                    <input
                        type="text"
                        placeholder="Cari produk atau scan barcode..."
                        className="w-full px-5 py-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {isFetching ? (
                        <div className="col-span-3 text-center py-10 text-blue-400">Memuat Produk...</div>
                    ) : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-white p-5 rounded-3xl border border-blue-50 hover:border-blue-400 cursor-pointer transition-all active:scale-95 shadow-sm group"
                        >
                            <div className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{product.name}</div>
                            <div className="text-xs text-slate-400 mt-1">Stok: {product.current_stock_in_pcs} Pcs</div>
                            <div className="mt-3 text-blue-600 font-bold">
                                Rp {product.ProductUnits?.[0]?.ProductPrices?.[0]?.price.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bagian Kanan: Checkout */}
            <div className="col-span-12 lg:col-span-5">
                <div className="bg-white rounded-4xl shadow-xl border border-blue-100 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h2 className="text-xl font-bold text-slate-800">Detail Pesanan</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-75">
                        {cart.length === 0 && (
                            <div className="text-center py-10 text-slate-400 italic">Keranjang kosong</div>
                        )}
                        {cart.map((item, index) => (
                            <div key={index} className="flex flex-col bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-slate-700">{item.name}</span>
                                    <button onClick={() => removeFromCart(index)} className="text-red-300 hover:text-red-500">✕</button>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <select
                                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none"
                                        value={item.unit_id}
                                        onChange={(e) => updateCartUnit(index, e.target.value)}
                                    >
                                        {item.available_units.map(u => (
                                            <option key={u.id} value={u.id}>{u.unit_name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-center"
                                        value={item.qty}
                                        onChange={(e) => updateCartQty(index, e.target.value)}
                                    />
                                    <div className="flex-1 text-right font-bold text-blue-600">
                                        Rp {item.sub_total.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 bg-blue-50/30 border-t border-blue-100 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                placeholder="Nama Pelanggan"
                                className="px-4 py-2 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-200"
                                value={customerData.customer_name}
                                onChange={(e) => setCustomerData({ ...customerData, customer_name: e.target.value })}
                                required
                            />
                            <input
                                placeholder="WhatsApp"
                                className="px-4 py-2 rounded-xl border border-blue-100 outline-none focus:ring-2 focus:ring-blue-200"
                                value={customerData.customer_whatsapp}
                                onChange={(e) => setCustomerData({ ...customerData, customer_whatsapp: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-between items-center text-slate-500 text-sm px-1">
                            <span>Total Tagihan</span>
                            <span className="text-2xl font-black text-slate-800">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(isNaN(totalAmount) ? 0 : totalAmount)}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest px-1">Pembayaran</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCustomerData({ ...customerData, payment_method: 'cash' })}
                                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${customerData.payment_method === 'cash' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}
                                >
                                    Cash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCustomerData({ ...customerData, payment_method: 'midtrans_online' })}
                                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${customerData.payment_method === 'midtrans_online' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}
                                >
                                    Midtrans
                                </button>
                            </div>
                        </div>

                        {customerData.payment_method === 'cash' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <input
                                    type="number"
                                    placeholder="Uang yang diterima..."
                                    className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-100 text-xl font-bold text-green-600"
                                    value={customerData.amount_paid}
                                    onChange={(e) => setCustomerData({ ...customerData, amount_paid: e.target.value })}
                                />
                                {changeAmount >= 0 && (
                                    <div className="mt-2 text-right text-sm font-bold text-slate-500">
                                        Kembalian: <span className="text-green-600">Rp {changeAmount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all mt-2"
                        >
                            Selesaikan Pesanan
                        </button>
                    </form>
                </div>
            </div>

            {showReceiptModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999 p-4">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full">
                        <div className="text-center mb-4">
                            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">✓</div>
                            <h2 className="text-xl font-bold">Pesanan Sukses</h2>
                            <p className="text-slate-500 text-sm">Transaksi telah berhasil dicatat</p>
                        </div>

                        {/* Preview Struk Mini */}
                        <div className="border border-slate-200 rounded-2xl p-2 bg-slate-50 max-h-60 overflow-y-auto mb-6">
                            <ReceiptPrint ref={componentRef} orderData={lastOrderData} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handlePrint}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all"
                            >
                                Cetak Struk
                            </button>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Elemen tersembunyi khusus untuk mesin cetak */}
            <div style={{ display: "none" }}>
                <ReceiptPrint ref={componentRef} orderData={lastOrderData} />
            </div>
        </div>
    );
}