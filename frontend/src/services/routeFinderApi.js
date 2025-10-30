import api from "./api";

export const getSafeRoute = async (source, destination) => {
  const res = await api.post("/safe-route", { source, destination });
  return res.data;
};