<script>
    import { onMount } from "svelte";
  
    let stats = { totalVisits: 0, pageVisits: {} }; // Začetna vrednost
  
    // Beleženje obiska
    async function logVisit(page) {
      try {
        const response = await fetch("http://localhost:5000/log-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page }),
        });
        const data = await response.json();

        console.log(data)
  
        // Posodobimo statistiko na frontendu
        stats.totalVisits = data.stats.totalVisits;
        stats.pageVisits = { ...data.stats.pageVisits };
      } catch (error) {
        console.error("Error logging visit:", error);
      }
    }
  
    // Pridobivanje statistik ob nalaganju
    onMount(async () => {
      try {
        const response = await fetch("http://localhost:5000/stats");
        stats = await response.json();
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    });
  </script>
  
  <style>
    .stats {
      margin-top: 20px;
      padding: 10px;
      border: 1px solid #ddd;
      background: #f9f9f9;
    }
  </style>
  
  <h1>Visit Tracker</h1>
  
  <!-- Uporabimo `on:click` za Svelte dogodke -->
  <button on:click={() => logVisit("home")}>Log Visit (Home)</button>
  <button on:click={() => logVisit("about")}>Log Visit (About)</button>
  
  <!-- Prikaz statistike -->
  {#if stats}
    <div class="stats">
      <h2>Statistics</h2>
      <p>Total Visits: {stats.totalVisits}</p>
      <ul>
        {#each Object.entries(stats.pageVisits) as [page, count]}
          <li>{page}: {count} visits</li>
        {/each}
      </ul>
    </div>
  {:else}
    <p>Loading stats...</p>
  {/if}
  