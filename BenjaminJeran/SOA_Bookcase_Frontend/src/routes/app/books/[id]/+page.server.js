import { error } from '@sveltejs/kit';

export async function load({ params }) {
 
    const { id } = params;
    console.log(id);

    try {
        const response = await fetch(`http://localhost:3000/api/books/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch book with ID: ${id}`);
        }

        const book = await response.json();

        return { props: { book } };
    } catch (err) {
        throw error(404, `Book with ID ${id} not found.`);
    }
}