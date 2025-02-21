import {writable} from "svelte/store";

export const userLocationStore = writable(null);
export const fallbackLocationStore = writable({ lat: 52.0406, lng: -0.7594 }); // Milton Keynes
