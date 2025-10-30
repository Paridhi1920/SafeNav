import api from "./api";

export const getAreaInfo = async (area) => {
  const res = await api.post("/hotspot/area-info", { area });
  return res.data;
};

export const compareAreas = async (area1, area2) => {
  const res = await api.post("/hotspot/compare", { area1, area2 });
  return res.data;
};