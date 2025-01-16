import { error } from '@sveltejs/kit';

let book = []
let reviews = []

export async function load({ params }) {
 
    const { id } = params;
    console.log(id);

    const headers = {
        'Content-Type': 'application/json',
    };

    let jwtToken = localStorage.getItem('jwt_token');

    if (jwtToken) {
        console.log('Token:', jwtToken);
        headers['authorization'] = `Bearer ${jwtToken}`; 
    }

    try {
        
        const response_book = await fetch(`http://localhost:3000/api/books/${id}`, { headers });
        if (!response_book.ok) {
            throw new error(`Failed to fetch book with ID: ${id}`);
        }

        book = await response_book.json(); 

        const response_reviews = await fetch(`http://localhost:3000/api/books/${id}/reviews`, { headers });
        if (!response_reviews.ok) {
            console.log(`Failed to fetch book with ID: ${id}`);
        }

        const reviews = await response_reviews.json(); 

        return { props: { book, reviews } };
    } catch (err) {
        throw error(404, `Book with ID ${id} not found.`);
    }
}