<script>
  import { onMount } from "svelte";
  import { Chart } from "chart.js/auto";

  let stats = { totalVisits: 0, pageVisits: {} };
  let mostViewedBooks = [];
  let detailedBooks = [];
  let allEnrichedBooks = [];

  let chart;

  onMount(async () => {
    try {
      // Obstoječi REST API klic za obisk stats
      const statsResponse = await fetch("https://visitors-latest.onrender.com/stats");
      stats = await statsResponse.json();

      // Obstoječi REST API klic za najbolj ogledane knjige
      const mostViewedResponse = await fetch("https://soa-serverless.vercel.app/api/most-viewed.js");
      const mostViewedData = await mostViewedResponse.json();
      mostViewedBooks = mostViewedData.books.slice(0, 3); 

      // JWT avtentifikacija
      const jwtToken = localStorage.getItem("jwt_token");
      const headers = jwtToken
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          }
        : { "Content-Type": "application/json" };

      // Poizvedba za pridobivanje podrobnosti knjig
      const bookDetailsPromises = mostViewedBooks.map(book => 
        fetch(`http://127.0.0.1:3000/api/books/${book._id}`, { headers }).then(res => res.json())
      );
      detailedBooks = await Promise.all(bookDetailsPromises);

      // GraphQL query for enriched books data
      const graphqlQuery = {
        query: `
          query {
            getAllBooksEnriched {
              id
              title
              author
              category
              description
              price
              stock
              views
              createdAt
            }
          }
        `
      };
      
      const graphqlResponse = await fetch("http://localhost:4000/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(graphqlQuery),
  credentials: 'include',
  mode: 'cors'
});

      const graphqlData = await graphqlResponse.json();
      
      if (graphqlData.errors) {
        console.error("GraphQL Errors:", graphqlData.errors);
        throw new Error("GraphQL query failed");
      }
      
      allEnrichedBooks = graphqlData.data.getAllBooksEnriched;
      // Sort books by views in descending order
      allEnrichedBooks.sort((a, b) => b.views - a.views);

      initChart();
    } catch (error) {
      console.error("Error fetching data:", error);
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

  // Format date function
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

        <div class="relative mb-8">
          <canvas id="visitChart"></canvas>
        </div>

        <div class="bg-green-100 text-green-800 p-4 rounded-md">
          <h2 class="text-2xl font-semibold">Top 3 Viewed Books</h2>
          <ul class="divide-y divide-gray-200 mt-4">
            {#each detailedBooks as book, index}
              <li class="py-4">
                <h3 class="text-xl font-bold text-gray-900">{book.title}</h3>
                <p class="text-gray-700">Author: {book.author}</p>
                <p class="text-gray-700">Category: {book.category}</p>
                <p class="text-gray-700">Price: ${book.price}</p>
                <p class="text-gray-700">Stock: {book.stock}</p>
                <p class="text-gray-700">Description: {book.description}</p>
                <p class="text-gray-900 font-bold mt-2">Views: {mostViewedBooks[index].views}</p>
              </li>
            {/each}
          </ul>
        </div>

        <div class="bg-yellow-100 text-yellow-800 p-4 rounded-md mt-8">
          <h2 class="text-2xl font-semibold">All Books with View Counts</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full mt-4 divide-y divide-gray-200">
              <thead class="bg-yellow-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each allEnrichedBooks as book}
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{book.title}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{book.author}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{book.category}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-bold text-gray-900">{book.views}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">${book.price}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{book.stock}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{formatDate(book.createdAt)}</div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {:else}
      <p class="text-center text-gray-600">Loading stats...</p>
    {/if}
  </div>
</div>