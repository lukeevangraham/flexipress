import axios from "axios";

// Check if we are in production
const isProd = window.location.hostname !== "localhost";

const server = axios.create({
  // Use the hardcoded URL for production to avoid .env build issues
  baseURL: isProd
    ? "https://fpserver.grahamwebworks.com/api"
    : "http://localhost:3001/api",
  withCredentials: true,
});

const getMinistries = async (authUser, setForm) => {
  try {
    const ministriesListRes = await server.get(`/ministries/${authUser.orgId}`);
    setForm((prev) => ({
      ...prev,
      ministries: {
        ...prev.ministries,
        elementConfig: {
          options: ministriesListRes.data.map((m) => ({
            value: m.id,
            displayValue: m.name,
          })),
        },
      },
    }));
  } catch (err) {
    console.error("Error fetching ministries:", err);
  }
};

export default server;
export { getMinistries };
