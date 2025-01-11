
export async function load() {

    const response = await fetch('http://localhost:3000/api/books');
    
    if (!response.ok) {
        throw error(500, 'Failed to load books data');
    }
    
    const books = await response.json();
    
    return {
        books
    };
}