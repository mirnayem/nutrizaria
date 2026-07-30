export const useAdminApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase || 'http://localhost:4000/api';

  const token = useCookie('auth_token');

  const headers = computed(() => ({
    'Content-Type': 'application/json',
    ...(token.value && { Authorization: `Bearer ${token.value}` }),
  }));

  const fetchApi = async (endpoint: string, options: any = {}) => {
    return $fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: { ...headers.value, ...options.headers },
    });
  };

  const getDashboard = () => fetchApi('/admin/dashboard');

  const getProducts = (params?: any) => fetchApi('/admin/products', { params });
  const getProduct = (id: string) => fetchApi(`/admin/products/${id}`);
  const createProduct = (data: any) => fetchApi('/admin/products', { method: 'POST', body: data });
  const updateProduct = (id: string, data: any) => fetchApi(`/admin/products/${id}`, { method: 'PUT', body: data });
  const deleteProduct = (id: string) => fetchApi(`/admin/products/${id}`, { method: 'DELETE' });

  const getCategories = () => fetchApi('/admin/categories');
  const createCategory = (data: any) => fetchApi('/admin/categories', { method: 'POST', body: data });
  const updateCategory = (id: string, data: any) => fetchApi(`/admin/categories/${id}`, { method: 'PUT', body: data });
  const deleteCategory = (id: string) => fetchApi(`/admin/categories/${id}`, { method: 'DELETE' });

  const getOrders = (params?: any) => fetchApi('/admin/orders', { params });
  const getOrder = (id: string) => fetchApi(`/admin/orders/${id}`);
  const updateOrderStatus = (id: string, status: string, adminNotes?: string) =>
    fetchApi(`/admin/orders/${id}/status`, { method: 'PUT', body: { status, adminNotes } });
  const updatePaymentStatus = (id: string, status: string, paymentRef?: string) =>
    fetchApi(`/admin/orders/${id}/payment`, { method: 'PUT', body: { status, paymentRef } });

  const getBlogs = () => fetchApi('/admin/blogs');
  const createBlog = (data: any) => fetchApi('/admin/blogs', { method: 'POST', body: data });
  const updateBlog = (id: string, data: any) => fetchApi(`/admin/blogs/${id}`, { method: 'PUT', body: data });
  const deleteBlog = (id: string) => fetchApi(`/admin/blogs/${id}`, { method: 'DELETE' });

  const getFaqs = () => fetchApi('/admin/faqs');
  const createFaq = (data: any) => fetchApi('/admin/faqs', { method: 'POST', body: data });
  const updateFaq = (id: string, data: any) => fetchApi(`/admin/faqs/${id}`, { method: 'PUT', body: data });
  const deleteFaq = (id: string) => fetchApi(`/admin/faqs/${id}`, { method: 'DELETE' });

  const getUsers = (page?: number) => fetchApi(`/admin/users?page=${page || 1}`);
  const updateUserRole = (id: string, role: string) =>
    fetchApi(`/admin/users/${id}/role`, { method: 'PUT', body: { role } });

  const getSettings = () => fetchApi('/admin/settings');
  const updateSetting = (key: string, value: string, type?: string) =>
    fetchApi('/admin/settings', { method: 'PUT', body: { key, value, type } });

  const uploadImage = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return $fetch(`${baseURL}/admin/uploads/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData,
    });
  };

  return {
    getDashboard,
    getProducts, getProduct, createProduct, updateProduct, deleteProduct,
    getCategories, createCategory, updateCategory, deleteCategory,
    getOrders, getOrder, updateOrderStatus, updatePaymentStatus,
    getBlogs, createBlog, updateBlog, deleteBlog,
    getFaqs, createFaq, updateFaq, deleteFaq,
    getUsers, updateUserRole,
    getSettings, updateSetting,
    uploadImage,
  };
};
