import React, { forwardRef } from 'react';

const ReceiptPrint = forwardRef(({ orderData }, ref) => {
    if (!orderData) return null;

    return (
        <div ref={ref} className="p-5 bg-white text-black font-mono text-[12px] w-[80mm] mx-auto">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="font-bold text-lg uppercase tracking-widest">Berkah Grosir</h2>
                <p>Bandung, Indonesia</p>
                <p className="text-[10px]">Jl. Gading No. 123, Kabupaten Bandung</p>
                <div className="border-b border-dashed border-black my-2"></div>
            </div>

            {/* Info Transaksi */}
            <div className="mb-2 space-y-1">
                <div className="flex justify-between">
                    <span>No. Nota:</span>
                    <span>{orderData.order_number}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date().toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>Admin</span>
                </div>
                <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span>{orderData.customer_name}</span>
                </div>
            </div>

            <div className="border-b border-dashed border-black my-2"></div>

            {/* Daftar Item */}
            <table className="w-full mb-2">
                <thead>
                    <tr className="text-left">
                        <th className="font-normal">Item</th>
                        <th className="font-normal text-center">Qty</th>
                        <th className="font-normal text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {orderData.items?.map((item, index) => (
                        <tr key={index}>
                            <td className="py-1">{item.name}</td>
                            <td className="text-center">{item.qty}</td>
                            <td className="text-right">{(item.price_per_unit * item.qty).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-b border-dashed border-black my-2"></div>

            {/* Rincian Harga */}
            <div className="space-y-1">
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL</span>
                    <span>Rp {orderData.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Bayar</span>
                    <span>Rp {Number(orderData.amount_paid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Kembali</span>
                    <span>Rp {Number(orderData.change_amount || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
                <div className="border-b border-dashed border-black my-2"></div>
                <p className="font-bold">TERIMA KASIH</p>
                <p className="text-[9px] mt-1 italic">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
            </div>
        </div>
    );
});

export default ReceiptPrint;