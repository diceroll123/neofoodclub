import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import FaviconGenerator from "./app/FaviconGenerator";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { StateProvider } from "./app/RoundState";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

ReactDOM.render(
    <React.StrictMode>
        <FaviconGenerator />
        <StateProvider>
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider>
        </StateProvider>
    </React.StrictMode>,
    document.getElementById("root")
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
