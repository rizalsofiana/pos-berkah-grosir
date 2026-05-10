import { useEffect, useState, useRef, useCallback } from 'react';
import { getOrderHistory } from '../api/orderService';

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const isMounted = useRef(true);

    const fetchData = useCallback(async () => {
        if (!isMounted.current) return;
        setIsFetching(true);
        try {
            const data = await getOrderHistory();
            if (isMounted.current) {
                setOrders(data);
            }
        } catch (err) {
            console.error("Gagal memuat riwayat pesanan:", err);
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

    console.log(orders);

    // Helper untuk warna status
    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-700",
            completed: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
            prepared: "bg-blue-100 text-blue-700"
        };
        return `px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-slate-100 text-slate-600"}`;
    };

    return (
        <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Riwayat Pesanan</h1>
                        <p className="text-slate-500">Pantau semua transaksi masuk dan status pembayaran.</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100 hover:bg-blue-50 transition-all"
                    >
                        🔄 Refresh Data
                    </button>
                </header>

                <div className="bg-white rounded-4xl shadow-sm border border-blue-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-blue-50/30 border-b border-blue-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">No. Order</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Pelanggan</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Metode</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Fulfillment</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-blue-400 uppercase tracking-widest text-right">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50/50">
                            {isFetching ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-blue-300">Memuat data...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400">Belum ada transaksi hari ini.</td></tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} className="hover:bg-blue-50/40 transition-all cursor-pointer">
                                    <td className="px-8 py-5 font-bold text-blue-600">
                                        #{order.order_number}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-slate-700">{order.customer_name}</div>
                                        <div className="text-xs text-slate-400">{order.customer_whatsapp}</div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-700">
                                        Rp {Number(order.total_amount).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        {order.Payment.payment_method == 'cash' ? (
                                            <span className="text-xs font-medium text-white bg-green-600 px-2 py-1 rounded">
                                                {order.Payment.payment_method}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-white bg-blue-600 px-2 py-1 rounded">
                                                {order.Payment.payment_method}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        {order.fulfillment_method == 'pickup' ? (
                                            <span className="text-xs font-medium text-white bg-green-600 px-2 py-1 rounded">
                                                {order.fulfillment_method}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-white bg-green-600 px-2 py-1 rounded">
                                                {order.fulfillment_method}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={getStatusBadge(order.order_status)}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right text-sm text-slate-500">
                                        {new Date(order.created_at).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}