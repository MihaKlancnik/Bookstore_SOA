<script>
  import { onMount } from "svelte";
  import { Chart } from "chart.js/auto"; // Import Chart.js

  let stats = { totalVisits: 0, pageVisits: {} }; // Initial value

  // Chart.js ref for the chart
  let chart;

  // Fetch statistics when the component mounts
  onMount(async () => {
    try {
      const response = await fetch("http://localhost:5000/stats");
      stats = await response.json();

      // Initialize the chart with initial data
      initChart();
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  });

  // Function to initialize the chart
  function initChart() {
    const ctx = document.getElementById("visitChart").getContext("2d");

    chart = new Chart(ctx, {
      type: "bar", // You can change this to "pie" or "line" for different types of charts
      data: {
        labels: Object.keys(stats.pageVisits), // Page names
        datasets: [
          {
            label: "Page Visits",
            data: Object.values(stats.pageVisits), // Visits count
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Function to update the chart with new stats
  function updateChart() {
    // Update chart data
    chart.data.labels = Object.keys(stats.pageVisits);
    chart.data.datasets[0].data = Object.values(stats.pageVisits);

    // Update the chart
    chart.update();
  }
</script>

<style>
  .stats {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    background: #f9f9f9;
  }

  canvas {
    max-width: 100%;
    height: 400px;
  }
</style>

<h1>Visit Tracker</h1>

{#if stats}
  <div class="stats">
    <h2>Statistics</h2>
    <p>Total Visits: {stats.totalVisits}</p>
    <ul>
      {#each Object.entries(stats.pageVisits) as [page, count]}
        <li>{page}: {count} visits</li>
      {/each}
    </ul>

    <!-- Display the chart -->
    <canvas id="visitChart"></canvas>
  </div>
{:else}
  <p>Loading stats...</p>
{/if}
