
<script>
	let { data } = $props();
    let books = data.books;
</script>

<h1 class="mt-10 text-4xl font-bold text-center">Knjige</h1>
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