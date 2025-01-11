
<script>
    let { data } = $props();
    let book = data.props.book;
</script>

<div class="min-h-screen bg-gray-100 py-8">

    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-4xl font-bold mb-4">{book.title}</h1>
        
        <p class="text-gray-700 text-sm mb-2">Avtor: {book.author}</p>

        <p class="text-gray-600 text-base mb-4">{book.description}</p>
        
        <div class="flex justify-between items-center mt-4">
            <span class="text-gray-900 font-semibold text-lg">${book.price}</span>
            <button class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                Dodaj v košarico
            </button>
        </div>
    </div>

    <!-- Ocene -->
    <div class="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold mb-4">Reviews</h2>
        <div class="text-gray-600">
            <p>No reviews yet. Be the first to leave a review!</p>
        </div>
    </div>
</div>