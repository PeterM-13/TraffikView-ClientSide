<script>
    import {push} from "svelte-spa-router";

    import {userLoggedIn} from "../stores/userStore.js";

    let open = $state(false);

    function navigateToLogin() {
        push("/login");
    }

    function navigateToLogout() {
        userLoggedIn.set(false);
        open = false;
        push("/");
    }
</script>

<div class="dropdown-with-button">
    <button
        id="menuButton"
        onclick={() => open = !open}
        class="{open ? 'activeButton' : ''}"
    >
        <img src="menu_icon.svg" alt="Menu">
    </button>

    {#if open}
        <div id="menuDropdown">
            {#if $userLoggedIn}
                <div
                    class="menu-item"
                    role="button"
                    tabindex="0"
                    onmousedown={navigateToLogout}
                    onkeydown={navigateToLogout}
                    style="color: red;"
                >
                    Logout
                </div>
            {:else}
                <div
                    class="menu-item"
                    role="button"
                    tabindex="0"
                    onmousedown={navigateToLogin}
                    onkeydown={navigateToLogin}
                    style="color:green"
                >
                    Login
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .dropdown-with-button {
        position: relative;
        display: inline-block;
    }

    #menuDropdown {
        display: flex;
        position: absolute;
        z-index: 1;

        background-color: var(--white);
        border: var(--light-grey) solid 1px;
        min-width: 120px;

        cursor: pointer;

        flex-direction: column;

        .menu-item {
            padding: 5px 10px;

            &:hover {
                background-color: var(--light-grey);
            }
        }
    }
</style>
