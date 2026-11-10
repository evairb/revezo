
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import "./shared/styles/index.css";
import { AuthProvider } from "./app/providers/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);