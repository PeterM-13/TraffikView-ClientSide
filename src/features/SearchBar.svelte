<script>
    import {writable, get} from "svelte/store";
    import {onMount} from "svelte";

    import {searchForSite} from "../services/apiService.js";
    import {getMap} from "../services/mapService.js";
    import {userLoggedIn} from "../stores/userStore.js";

    let searchText = writable("");
    let error = writable(false);
    let lastSearches = writable([]);
    let dropdownVisible = writable(false);

    function handleClickOutside(event) {
        const searchContainer = document.getElementById("searchContainer");
        if (searchContainer && !searchContainer.contains(event.target)) {
            dropdownVisible.set(false);
        }
    }

    function setupClickListener() {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            performSearch($searchText);
        }
    }

    function performSearch(text) {
        text = text.toUpperCase();
        if (text.trim() === "") return;

        let site = searchForSite(text);
        if (site !== -1) {
            const map = getMap();
            const zoom = Math.floor(mapNumber(Math.min(site.matches, 1000), 0, 1000, 14, 10));
            map.setView([site.lat, site.lng], zoom);
            error.set(false);
            saveSearch(text);
        } else {
            error.set(true);
            setTimeout(() => error.set(false), 1000);
        }
    }

    function mapNumber(x, in_min, in_max, out_min, out_max) {
        return out_min + ((x - in_min) * (out_max - out_min)) / (in_max - in_min);
    }

    async function saveSearch(query) {
        if (!$userLoggedIn) return;

        const token = localStorage.getItem("token");
        const response = await fetch("/api/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });

        if (response.ok) {
            console.log("Search saved");
            getLastSearches();
        } else {
            console.error("Failed to save search");
        }
    }

    async function getLastSearches() {
        if (!$userLoggedIn) {
            lastSearches.set([]);
            return;
        }

        const token = localStorage.getItem("token");
        const response = await fetch("/api/searches", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const searches = await response.json();

            const seen = new Set();
            const uniqueSearches = searches.filter(search => {
                if (seen.has(search)) {
                    return false;
                }
                seen.add(search);
                return true;
            });

            lastSearches.set(uniqueSearches);
        } else {
            console.error("Failed to retrieve searches");
            lastSearches.set([]);
        }
    }

    function handleFocus() {
        if ($userLoggedIn) {
            dropdownVisible.set(true);
            getLastSearches();
        }
    }

    function handleSearchItemClick(search) {
        searchText.set(search);
        document.getElementById("searchInput")?.focus();
        performSearch(search);
        dropdownVisible.set(false);
    }

    onMount(() => {
        return setupClickListener();
    });
</script>

<div id="searchContainer" style="position: relative;">
    <div id="searchBar" class="flexRow">
        <img src="search_icon.svg" alt="Search">
        <input
                type="text"
                id="searchInput"
                placeholder="Search..."
                bind:value={$searchText}
                on:keypress={handleKeyPress}
                on:focus={handleFocus}
                class:shake={$error}
                class:error={$error}
        />
    </div>

    <!-- Search suggestions dropdown -->
    {#if $userLoggedIn && $dropdownVisible && $lastSearches.length > 0}
        <div id="searchDropdown">
            {#each $lastSearches as search}
                <div
                        class="search-item"
                        on:click={() => handleSearchItemClick(search)}
                >
                    {search}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    #searchBar {
        background-color: var(--light-grey);
        padding: 5px;
        display: flex;
        align-items: center;

        img {
            height: 30px;
        }

        input {
            width: 300px;
            font-size: large;
            border: none;
            outline: none;
            background: none;
            transition: color 0.3s;

            &::placeholder {
                color: var(--dark-grey);
            }

            @media screen and (max-width: 750px) {
                width: 275px;
            }
        }

        &:hover {
            box-shadow: inset 0 5px 15px var(--medium-grey);
            cursor: pointer;
        }
    }

    #searchDropdown {
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        width: 100%;
        max-height: 150px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    .search-item {
        padding: 10px;
        cursor: pointer;
    }

    .search-item:hover {
        background: #f0f0f0;
    }

    .error {
        color: rgb(250, 37, 37);
    }

    .shake {
        animation: shake 1s;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(3px); }
    }
</style>
