export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase || 'http://localhost:4000/api';

  const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 });

  const headers = computed(() => ({
    ...(token.value && { Authorization: `Bearer ${token.value}` }),
  }));

  const fetchApi = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    return $fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: { ...headers.value, ...options.headers },
    });
  };

  const login = async (email: string, password: string) => {
    const result = await fetchApi('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    token.value = result.data.accessToken;
    return result.data;
  };

  const register = async (data: { email: string; password: string; name?: string; phone?: string }) => {
    const result = await fetchApi('/auth/register', {
      method: 'POST',
      body: data,
    });
    token.value = result.data.accessToken;
    return result.data;
  };

  const logout = () => {
    token.value = null;
  };

  const getProducts = (params?: any) => fetchApi('/products', { params });
  const getProduct = (slug: string) => fetchApi(`/products/${slug}`);
  const searchProducts = (q: string) => fetchApi(`/products/search?q=${q}`);
  const getCategories = () => fetchApi('/categories');
  const getCategory = (slug: string) => fetchApi(`/categories/${slug}`);
  const getFaqs = () => fetchApi('/faqs');
  const getBlogs = () => fetchApi('/blogs');
  const getBlog = (slug: string) => fetchApi(`/blogs/${slug}`);

  const getCart = () => fetchApi('/cart');
  const addToCart = (productId: string, quantity = 1) =>
    fetchApi('/cart/items', { method: 'POST', body: { productId, quantity } });
  const updateCartItem = (itemId: string, quantity: number) =>
    fetchApi(`/cart/items/${itemId}`, { method: 'PUT', body: { quantity } });
  const removeCartItem = (itemId: string) =>
    fetchApi(`/cart/items/${itemId}`, { method: 'DELETE' });
  const clearCart = () => fetchApi('/cart', { method: 'DELETE' });

  const getFavorites = () => fetchApi('/favorites');
  const toggleFavorite = (productId: string) =>
    fetchApi(`/favorites/${productId}`, { method: 'POST' });

  const createOrder = (data: any) => fetchApi('/orders', { method: 'POST', body: data });
  const getOrders = (page?: number) => fetchApi(`/orders?page=${page || 1}`);
  const getOrder = (id: string) => fetchApi(`/orders/${id}`);
  const getOrderByNumber = (orderNumber: string) =>
    fetchApi(`/orders/${orderNumber}?byNumber=true`);

  const initiateSslcommerz = (data: any) =>
    fetchApi('/payments/sslcommerz/init', { method: 'POST', body: data });

  const initiateBkash = (data: any) =>
    fetchApi('/payments/bkash/init', { method: 'POST', body: data });

  const createPaymentIntent = (amount: number, email?: string) =>
    fetchApi('/payments/create-intent', { method: 'POST', body: { amount, email } });

  return {
    token,
    isAuthenticated: computed(() => !!token.value),
    login,
    register,
    logout,
    getProducts,
    getProduct,
    searchProducts,
    getCategories,
    getCategory,
    getFaqs,
    getBlogs,
    getBlog,
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getFavorites,
    toggleFavorite,
    createOrder,
    getOrders,
    getOrder,
    getOrderByNumber,
    initiateSslcommerz,
    initiateBkash,
    createPaymentIntent,
    fetchApi,
  };
};
