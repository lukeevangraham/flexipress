import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import server from "./apis/server";
import Home from "./components/Home/Home";
import Member from "./components/Member/Member";
import Events from "./components/Member/Events/Events";
import Ministries from "./components/Member/Ministries/Ministries";
import AddMinistry from "./components/Member/Ministries/Add/AddMinistry";
import CreateEvent from "./components/Member/Events/Create/Create";
import Articles from "./components/Member/Articles/Articles";
import ArticleCreate from "./components/Member/Articles/Create/Create";
// import Set from "./components/Member/Set/Set";
// import SetCreate from "./components/Member/Set/Create/Create";
import Volunteer from "./components/Member/Volunteer/Volunteer";
import VolunteerCreate from "./components/Member/Volunteer/Create/Create";
import Settings from "./components/Member/Settings/Settings";
import Users from "./components/Member/Settings/Users/Users";
import AddUser from "./components/Member/Settings/Users/Add/AddUser";
import Roles from "./components/Member/Settings/Roles/Roles";
import Sidebar from "./components/Member/Sidebar/Sidebar";
import HomeInfoSingle from "./components/Member/InfoSingles/Home/Home";
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
      <Route path="/accept" element={<Home />} />
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
        <Route
          path="/articles/create"
          element={<ArticleCreate set={"articles"} />}
        />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/ministries/add" element={<AddMinistry />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/volunteer/create" element={<VolunteerCreate />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/users" element={<Users />} />
        <Route path="/settings/users/add" element={<AddUser />} />
        <Route path="/settings/roles" element={<Roles />} />
        <Route path="/member" element={<Member />} />
        <Route path="/singles/home" element={<HomeInfoSingle />} />
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
      </BrowserRouter>
    </>
  );
};

export default App;
