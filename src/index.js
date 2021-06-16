import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import FaviconGenerator from "./app/FaviconGenerator";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { StateProvider } from "./app/RoundState";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    colors: {
        nfc: {
            blue: "#90CDF4",
            blueDark: "#4BA0E4",

            gray: "#F7FAFC",
            grayDark: "#2D3748",

            green: "#9AE6B4",
            greenDark: "#50C17F",

            red: "#FEB2B2",
            redDark: "#F76C6C",

            orange: "#FBD38D",
            orangeDark: "#F0923E",

            yellow: "#FAF089",
            yellowDark: "#EFCF50",
        },
    },
});

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
