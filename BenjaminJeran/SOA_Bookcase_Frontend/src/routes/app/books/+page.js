import { loginState } from '$lib/state.svelte.js';
import { error } from '@sveltejs/kit';

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

    return {
        books,
    }; 

}