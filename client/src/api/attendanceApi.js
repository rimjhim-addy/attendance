import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const client = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

export const markAttendance = (data) => client.post("/attendance", data);
export const getAttendance = (params) => client.get("/attendance", { params });