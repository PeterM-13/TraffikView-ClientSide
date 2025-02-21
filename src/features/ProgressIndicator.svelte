<script>
    import {calcProgress} from "../services/apiService.js";

    let progress = calcProgress();

    const updateProgress = () => {
        progress = calcProgress();
    };

    setInterval(updateProgress, 500); // Update progress every second
</script>

{#if progress < 100}
    <div id="progressIndicator" class="flexRow">
        <p>{progress}%</p>
    </div>
{/if}

<style>
    #progressIndicator {
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        z-index: 1000;
        height: 15px;
        font-size: 12px; /* Reduced text size */
    }
</style>
