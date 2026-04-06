import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles/input-fix.css";
import "./styles/contrast-fix.css";
import "./Responsive.css";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
