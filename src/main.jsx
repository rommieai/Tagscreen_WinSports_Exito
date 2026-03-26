import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { SessionProvider } from "./context/Session/SessionContext.jsx";



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider> { /* Provider for sessionID */ }
        <App />
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>
);
