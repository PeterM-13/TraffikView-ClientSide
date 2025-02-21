<script>
    import {userLocationStore} from "../stores/locationStore.js";
    import {geolocationPermissionStore} from "../stores/geolocationPermissionStore.js";
    import {getMap} from "../services/mapService.js";

    function centreOnUser() {
        const map = getMap();

        if ($geolocationPermissionStore === "granted" && $userLocationStore) {
            map.setView([$userLocationStore.lat, $userLocationStore.lng], 14);
        } else {
            alert("Location permissions are required to centre on your position");
        }
    }
</script>

<button id="geolocationButton" on:click={centreOnUser}>
    <img src="locate_icon.svg" alt="Geo-Locate">
</button>

<style></style>
