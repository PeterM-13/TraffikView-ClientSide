<script>
    import * as L from "leaflet";
    import "leaflet/dist/leaflet.css";
    import "leaflet.heat";
    import {onDestroy, onMount} from "svelte";

    import {geolocationPermissionStore} from "../stores/geolocationPermissionStore.js";
    import {userLocationStore, fallbackLocationStore} from "../stores/locationStore.js";
    import {createMap, getMap, destroyMap} from "../services/mapService.js";
    import {
        initGetGeolocation,
        initGeolocationPermission,
        startGeolocationWatch,
        stopGeolocationWatch
    } from "../services/geolocationService.js";
    import NavBar from "./NavBar.svelte";
    import ProgressIndicator from "./ProgressIndicator.svelte";

    const initialZoom = 11;
    const minZoom = 7;
    const maxZoom = 14;
    const maxBounds = [[46, -19.0], [59.0, 14.0]]; // England

    export let mapData;

    let heatLayer, userMarker;
    let mapReady = false;
    let hasCentredOnUser = false;

    const gradients = {
        low: { // Zoomed out
            0.1: "blue",
            0.2: "lime",
            0.3: "yellow",
            0.4: "red"
        },
        medium: { // Zoomed in
            0.2: "blue",
            0.3: "lime",
            0.4: "yellow",
            0.5: "orange",
            0.6: "red"
        },
        high: { // Zoomed in alot
            0.1: "blue",
            0.4: "lime",
            0.6: "yellow",
            0.8: "orange",
            1.0: "red"
        }
    };

    const currentLocationMarkerIcon = L.icon({
        iconUrl: "current-location-marker.svg",
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    onMount(() => {
        (async () => {
            await initGetGeolocation();
            initGeolocationPermission();
            createMapInstance();
            mapReady = true;
        })();
    });

    onDestroy(() => {
        stopGeolocationWatch();
        destroyMap();
        mapReady = false;
    });

    function createMapInstance() {
        const map = createMap({
            zoomControl: true,
            maxBounds: maxBounds,
            minZoom: minZoom,
            maxZoom: maxZoom
        });

        map.setView([$fallbackLocationStore.lat, $fallbackLocationStore.lng], initialZoom);

        heatLayer = L.heatLayer(mapData, {
            radius: 60,
            gradient: gradients.low
        }).addTo(map);

        map.on("zoomend", () => {
            const zoom = map.getZoom();
            let gradient, radius;
            if (zoom < 10) { // Zoomed out
                gradient = gradients.low;
                radius = 30;
            } else if (zoom >= 10 && zoom < 13) {
                gradient = gradients.medium;
                radius = 35;
            } else { // Really zoomed in
                gradient = gradients.high;
                radius = 25;
            }

            heatLayer.setOptions({ gradient, radius });
        });
    }

    $: if ($geolocationPermissionStore === "granted") {
        startGeolocationWatch();
    }

    $: if ($geolocationPermissionStore === "granted" && $userLocationStore && mapReady) {
        const map = getMap();

        if (userMarker) map.removeLayer(userMarker);

        userMarker = L.marker([$userLocationStore.lat, $userLocationStore.lng], {
            icon: currentLocationMarkerIcon
        }).addTo(map);

        if (!hasCentredOnUser) {
            map.setView([$userLocationStore.lat, $userLocationStore.lng], 12);
            hasCentredOnUser = true;
        }
    } else if ($geolocationPermissionStore === "denied" && userMarker) {
        const map = getMap();

        map.removeLayer(userMarker);
        userMarker = null;
    }

    $: if (
        ($geolocationPermissionStore === "unavailable" || $geolocationPermissionStore === "denied")
        && !isEqualLocation($fallbackLocationStore, { lat: 52.0406, lng: -0.7594 })
        && mapReady
    ) {
        const map = getMap();

        if (!hasCentredOnUser) {
            map.setView([$fallbackLocationStore.lat, $fallbackLocationStore.lng], 12);
            hasCentredOnUser = true;
        }
    }

    function isEqualLocation(a, b) {
        return a.lat === b.lat && a.lng === b.lng;
    }
</script>

<ProgressIndicator />
<NavBar />
<div id="map"></div>

<style>
    #map {
        height: 100vh;
        width: 100vw;
    }
</style>
