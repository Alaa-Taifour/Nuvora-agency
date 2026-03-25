/* ============================================================
   NUVORA — SUPABASE CLIENT
   Connects frontend to Supabase backend
   ============================================================ */

const SUPABASE_URL = 'https://udfszpgixnnresrxozfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZnN6cGdpeG5ucmVzcnhvemZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjQ1MDIsImV4cCI6MjA5MDAwMDUwMn0.neMEETkWXJxkIoxT3qZrxsjeEQli2JbYzmeKIL2Tcc4';

// ─── Supabase Client (lightweight, no npm needed) ────────────
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    };
  }

  // ─── Insert a row ─────────────────────────────────────────
  async insert(table, data) {
    try {
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...this.headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Insert failed');
      }
      return { data: await res.json(), error: null };
    } catch (error) {
      console.error(`Supabase insert error (${table}):`, error);
      return { data: null, error };
    }
  }

  // ─── Select rows ──────────────────────────────────────────
  async select(table, options = {}) {
    try {
      let url = `${this.url}/rest/v1/${table}?`;
      if (options.filter) url += `${options.filter}&`;
      if (options.order) url += `order=${options.order}&`;
      if (options.limit) url += `limit=${options.limit}&`;
      if (options.select) url += `select=${options.select}&`;

      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error('Select failed');
      return { data: await res.json(), error: null };
    } catch (error) {
      console.error(`Supabase select error (${table}):`, error);
      return { data: null, error };
    }
  }

  // ─── Update a row ─────────────────────────────────────────
  async update(table, match, data) {
    try {
      const params = Object.entries(match)
        .map(([k, v]) => `${k}=eq.${v}`).join('&');
      const res = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
        method: 'PATCH',
        headers: { ...this.headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Update failed');
      return { data: await res.json(), error: null };
    } catch (error) {
      console.error(`Supabase update error (${table}):`, error);
      return { data: null, error };
    }
  }

  // ─── Auth — Sign In ───────────────────────────────────────
  async signIn(email, password) {
    try {
      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || 'Login failed');
      // Store session
      localStorage.setItem('nuvora_session', JSON.stringify(data));
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ─── Auth — Sign Out ──────────────────────────────────────
  async signOut() {
    try {
      const session = this.getSession();
      if (session?.access_token) {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: 'POST',
          headers: { ...this.headers, 'Authorization': `Bearer ${session.access_token}` }
        });
      }
      localStorage.removeItem('nuvora_session');
      return { error: null };
    } catch (error) {
      localStorage.removeItem('nuvora_session');
      return { error };
    }
  }

  // ─── Auth — Get current session ───────────────────────────
  getSession() {
    try {
      const raw = localStorage.getItem('nuvora_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ─── Auth — Check if logged in ────────────────────────────
  isAuthenticated() {
    const session = this.getSession();
    if (!session?.access_token) return false;
    // Check expiry
    try {
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  // ─── Authenticated headers ────────────────────────────────
  getAuthHeaders() {
    const session = this.getSession();
    return {
      ...this.headers,
      'Authorization': `Bearer ${session?.access_token || this.key}`
    };
  }
}

// Export singleton
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
