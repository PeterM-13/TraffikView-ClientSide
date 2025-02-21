import {userLocationStore} from "../stores/locationStore.js";
import {geolocationPermissionStore} from "../stores/geolocationPermissionStore.js";
import {fetchIPLocation} from "./ipLocationService.js";

let watchId = null;

export function initGeolocationPermission() {
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: "geolocation" })
            .then(permissionStatus => {
                geolocationPermissionStore.set(permissionStatus.state);

                permissionStatus.addEventListener("change", () => {
                    geolocationPermissionStore.set(permissionStatus.state);
                });
            })
            .catch(error => {
                console.warn("Permission check failed:", error);
            });
    }
}

export async function initGetGeolocation() {
    if (!navigator.geolocation) {
        console.warn("Geolocation unavailable; using fallback");
        await fetchIPLocation();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLocationStore.set({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
        },
        async (err) => {
            console.warn("Geolocation position error:", err);
            await fetchIPLocation();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

export function startGeolocationWatch() {
    stopGeolocationWatch();

    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            userLocationStore.set({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
        },
        (err) => {
            console.warn("Geolocation watch error:", err);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

export function stopGeolocationWatch() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}
