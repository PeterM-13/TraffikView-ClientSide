let siteData = [];
let trafficData = [];
let totalSites = 19500;

export let mapData = [];

// See useful docs: https://webtris.highwaysengland.co.uk/api/swagger/ui/index#/
async function fetchTrafficData(low=0, high=19500) {
    for (let site=low; site<high; site++) {
        try {
            const response = await fetch(`https://webtris.highwaysengland.co.uk/api/v1/reports/Daily?sites=${site}%2C${site}&start_date=01012024&end_date=01012024&page=60&page_size=1`);

            // Error handling
            if (!response.ok) {
                totalSites -= 1;
                throw new Error("Network response was not ok");
            }

            const text = await response.text();

            if (!text) {
                totalSites -= 1;
                continue;
            }

            let data;

            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error(`Error parsing JSON for site ${site}:`, error);
                console.log("Raw response:", text);
                totalSites -= 1;
                continue;
            }

            // Data processing
            if (data.Rows && data.Rows.length > 0) {
                const processedData = {
                    date: data.Rows[0]["Report Date"],
                    time: data.Rows[0]["Time Period Ending"],
                    volume: data.Rows[0]["Total Volume"],
                    avgSpeed: data.Rows[0]["Avg mph"] || "--",
                    siteName: siteData[site].name,
                    lat: siteData[site].lat,
                    lon: siteData[site].lng
                }

                // Data storage
                trafficData.push(processedData);

                if (siteData[site] && siteData[site].lat && siteData[site].lat && processedData.volume) {
                    mapData.push([siteData[site].lat, siteData[site].lng, processedData.volume / 350.0]);
                }
            } else {
                totalSites -= 1;
            }
        } catch (error) {
            console.log("Error fetching some data:", error);
        }
    }

    console.log("Finished fetching ALL data");
}

// site data required to know the location of traffic reports.
async function fetchSiteData() {
    try {
        const response = await fetch("https://webtris.highwaysengland.co.uk/api/v1/sites");
        const data = await response.json();
        siteData = data.sites.map(site => ({
            id: site.Id,
            name: site.Name,
            lat: site.Latitude,
            lng: site.Longitude,
        }));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

export function searchForSite(siteNameInput) {
    let matches = [];
    let avgLat = 0;
    let avgLon = 0;

    // If site name does not contain any numbers return -1
    if (!/\d/.test(siteNameInput)) {
        return -1;
    }

    for (let site=0; site<siteData.length; site++) {
        const siteNameSplit = siteData[site].name.split(" ");
        const type = siteNameSplit[0];
        let realSiteName;

        if (type == "MIDAS") {
            realSiteName = siteNameSplit[3];
            realSiteName = realSiteName.split('/')[0];
        } else if (type == "TAME"){
            realSiteName = siteNameSplit[5];
        }

        if (realSiteName == siteNameInput) {
            if (siteData[site].lat && siteData[site].lng) {
                matches.push([siteData[site].lat, siteData[site].lng]);
                avgLat += siteData[site].lat;
                avgLon += siteData[site].lng;
            }
        }
    }

    let numMatches = matches.length;

    if (numMatches > 0) {
        avgLat /= numMatches;
        avgLon /= numMatches;

        return {
            lat: avgLat,
            lng: avgLon,
            matches: matches.length,
        };
    }

    return -1;
}

export function searchForSiteLatLng(lat, lng){
    const traffDataCopy = trafficData;
    const siteRadius = 0.001;

    for (let site=0; site<traffDataCopy.length; site++) {
        if (traffDataCopy[site].lat < lat + siteRadius && traffDataCopy[site].lat > lat - siteRadius && traffDataCopy[site].lon < lng + siteRadius && traffDataCopy[site].lon > lng - siteRadius) {
            // Site found in range
            return traffDataCopy[site];
        }
    }

    return -1;
}

export function calcProgress(){
    return Math.round((trafficData.length / totalSites) * 100);
}

async function initialiseDataFetching() {
    await fetchSiteData();

	totalSites = siteData.length;
	const fetchPromises = [];
	const step = 1000;

	for (let i = 0; i < 19500; i += step) {
		fetchPromises.push(fetchTrafficData(i, Math.min(i + step, 19500)));
	}

	Promise.all(fetchPromises);
	console.log("Finished fetching ALL data");
}

initialiseDataFetching();
