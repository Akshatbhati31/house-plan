import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/studios.css";
import "./styles/flows.css";
import App from "./App";
import { AppStoreProvider } from "./lib/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </StrictMode>,
);
