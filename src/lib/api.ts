import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  timeout: 10000,
});



// Users
export const getUsers    = () => api.get("/users").then((r: { data: any; }) => r.data);
export const createUser  = (data:{id:number; userName:string; companyId:number}) =>
  api.post("/users", data).then((r: { data: any; }) => r.data);
export const updateUser  = (id:number, data:{userName:string; companyId:number}) =>
  api.put(`/users/${id}`, data).then((r: { data: any; }) => r.data);
export const deleteUser  = (id:number) => api.delete(`/users/${id}`);

// Companies
export const getCompanies   = () => api.get("/companies").then((r: { data: any; }) => r.data);
export const createCompany  = (data:{companyId:number; companyName:string; companyAddress:string}) =>
  api.post("/companies", data).then((r: { data: any; }) => r.data);
export const updateCompany  = (id:number, data:{companyName:string; companyAddress:string}) =>
  api.put(`/companies/${id}`, data).then((r: { data: any; }) => r.data);
export const deleteCompany  = (id:number) => api.delete(`/companies/${id}`);