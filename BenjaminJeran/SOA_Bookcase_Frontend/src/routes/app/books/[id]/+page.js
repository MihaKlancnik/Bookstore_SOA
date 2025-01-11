import { error } from '@sveltejs/kit';
import { loginState } from '$lib/state.svelte.js';

export async function load({ params }) {
 
    const { id } = params;
    console.log(id);

    const headers = {
        'Content-Type': 'application/json',
    };

    if (loginState.jwtToken) {
        console.log('Token:', loginState.jwtToken);
        headers['authorization'] = `Bearer ${loginState.jwtToken}`; 
    }

    try {
        const response = await fetch(`http://localhost:3000/api/books/${id}/reviews`, { headers });

        if (!response.ok) {
            throw new error(`Failed to fetch book with ID: ${id}`);
        }

        const book = await response.json();

        return { props: { book } };
    } catch (err) {
        throw error(404, `Book with ID ${id} not found.`);
    }
}