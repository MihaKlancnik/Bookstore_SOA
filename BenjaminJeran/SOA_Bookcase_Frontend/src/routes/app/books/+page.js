import { error } from '@sveltejs/kit';



async function logVisit(page) {
    try {
      const response = await fetch("http://localhost:5000/log-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page }),
      });
      
    } catch (error) {
      console.error("Error logging visit:", error);
    }
  }


  export async function load() {
      const headers = {
        'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
        const jwtToken = localStorage.getItem('jwt_token');
        console.log('Token:', jwtToken);
        
        if (jwtToken) {
            console.log('Token:', jwtToken);
            headers['authorization'] = `Bearer ${jwtToken}`; 
        }

        try {
          const response = await fetch('http://localhost:3000/api/books', { headers });
  
          if (!response.ok) {
              throw new Error('Failed to load books data');
          }
  
          const books = await response.json();
  
          logVisit('books');
  
          return {
              books,
          };
  
      } catch (err) {
          console.error('Error:', err);
          throw error(500, 'Error fetching books data');
      }
    }
  }
   
