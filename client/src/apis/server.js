import axios from "axios";

export default axios.create({
  baseURL: "https://fpserver.grahamwebworks.com/api",
  withCredentials: true,
});
