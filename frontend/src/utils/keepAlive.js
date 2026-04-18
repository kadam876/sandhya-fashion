import { API_BASE_URL } from '../config';

// Ping the backend every 10 minutes to prevent Railway cold starts
export function startKeepAlive() {
  const ping = () => fetch(`${API_BASE_URL}/products?size=1`).catch(() => {});
  ping(); // immediate ping on app load
  setInterval(ping, 10 * 60 * 1000); // every 10 minutes
}
