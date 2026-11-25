
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { AuthProvider } from "./app/providers/AuthProvider";
import { ChurchProvider } from "./app/providers/ChurchProvider";

import "./shared/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ChurchProvider>
          <App />
        </ChurchProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
