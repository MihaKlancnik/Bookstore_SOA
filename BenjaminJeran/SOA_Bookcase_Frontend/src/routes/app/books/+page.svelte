
<script>
	let { data } = $props();
    
    let books = $state(data.books);
    
    import { UserState } from '$lib/state.svelte.js';

    let newBook = $state({
        title: '',
        author: '',
        category: '',
        price: '',
        stock: '',
        description: ''
    });

    let jwtToken = localStorage.getItem('jwt_token');
    
    const addBook = async () => {
    try {
        // Step 1: Create the book via the books API
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBook),
        });

        if (!response.ok) {
            throw new Error('Failed to add book.');
        }

        const createdBook = await response.json();
        books = [...books, createdBook];

        // Step 2: Call the inventory API to set the inventory for the newly added book
        const inventoryResponse = await fetch('http://localhost:4002/api/inventory', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                book_id: createdBook.id,  // Passing the book_id from the newly created book
                quantity: newBook.stock,   // Passing the stock (quantity) provided when adding the book
            }),
        });

        if (!inventoryResponse.ok) {
            throw new Error('Failed to create inventory item.');
        }

        const inventoryData = await inventoryResponse.json();
        console.log('Inventory item created with ID:', inventoryData.id);

        // Reset the form fields
        newBook = {
            title: '',
            author: '',
            category: '',
            price: '',
            stock: '',
            description: ''
        };

    } catch (err) {
        alert(`Error adding book: ${err.message}`);
    }
};

</script>
<h1 class="mt-10 text-4xl font-bold text-center">Knjige</h1>

{#if UserState.role === 'admin'}
    <form onsubmit={addBook} class="flex flex-col gap-6 max-w-lg mx-auto rounded-lg border-2 border-gray-300 bg-white shadow-xl p-8 mt-8">
        <h2 class="text-2xl font-semibold text-center text-gray-800 mb-6">Dodaj novo knjigo</h2>

        <input 
            type="text" 
            placeholder="Naslov" 
            bind:value={newBook.title} 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 text-lg"
            required 
        />

        <input 
            type="text" 
            placeholder="Avtor" 
            bind:value={newBook.author} 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 text-lg"
        />

        <input 
            type="text" 
            placeholder="Kategorija" 
            bind:value={newBook.category} 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 text-lg"
        />

        <input 
            type="number" 
            placeholder="Cena" 
            bind:value={newBook.price} 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 text-lg"
        />

        <input 
            type="number" 
            placeholder="Zaloga" 
            bind:value={newBook.stock} 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 text-lg"
        />

        <textarea 
            placeholder="Opis" 
            bind:value={newBook.description} 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-500 text-lg"
        ></textarea>

        <button 
            type="submit" 
            class="px-6 py-3 mt-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
        >
            Dodaj knjigo
        </button>
    </form>
{/if}

<div class="mt-10 flex flex-row flex-wrap justify-center gap-8 px-4 mb-6">
    {#each books as book}
        <a href={`/app/books/${book.id}`} class="max-w-sm rounded-lg border-2 border-gray-300 overflow-hidden shadow-lg bg-white p-6 flex flex-col">
            <h2 class="font-bold text-xl mb-2">{book.title}</h2>
            <p class="text-gray-700 text-sm">Avtor: {book.author}</p>
            <p class="text-gray-700 text-base mt-2">{book.description}</p>
            <div class="flex justify-between items-center mt-4">
                <p class="text-gray-900 font-semibold text-lg">{book.price}€</p>
            </div>
        </a>
    {/each}
</div>