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

    // Check if running in the browser and access localStorage
    if (typeof window !== 'undefined') {
        const jwtToken = localStorage.getItem('jwt_token');
        console.log('Token:', jwtToken);
        
        if (jwtToken) {
            console.log('Token:', jwtToken);
            headers['authorization'] = `Bearer ${jwtToken}`; 
        }
    }

    try {
        // Fetch the books data
        const response = await fetch('http://localhost:3000/api/books', { headers });

        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Failed to load books data');
        }

        const books = await response.json();

        // Log the visit
        logVisit('books');

        // Return the books data
        return {
            books,
        };
    } catch (err) {
        // Handle any errors that might occur
        console.error('Error:', err);
        throw error(500, 'Error fetching books data');
    }
}