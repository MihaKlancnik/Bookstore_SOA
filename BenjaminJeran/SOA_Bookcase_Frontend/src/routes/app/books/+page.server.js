

export async function load() {

    const response = await fetch('http://localhost:3000/api/books');
    
    // Handle if the fetch request fails
    if (!response.ok) {
        throw error(500, 'Failed to load books data');
    }
    
    const books = await response.json();
    
    // Return all books
    return {
        books
    };
}