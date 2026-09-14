import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const client = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

export const getEmployees = () => client.get("/employees");
export const addEmployee = (data) => client.post("/employees", data);
export const deleteEmployee = (id) => client.delete(`/employees/${id}`);