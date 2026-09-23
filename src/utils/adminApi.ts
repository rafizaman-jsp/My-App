import { API_BASE_URL } from './apiConfig';

export { API_BASE_URL } from './apiConfig';

export async function adminRequest(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const result = await response.json();
  return { response, result };
}
