import React from "react";
import * as ReactDOMClient from "react-dom/client";
import "./index.css";
import App from "./app/App";
import FaviconGenerator from "./app/FaviconGenerator";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { StateProvider } from "./app/RoundState";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";

const rootElement = document.getElementById("root");
const root = ReactDOMClient.createRoot(rootElement);

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

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
