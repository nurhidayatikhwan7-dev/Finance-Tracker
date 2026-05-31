// API Service untuk koneksi ke Backend
// Base URL bisa diubah sesuai environment

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function untuk fetch
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}

// ===== TRANSACTIONS API =====
export const transactionsAPI = {
  // Get all transactions
  getAll: async () => {
    return fetchAPI('/transactions');
  },

  // Get transaction by ID
  getById: async (id: string) => {
    return fetchAPI(`/transactions/${id}`);
  },

  // Create new transaction
  create: async (data: any) => {
    return fetchAPI('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update transaction
  update: async (id: string, data: any) => {
    return fetchAPI(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete transaction
  delete: async (id: string) => {
    return fetchAPI(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== CATEGORIES API =====
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    return fetchAPI('/categories');
  },

  // Create new category
  create: async (data: any) => {
    return fetchAPI('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete category
  delete: async (id: string) => {
    return fetchAPI(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== BUDGETS API =====
export const budgetsAPI = {
  // Get all budgets
  getAll: async () => {
    return fetchAPI('/budgets');
  },

  // Create new budget
  create: async (data: any) => {
    return fetchAPI('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update budget
  update: async (id: string, data: any) => {
    return fetchAPI(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete budget
  delete: async (id: string) => {
    return fetchAPI(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== SAVINGS GOALS API =====
export const savingsAPI = {
  // Get all savings goals
  getAll: async () => {
    return fetchAPI('/savings');
  },

  // Create new savings goal
  create: async (data: any) => {
    return fetchAPI('/savings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update savings goal
  update: async (id: string, data: any) => {
    return fetchAPI(`/savings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete savings goal
  delete: async (id: string) => {
    return fetchAPI(`/savings/${id}`, {
      method: 'DELETE',
    });
  },
};
