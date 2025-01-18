import { error } from '@sveltejs/kit';

const headers = {
    'Content-Type': 'application/json',
};

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
    let jwtToken = localStorage.getItem('jwt_token');

    if (jwtToken) {
        const decodedPayload = JSON.parse(atob(jwtToken.split('.')[1]));
        let role = decodedPayload.role;

        headers['authorization'] = `Bearer ${jwtToken}`;

        logVisit('user');

        if (role === "admin") {
            const response = await fetch('http://localhost:4001/api/users', { headers });

            if (!response.ok) {
                throw error(500, 'Failed to load user data');
            }

            const users = await response.json();
            console.log(users);

            return { users };
        }
        
        /* if (role === "user") {
            let id = decodedPayload.sub;
            console.log("Prijavlen z uporabniškim računom: " + id);
            const response = await fetch(`http://localhost:4001/api/users/${id}`, { headers });

            if (!response.ok) {
                throw error(500, 'Failed to load user data');
            }

            const users = await response.json();
            //console.log(users);

            return { users };
        } */

        
        if (role === "user") {
          let userId = decodedPayload.sub;
          console.log("Prijavlen z uporabniškim računom: " + userId);
          
          // Fetching the user information
          const userResponse = await fetch(`http://localhost:4001/api/users/${userId}`, { headers });

          if (!userResponse.ok) {
              throw error(500, 'Failed to load user data');
          }

          const user = await userResponse.json();

          // Fetching the orders for the user
          const ordersResponse = await fetch(`http://localhost:2001/orders/user/${userId}`, { headers });

          if (!ordersResponse.ok) {
              throw error(500, 'Failed to load orders data');
          }


          const orders = await ordersResponse.json();
          console.log(orders);
          
          // Return user data along with their orders
          return { user, orders };
      }
        throw error(403, 'Forbidden');
    }
    
    throw error(401, 'Unauthorized');
}
