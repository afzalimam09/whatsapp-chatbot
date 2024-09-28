import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

export const apiRequest = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});