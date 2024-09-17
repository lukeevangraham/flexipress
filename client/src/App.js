import axios from "axios";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import server from "./apis/server";

import Dashboard from "./components/Dashboard/Dashboard";
import Home from "./components/Home/Home";
import Member from "./components/Member/Member";
import Events from "./components/Member/Events/Events";
import CreateEvent from "./components/Member/Events/Create/Create";
import Articles from "./components/Member/Articles/Articles";
import Volunteer from "./components/Member/Volunteer/Volunteer";
import Sidebar from "./components/Member/Sidebar/Sidebar";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

import classes from "./App.module.scss";

const App = () => {
  const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    // fetch("http://localhost:3001/api/user_data/", {
    //   method: "get",
    // })
    server
      .get("/user_data")
      .then((res) => {
        if (res.data.id) {
          setIsLoggedIn(true);
          setAuthUser(res.data);
        }
      })
      .catch((err) => console.log("ERR: ", err));
  }, [setIsLoggedIn, setAuthUser]);

  let routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );

  if (isLoggedIn) {
    routes = (
      <Routes>
        <Route path="/" element={<Member />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/edit/:id" element={<CreateEvent />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/member" element={<Member />} />
        <Route path="*" element={<Navigate to="/" />} replace />
      </Routes>
    );
  }

  // switch (isLoggedIn) {
  //   case true:
  //     routes = (
  //       <Routes>
  //         <Route path="/" element={<Member />} exact />
  //         <Route path="/events" element={<Events />} />
  //         <Route path="/events/create" element={<CreateEvent />} />
  //         <Route path="/articles" element={<Articles />} />
  //         <Route path="/member" element={<Member />} />
  //       </Routes>
  //     );

  //     break;
  //   case false:
  //     routes = (
  //       <Routes>
  //         <Route path="/" element={<Home />} />
  //         <Route path="*" element={<Navigate to="/" />} />
  //       </Routes>
  //     );

  //   default:
  //     routes = (
  //       <Routes>
  //         <Route path="/" element={<Home />} />
  //         <Route path="*" element={<Navigate to="/" />} />
  //       </Routes>
  //     );
  //     break;
  // }

  return (
    <>
      <BrowserRouter>
        {isLoggedIn ? (
          <>
            <div className={classes.App}>
              <Sidebar />
              <main className={classes.App__Main}>{routes}</main>
            </div>
          </>
        ) : (
          <>{routes}</>
        )}
        {console.log("U: ", authUser)}
        {console.log("HERE: ", process.env.SERVER_URL)}
      </BrowserRouter>
    </>
  );
};

export default App;
