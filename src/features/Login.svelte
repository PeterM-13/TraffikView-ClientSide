<script>
    import {push} from "svelte-spa-router";

    import {userLoggedIn} from "../stores/userStore.js";

    let email = "";
    let password = "";
    let isLogin = true;
    let error = "";

    async function handleSubmit() {
        try {
            const endpoint = isLogin ? "/api/login" : "/api/signup";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                userLoggedIn.set(true);
                localStorage.setItem("token", result.token);
                navigateToHome();
            } else {
                error = result.message || "Authentication failed";
            }
        } catch (err) {
            error = "Network error. Please try again.";
        }
    }

    function navigateToHome() {
        push("/");
    }
</script>

<div class="login-container">
    <button type="button" on:mousedown="{navigateToHome}" class="back-button">Back</button>
    <form on:submit|preventDefault={handleSubmit}>
        <h2>{isLogin ? "Log in with email" : "Sign up with email"}</h2>

        {#if error}
            <p class="error">{error}</p>
        {/if}

        <input
                type="email"
                placeholder="Email"
                bind:value={email}
                required
        />
        <input
                type="password"
                placeholder="Password"
                bind:value={password}
                required
        />

        <p class="sign-up-text">
            Need an account? <button type="button" on:click={() => isLogin = !isLogin} class="sign-up-link">Sign up</button>
        </p>

        <button type="submit" class="submit-button">
            {isLogin ? "Login" : "Sign Up"}
        </button>
    </form>
</div>

<style>
    :global(body) {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: #f9f9f9;
        font-family: Arial, sans-serif;
    }

    .login-container {
        width: 300px;
        margin: 50px auto;
        padding: 20px;
        background: white;
        stroke: #ccc;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        font-family: Arial, sans-serif;
        position: relative;
    }

    .back-button {
        position: absolute;
        top: 10px;
        left: 20px;
        background: none;
        border: none;
        font-size: 14px;
        cursor: pointer;
    }

    h2 {
        text-align: center;
        font-size: 20px;
        margin-bottom: 20px;
    }

    input {
        display: block;
        width: 90%;
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 14px;
    }

    .sign-up-text {
        text-align: left;
        font-size: 14px;
        margin: 10px 5px;
        white-space: nowrap;
    }

    .sign-up-link {
        display: inline;
        background: none;
        border: none;
        color: #449ae0;
        font-size: 14px;
        cursor: pointer;
        padding: 0 5px;
        text-decoration: underline;
    }

    .submit-button {
        width: 100%;
        padding: 10px;
        background-color: #6ab4e1;
        color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
    }

    .error {
        color: red;
        text-align: center;
        margin-bottom: 10px;
        font-size: 14px;
    }

    button:focus,
    input:focus {
        outline: none;
    }
</style>
