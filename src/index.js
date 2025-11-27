import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"; // make sure this exists

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

serviceWorkerRegistration.register(); // 👈 important
