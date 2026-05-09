import api from './axios';

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data.data;
};

export const createProduct = async (productData) => {
    const response = await api.post('/products', productData);
    return response.data.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};