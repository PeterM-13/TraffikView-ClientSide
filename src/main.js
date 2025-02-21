import {mount} from "svelte";

import "./app.css";
import App from "./App.svelte";
import {mapData} from "./services/apiService.js";

const app = mount(App, {
    target: document.getElementById("app"),
    props: {
        mapData
    }
});

export default app;
