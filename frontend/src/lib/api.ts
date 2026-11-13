export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    // If accessing via domain like rs.yarora.dev, use the Next.js rewrite proxy /api/backend
    if (window.location.hostname.includes('yarora.dev') || window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('192.168.')) {
      return '/api/backend';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('rs_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiBase = getApiBase();

  try {
    const res = await fetch(`${apiBase}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rs_token');
          localStorage.removeItem('rs_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        console.warn(`[Session Notice] 401 Unauthorized for ${endpoint}. Redirecting to /login.`);
        return [] as unknown as T;
      }
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error?.message || errorBody?.message || `API error (${res.status})`;
      throw new Error(typeof message === 'object' ? JSON.stringify(message) : message);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.warn(`[Backend Offline] Could not connect to API at ${apiBase}. Ensure NestJS backend is running.`);
      return [] as unknown as T;
    }
    throw err;
  }
}

export const formatCurrency = (val?: number | null) => {
  if (val === undefined || val === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

