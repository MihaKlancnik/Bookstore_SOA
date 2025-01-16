import { error } from '@sveltejs/kit';

const headers = {
    'Content-Type': 'application/json',
};


export async function load() {


    let jwtToken = localStorage.getItem('jwt_token');

    if (jwtToken) { 
        headers['authorization'] = `Bearer ${jwtToken}`;

        const response = await fetch('http://localhost:4001/api/users', { headers });

        if (!response.ok) {
            throw error(500, 'Failed to load user data');
        }
        
        const users = await response.json();
        console.log(users);
    
        return {
            users
        };
    }

   
}