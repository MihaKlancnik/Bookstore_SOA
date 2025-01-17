<script>
  import { onMount } from "svelte";
  import { Chart } from "chart.js/auto";

  let stats = { totalVisits: 0, pageVisits: {} };

  let chart;

  onMount(async () => {
    try {
      const response = await fetch("http://localhost:5000/stats");
      stats = await response.json();
      initChart();
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  });

  function initChart() {
    const ctx = document.getElementById("visitChart").getContext("2d");

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(stats.pageVisits),
        datasets: [
          {
            label: "Obiski strani",
            data: Object.values(stats.pageVisits),
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
            grid: {
              color: "#e5e7eb",
            },
            ticks: {
              color: "#4b5563",
            },
          },
          x: {
            grid: {
              color: "#e5e7eb",
            },
            ticks: {
              color: "#4b5563",
            },
          },
        },
      },
    });
  }

  function updateChart() {
    chart.data.labels = Object.keys(stats.pageVisits);
    chart.data.datasets[0].data = Object.values(stats.pageVisits);
    chart.update();
  }
  
</script>

<style>
  canvas {
    max-width: 100%;
    height: 400px;
  }
</style>

<div class="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
  <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
    <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">Visit Tracker</h1>

    {#if stats}
      <div>
        <div class="bg-blue-100 text-blue-800 p-4 rounded-md mb-6">
          <h2 class="text-2xl font-semibold">Statistics</h2>
          <p class="text-lg mt-2">Total Visits: <span class="font-bold">{stats.totalVisits}</span></p>
        </div>

        <ul class="divide-y divide-gray-200 mb-6">
          {#each Object.entries(stats.pageVisits) as [page, count]}
            <li class="flex justify-between items-center py-2">
              <span class="text-gray-700 font-medium">{page}</span>
              <span class="text-gray-900 font-bold">{count} visits</span>
            </li>
          {/each}
        </ul>

        <div class="relative">
          <canvas id="visitChart"></canvas>
        </div>
      </div>
    {:else}
      <p class="text-center text-gray-600">Loading stats...</p>
    {/if}
  </div>
</div>
