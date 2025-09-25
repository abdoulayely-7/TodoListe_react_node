import axios from 'axios';

// Configuration de base pour axios
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Pour envoyer automatiquement les cookies JWT
});

// Intercepteur requête: retirer Content-Type si body est FormData (laisser le browser gérer la boundary)
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
    }
  } else {
    // pour JSON classique, s'assurer du header
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne rediriger que si on n'est pas déjà sur la page de login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
