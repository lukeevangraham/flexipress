import React, { useState, useEffect, useContext } from "react";
import server from "../apis/server";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider(props) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   // subscribe to auth service

  //   async function fetchUserData() {
  //     let res = await server.get("user_data");
  //     // res = await res.json()
  //     setAuthUser(res.data);
  //   }

  //   fetchUserData();
  // }, []);

  // const signUp = (form) => {
  //   console.log("Signing up", form)
  // }

  const signIn = async (form) => {
    console.log("Singing in: ", form);
  };

  // const getUser = async () => {
  //   console.log("getting user")
  //   const response = await server.get("user_data")

  //   console.log("RES: ", response)

  // }

  // const subscribe = AuthService.subscribe((user) => {
  //   if (user) {
  //     setIsLoggedIn(true);
  //     setAuthUser(user);
  //   } else {
  //     setIsLoggedIn(false);
  //     setAuthUser(null);
  //   }
  // });

  // const subscribe = async () => {
  //   if (user) {
  //     setIsLoggedIn(true);
  //     setAuthUser(user);
  //   } else {
  //     setIsLoggedIn(false);
  //     setAuthUser(null);
  //   }
  // });

  //   return subscribe;
  // });

  const value = {
    authUser,
    setAuthUser,
    isLoggedIn,
    setIsLoggedIn,
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}
