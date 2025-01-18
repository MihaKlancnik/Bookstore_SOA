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



    logVisit('cart');
    
   /*    let jwtToken = localStorage.getItem('jwt_token');
  
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
          
          if (role === "user") {
              let id = decodedPayload.sub;
              console.log("Prijavlen z uporabniškim računom: " + id);
              const response = await fetch(`http://localhost:4001/api/users/${id}`, { headers });
  
              if (!response.ok) {
                  throw error(500, 'Failed to load user data');
              }
  
              const users = await response.json();
              //console.log(users);
  
              return { users };
          }
  
          throw error(403, 'Forbidden');
      }
      
      throw error(401, 'Unauthorized'); */
  }
  