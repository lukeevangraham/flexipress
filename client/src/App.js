import { connect } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home"

import "./App.css";

function App() {

const routes = (
<Routes>
  <Route path="/" element={Home} />
  <Route path="*" element={Home} />
</Routes>
)

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}



export default connect()(App);
