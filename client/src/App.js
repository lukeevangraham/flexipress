import { useEffect } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import { getUser } from "./store/actions";

import "./App.css";

function App({ getUser }) {
  useEffect(() => {
    getUser();
  }, [getUser]);

  const routes = (
    <Routes>
      <Route path="/" element={Home} />
      <Route path="*" element={Home} />
    </Routes>
  );

  return <BrowserRouter>{routes}</BrowserRouter>;
}

const mapStateToProps = (state) => ({
  userEmail: state.auth.email,
  userId: state.auth.id,
});

export default connect(mapStateToProps, { getUser })(App);
