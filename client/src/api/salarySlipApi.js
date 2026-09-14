import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const client = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

export const calculateSlip = (data) => client.post("/salary-slips/calculate", data);
export const generateSlip = (data) => client.post("/salary-slips", data);
export const getSlips = () => client.get("/salary-slips");

