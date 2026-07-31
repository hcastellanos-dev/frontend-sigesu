import api from "./api";
export const RolService = {
  findAll: () => api.get("/roles"),
  create: (data:any) => api.post("/roles", data),
};
