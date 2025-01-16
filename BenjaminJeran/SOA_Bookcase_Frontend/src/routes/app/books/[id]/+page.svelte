
<script>
    let { data } = $props();

    let book = data.props.book;
    let reviews = [];
    
    //let reviews = data.props.book.reviews;

    let inventory = $state(data.props.inventory.inventory);

    const decodedPayload = JSON.parse(atob(localStorage.getItem('jwt_token').split('.')[1]));

    let userID = decodedPayload.sub;


    const NarisiZvezdice = (rating) => {
        let zvezdice = [];
        for (let i = 0; i < rating; i++) {
            zvezdice.push('✨');
        }
        return zvezdice.join('');
    }


    let rating = $state(0) ;
    let comment = $state("");

    async function submitReview() {
        const reviewData = {
            book_id: book.id,
            user_id: userID,
            rating: rating,
            comment: comment
        };

        try {
            const response = await fetch("http://localhost:2000/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`, 
                },
                body: JSON.stringify(reviewData),
            });

            if (response.ok) {
                const newReview = await response.json();
                reviews.push({
                    id: newReview.id,
                    rating: rating,
                    comment: comment
                });
                comment = "";  // Clear the comment field after submission
                rating = 0;    // Reset the rating
            } else {
                const error = await response.json();
                alert(error.detail || "Error while submitting the review");
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    }

</script>

<div class="min-h-screen bg-gray-100 py-8">

    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-4xl font-bold mb-4">{book.title}</h1>
        
        <p class="text-gray-700 text-sm mb-2">Avtor: {book.author}</p>

        <p class="text-gray-600 text-base mb-4">{book.description}</p>

        <p class="text-gray-600 text-base mb-4">{inventory === undefined ? 'Artikel ni na voljo' : `Zaloga: ${inventory}`}</p>
        
        {#if inventory > 0}
            <div class="flex justify-between items-center mt-4">
                <span class="text-gray-900 font-semibold text-lg">${book.price}</span>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                    Dodaj v košarico
                </button>
            </div>
        {:else}
            <div class="flex justify-between items-center mt-4">
            <span class="text-gray-900 font-semibold text-lg">${book.price}</span>
            <button class="px-4 py-2 bg-gray-500 text-white rounded-full cursor-not-allowed">
                Ni na zalogi
            </button>
             </div>
        {/if}
    </div>

    <div class="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold mb-4">Dodaj Mnenje</h2>
        
        <div class="mb-4">
            <label for="rating" class="block text-gray-700">Ocena:</label>
            <select id="rating" class="block w-full mt-2 p-2 border border-gray-300 rounded" bind:value={rating}>
                <option value="0">Izberi oceno</option>
                <option value="1">1 ✨</option>
                <option value="2">2 ✨✨</option>
                <option value="3">3 ✨✨✨</option>
                <option value="4">4 ✨✨✨✨</option>
                <option value="5">5 ✨✨✨✨✨</option>
            </select>
        </div>
        
        <div class="mb-4">
            <label for="comment" class="block text-gray-700">Komentar:</label>
            <textarea id="comment" class="block w-full mt-2 p-2 border border-gray-300 rounded" rows="4" bind:value={comment}></textarea>
        </div>
        
        <button 
            type="button" 
            class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition" 
            onclick={submitReview}>
            Oddaj Mnenje
        </button>
    </div>

    {#if reviews.length === 0}
        <div class="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-lg shadow-lg">
            <h2 class="text-2xl font-semibold mb-4">Reviews</h2>
            <div class="text-gray-600">
                <p>No reviews yet. Be the first to leave a review!</p>
            </div>
        </div>
    {:else}
    <div class="mt-4">
        {#each reviews as review}
        <div class="max-w-4xl mx-auto p-2 mb-2 bg-white shadow-lg">
            <h2 class="text-2xl font-semibold mb-4">Ocena: {NarisiZvezdice(review.rating)}</h2>
            <span class="font-bold">Komentar</span> <span>{review.comment}</span>
        </div>
    {/each}
    </div>
    {/if}

</div>