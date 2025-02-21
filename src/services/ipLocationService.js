import {fallbackLocationStore} from "../stores/locationStore.js";

export async function fetchIPLocation() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Failed to fetch IP location");
        const data = await response.json();

        if (
            data &&
            typeof data.latitude === "number" &&
            typeof data.longitude === "number" &&
            data.country_name === "United Kingdom"
        ) {
            fallbackLocationStore.set({ lat: data.latitude, lng: data.longitude });
        } else {
            console.warn("IP location not in UK or incomplete; using fallback of Milton Keynes");
        }
    } catch (err) {
        console.error("IP location fetch failed:", err);
    }
}
