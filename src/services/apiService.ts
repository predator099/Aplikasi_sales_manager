/**
 * Client-side API Service for ANTEN Business Manager
 * Handles all network requests to server-side endpoints
 */

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('anten_auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiService = {
  // Auth
  async login(identifier: string, password?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('anten_auth_token', data.token);
    }
    return data;
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem('anten_auth_token');
    }
  },

  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async switchRole(role: string) {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('anten_auth_token', data.token);
    }
    return data;
  },

  // Customers
  async getCustomers() {
    const res = await fetch('/api/customers');
    const json = await res.json();
    return json.data || [];
  },

  async createCustomer(data: any) {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateCustomer(id: string, data: any) {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteCustomer(id: string) {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Services
  async getServices() {
    const res = await fetch('/api/services');
    const json = await res.json();
    return json.data || [];
  },

  async createService(data: any, createQuotationAlso = false) {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...data, createQuotationAlso }),
    });
    const json = await res.json();
    return json;
  },

  async updateServiceStatus(id: string, status: string) {
    const res = await fetch(`/api/services/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Quotations
  async getQuotations() {
    const res = await fetch('/api/quotations');
    const json = await res.json();
    return json.data || [];
  },

  async createQuotation(data: any) {
    const res = await fetch('/api/quotations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateQuotationStatus(id: string, status: string) {
    const res = await fetch(`/api/quotations/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async convertQuotationToInvoice(id: string, dueDate?: string) {
    const res = await fetch(`/api/quotations/${id}/convert-to-invoice`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dueDate }),
    });
    const json = await res.json();
    return json.data;
  },

  // Invoices & Payments
  async getInvoices() {
    const res = await fetch('/api/invoices');
    const json = await res.json();
    return json.data || [];
  },

  async createInvoice(data: any) {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async recordPayment(invoiceId: string, paymentData: any) {
    const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });
    const json = await res.json();
    return json.data;
  },

  // Metro & Public IP
  async getMetros() {
    const res = await fetch('/api/metro');
    const json = await res.json();
    return json.data || [];
  },

  async createMetro(data: any) {
    const res = await fetch('/api/metro', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateMetro(id: string, data: any) {
    const res = await fetch(`/api/metro/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteMetro(id: string) {
    const res = await fetch(`/api/metro/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getPublicIps() {
    const res = await fetch('/api/public-ip');
    const json = await res.json();
    return json.data || [];
  },

  async createPublicIp(data: any) {
    const res = await fetch('/api/public-ip', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updatePublicIp(id: string, data: any) {
    const res = await fetch(`/api/public-ip/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deletePublicIp(id: string) {
    const res = await fetch(`/api/public-ip/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Pricing & Formula
  async getPricing() {
    const res = await fetch('/api/pricing');
    const json = await res.json();
    return json.data;
  },

  async updatePricing(data: any) {
    const res = await fetch('/api/pricing', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async saveBandwidthTier(data: any) {
    const res = await fetch('/api/pricing/tiers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteBandwidthTier(id: string) {
    const res = await fetch(`/api/pricing/tiers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getFormula() {
    const res = await fetch('/api/formula');
    const json = await res.json();
    return json.data;
  },

  async updateFormula(data: any) {
    const res = await fetch('/api/formula', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Payouts & Withdrawals
  async getWithdrawals() {
    const res = await fetch('/api/payouts');
    const json = await res.json();
    return json.data || [];
  },

  async createWithdrawal(data: any) {
    const res = await fetch('/api/payouts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateWithdrawalStatus(id: string, status: string) {
    const res = await fetch(`/api/payouts/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Users
  async getUsers() {
    const res = await fetch('/api/users');
    const json = await res.json();
    return json.data || [];
  },

  async createUser(data: any) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateUser(id: string, data: any) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteUser(id: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch('/api/audit-logs');
    const json = await res.json();
    return json.data || [];
  },

  async createAuditLog(data: any) {
    const res = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Upload
  async uploadFile(file: { name: string; size: number; type: string; data: string }) {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(file),
    });
    const json = await res.json();
    return json.document;
  },
};
