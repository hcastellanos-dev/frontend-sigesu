import api from "./api";

export const EdificioService = {
  findAll: async () => {
    const res = await api.get("/edificios");
    return res.data;
  },

  findOne: async (id: number) => {
    const res = await api.get(`/edificios/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post("/edificios", data);
    return res.data;
  },

  update: async (id: number, data: any) => {
    // Usamos PUT como definiste en tu controlador de NestJS
    const res = await api.put(`/edificios/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await api.delete(`/edificios/${id}`);
    return res.data;
  },
};