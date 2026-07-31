import api from "./api";

export const UsuarioService = {
  findAll: () => api.get("/usuarios").then(res => res.data),
  create: (data: any) => api.post("/usuarios", data).then(res => res.data),
  findOne: (id: number | string) => api.get(`/usuarios/${id}`).then(res => res.data),
  update: (id: number | string, data: any) => api.patch(`/usuarios/${id}`, data).then(res => res.data),
  remove: (id: number | string) => api.delete(`/usuarios/${id}`).then(res => res.data),
};