import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://streamselector-api.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL
});

export function getToken() {
  return localStorage.getItem("token");
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

