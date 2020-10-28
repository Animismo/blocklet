import axios from 'axios';

axios.interceptors.request.use(
  config => {
    config.baseURL = window.env.apiPrefix || '';
    config.timeout = 200000;

    const token = localStorage.getItem('login_token');
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axios;
