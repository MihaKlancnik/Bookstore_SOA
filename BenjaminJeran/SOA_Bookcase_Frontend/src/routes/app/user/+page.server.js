import { error } from '@sveltejs/kit';

export async function load() {
    const response = await fetch('http://localhost:4001/api/users');
    // Handle if the fetch request fails
    if (!response.ok) {
        throw error(500, 'Failed to load user data');
    }
    
    const users = await response.json();
    console.log(users);
    // Return all users
    return {
        users
    };
}