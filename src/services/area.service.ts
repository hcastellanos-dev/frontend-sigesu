import api from "./api";

export const AreaService = {
  findAll: async () => (await api.get("/areas")).data,
  findOne: async (id: number) => (await api.get(`/areas/${id}`)).data,
  create: async (data: any) => (await api.post("/areas", data)).data,
  update: async (id: number, data: any) => (await api.put(`/areas/${id}`, data)).data,
  remove: async (id: number) => (await api.delete(`/areas/${id}`)).data,
};