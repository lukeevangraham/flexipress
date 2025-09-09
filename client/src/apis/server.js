import axios from "axios";

const server = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  withCredentials: true,
});

const getMinistries = async (authUser, setForm) => {
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
};

export default server;

export { getMinistries };
