<script>
    import Router from "svelte-spa-router";
    import {wrap} from "svelte-spa-router/wrap";

    import Map from "./features/Map.svelte";
    import Login from "./features/Login.svelte";

    export let mapData;

    const routes = {
        "/": wrap({
            component: Map,
            props: { mapData }
        }),
        "/login": Login
    };
</script>

<Router {routes} />
