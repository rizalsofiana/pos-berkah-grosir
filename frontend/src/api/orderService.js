import api from './axios'

export const createOrder = async (orderData) => {
    try {
        const response = await api.post(`/orders`, orderData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Gagal membuat pesanan" };
    }
};

export const getOrderHistory = async () => {
    try {
        const response = await api.get(`/orders`);
        return response.data.data || response.data;
    } catch (error) {
        throw error.response?.data || { message: "Gagal memuat riwayat" };
    }
};