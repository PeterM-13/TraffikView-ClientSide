import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import {searchForSiteLatLng} from "./apiService";

let mapInstance = null;

export function createMap(options) {
    if (mapInstance) {
        throw new Error("Map has already been initialised");
    }

    mapInstance = L.map("map", options);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
    }).addTo(mapInstance);

    // Add event listener for mouse movements
    mapInstance.on('mousemove', function(event) {
        const currentMapZoom = mapInstance.getZoom();
        if(currentMapZoom > 12) {
            const latLng = mapInstance.mouseEventToLatLng(event.originalEvent);
            const siteData = searchForSiteLatLng(latLng.lat, latLng.lng);
            if (siteData !== -1) { // If mouse near a site
                const siteNameSplit = siteData.siteName.split(" ");
                const siteNameDspl = siteNameSplit[3];
                L.popup()
                    .setLatLng([siteData.lat, siteData.lon])
                    .setContent(`
                        <h3>${siteNameDspl}</h3>
                        <p>Vehicles: ${siteData.volume}</p>
                        <p>Average Speed: ${siteData.avgSpeed}mph</p>
                        <!--<p>Time: ${siteData.time}</p>-->
                      `)
                    .openOn(mapInstance);
            }
        }
    });

    return mapInstance;
}

export function getMap() {
    return mapInstance || null;
}

export function destroyMap() {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
}
