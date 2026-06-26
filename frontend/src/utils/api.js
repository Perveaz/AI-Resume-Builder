import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  setTokens: (access, refresh) => {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

let isRefreshing = false;
let failedQueue = [];
function processQueue(error, token) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (error.response && error.response.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { orig.headers.Authorization = 'Bearer ' + token; return apiClient(orig); });
      }
      orig._retry = true;
      isRefreshing = true;
      const refresh = tokenStorage.getRefresh();
      if (!refresh) { tokenStorage.clear(); window.location.href = '/login'; return Promise.reject(error); }
      try {
        const res = await axios.post(BASE_URL + '/accounts/token/refresh/', { refresh });
        const newAccess = res.data.access;
        tokenStorage.setTokens(newAccess, res.data.refresh || refresh);
        processQueue(null, newAccess);
        orig.headers.Authorization = 'Bearer ' + newAccess;
        return apiClient(orig);
      } catch (err) {
        processQueue(err, null);
        tokenStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => apiClient.post('/accounts/login/', { username: data.email || data.username, password: data.password }),
  register: (data) => apiClient.post('/accounts/register/', data),
  logout: (refresh) => apiClient.post('/accounts/logout/', { refresh }),
  getProfile: () => apiClient.get('/accounts/profile/'),
  updateProfile: (data) => {
    if (data.profile_picture instanceof File) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
      return apiClient.put('/accounts/profile/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return apiClient.put('/accounts/profile/', data);
  },
};

export const resumeAPI = {
  list: () => apiClient.get('/resumes/'),
  create: (data) => apiClient.post('/resumes/', data),
  get: (id) => apiClient.get('/resumes/' + id + '/'),
  update: (id, data) => apiClient.patch('/resumes/' + id + '/', data),
  delete: (id) => apiClient.delete('/resumes/' + id + '/'),
};

export const sectionAPI = {
  list: (rId, s) => apiClient.get('/resumes/' + rId + '/' + s + '/'),
  add: (rId, s, data) => apiClient.post('/resumes/' + rId + '/' + s + '/', data),
  update: (rId, s, iId, data) => apiClient.put('/resumes/' + rId + '/' + s + '/' + iId + '/', data),
  delete: (rId, s, iId) => apiClient.delete('/resumes/' + rId + '/' + s + '/' + iId + '/'),
};

// aiTemplate: 'student' | 'professional' | 'executive'
// type: 'summary' | 'experience' | 'project' | 'skills'
export const aiAPI = {
  generate: (type, context, aiTemplate) =>
    apiClient.post('/ai/generate/', { type, context, template: aiTemplate || 'professional' }),
};

export default apiClient;
