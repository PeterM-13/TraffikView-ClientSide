<script>
    import SearchBar from "./SearchBar.svelte";
    import GeolocationButton from "./GeolocationButton.svelte";
    import MenuButton from "./MenuButton.svelte";

    let collapsed = $state(false);
</script>

<div id="navBar" class="flexRow">
    <div id="topBar" class="flexRow">
        <img id="logoIcon" src="logo_icon.svg" alt="Logo">
        <img id="title" src="TraffikView_text.svg" alt="TraffikView" />

        <button
            class="collapseExpandArrow"
            onclick={() => collapsed = !collapsed}
        >
            <img
                src={collapsed ? "src/assets/expand_arrow_icon.svg" : "src/assets/collapse_arrow_icon.svg"}
                alt={collapsed ? "Expand Arrow" : "Collapse Arrow"}
            >
        </button>
    </div>

    <div class={(collapsed ? "collapsedNavElements": "navElements") + " flexRow"}>
        <SearchBar />
        <GeolocationButton />
        <MenuButton />
    </div>
</div>

<style>
    #navBar {
        position: absolute;
        top: 100px;
        left: 50%;
        transform: translate(-50%, 0);
        z-index: 1000;

        background-color: var(--white);
        padding: 10px;
        border-radius: 10px;

        border: var(--medium-grey) solid 1px;

        #topBar {
            .collapseExpandArrow {
                display: none;

                img {
                    height: 10px;
                }

                &:hover {
                    cursor: pointer;
                }
            }

            #logoIcon {
                height: 45px;
            }

            #title {
                height: 15px;
            }
        }

        @media screen and (max-width: 750px) {
            flex-wrap: wrap;
            justify-content: center;

            .navElements {
                flex-wrap: wrap;
                justify-content: center;
            }

            .collapsedNavElements {
                display: none;
            }

            #topBar > .collapseExpandArrow {
                display: block;
            }
        }
    }
</style>
