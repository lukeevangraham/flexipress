import axios from "axios";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Switch,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Home from "./components/Home/Home";
import Member from "./components/Member/Member";
import { useAuth } from "./contexts/AuthContext";

import "./App.css";

const App = () => {
  const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    axios.get("http://localhost:3000/api/user_data").then((res) => {
      if (res.data.id) {
        setIsLoggedIn(true);
        setAuthUser(res.data);
      }
    });
  }, [setIsLoggedIn, setAuthUser]);

  let routes;

  switch (isLoggedIn) {
    case true:
      routes = routes = (
        <Routes>
          <Route path="/member" element={<Member />} />
          <Route path="/" element={<Member />} />
        </Routes>
      );

      break;

    default:
      routes = (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
      break;
  }

  return (
    <>
      {/* <Dashboard /> */}
      {/* {console.log("Logged in: ", isLoggedIn)} */}
      {console.log("U: ", authUser)}
      <BrowserRouter>{routes}</BrowserRouter>
    </>
  );
};

export default App;
