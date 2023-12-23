// import { useEffect, useState } from "react";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./components/Dashboard/Dashboard";
import Home from "./components/Home/Home"

import "./App.css";

function App({}) {
  // const routes = (
  //   <Routes>
  //     <Route path="/" element={Home} />
  //     <Route path="*" element={Home} />
  //   </Routes>
  // );

  return (
    <>
      <AuthProvider>
        <Dashboard />
        <Home />
      </AuthProvider>
    </>
  );
}

export default App;
