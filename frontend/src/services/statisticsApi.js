import axios from "axios";

const API_URL = "http://127.0.0.1:5000/statistics/crime_stats";

export const getCrimeStats = async (filters = {}) => {
  try {
    const response = await axios.post(API_URL, filters);
    return response.data;
  } catch (err) {
    console.error("Error fetching crime stats:", err);
    throw err;
  }
};
