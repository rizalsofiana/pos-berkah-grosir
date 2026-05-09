import api from './axios';

export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data.data;
};

export const createCategory = async (name) => {
    const response = await api.post('/categories', { name });
    return response.data.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};