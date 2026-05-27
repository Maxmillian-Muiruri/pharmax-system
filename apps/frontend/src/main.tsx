import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LayoutWrapper } from "./components/dev/core.tsx";
import "./styles/index.css";

// Register service worker for PWA

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LayoutWrapper>
      <App />
    </LayoutWrapper>
  </StrictMode>,
);
