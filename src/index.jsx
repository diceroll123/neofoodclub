import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";
import FaviconGenerator from "./app/FaviconGenerator";
import { StateProvider } from "./app/RoundState";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";

// Vite-specific environment variable access
window.ENV = {
  REACT_APP_VERCEL_GIT_COMMIT_SHA: import.meta.env
    .REACT_APP_VERCEL_GIT_COMMIT_SHA,
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <FaviconGenerator />
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <StateProvider>
        <App />
      </StateProvider>
    </ChakraProvider>
  </React.StrictMode>
);
