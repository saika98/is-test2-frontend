import axios from "axios";

// クラウド環境の時のURL（テストデプロイ）
// const DEFAULT_API_BASE_URL = "http://is-test-backend-java-env.eba-jz65xr2a.ap-northeast-3.elasticbeanstalk.com";
// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
//   timeout: 10000,
// });

// ローカル環境の時のURL（開発時はこちらを使用）
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  timeout: 10000,
});

// backendが起動しているかの確認api
export const message = () => api.get("/message").then((r: { data: any; }) => r.data);

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