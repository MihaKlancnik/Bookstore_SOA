import { loginState } from '$lib/state.svelte.js';
import { error } from '@sveltejs/kit';



async function logVisit(page) {
    try {
      const response = await fetch("http://localhost:5000/log-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page }),
      });
     /*  const data = await response.json();

      // Update frontend stats
      stats.totalVisits = data.stats.totalVisits;
      stats.pageVisits = { ...data.stats.pageVisits };

      // Update the chart with the new stats
      updateChart(); */
    } catch (error) {
      console.error("Error logging visit:", error);
    }
  }


export async function load() {

    const headers = {
        'Content-Type': 'application/json',
    };

    if (loginState.jwtToken) {
        console.log('Token:', loginState.jwtToken);
        headers['authorization'] = `Bearer ${loginState.jwtToken}`; 
    }

    const response = await fetch('http://localhost:3000/api/books', { headers });

    if (!response.ok) {
        throw error(500, 'Failed to load books data'); 
    }

    const books = await response.json();

    logVisit('books');

    return {
        books,
    }; 

}