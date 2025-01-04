<script>
	let { data } = $props();
    console.log(data);
    let users = data.users;


    const deleteUser = (userId) => {
        // Handle the delete action, for example, you can send a delete request to your API
        alert(`User with ID ${userId} deleted.`);
    };

    // Function to handle adding a new user (you can modify this as per your needs)
    const addUser = () => {
        alert('Add user functionality goes here');
    };

</script>



<div class="flex flex-col gap-4 items-center p-6">
    <button 
        on:click={addUser} 
        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 mb-4"
    >
        Dodaj uporabnika
    </button>

    <div class="flex flex-row gap-6 justify-center flex-wrap">
        {#each users as user}
            <div class="max-w-sm rounded-lg border-2 border-gray-300 overflow-hidden shadow-lg bg-white p-6 flex flex-col">
                <h2 class="font-bold text-xl mb-2">{user.name}</h2>
                <p class="text-gray-700 text-sm">Email: {user.email ? user.email : 'Neznano'}</p>
                <p class="text-gray-700 text-sm mt-2">Phone: {user.phone ? user.phone : 'Neznano'}</p>
                <p class="text-gray-700 text-sm mt-2">Address: {user.address ? user.address : 'Neznano'}</p>
                <div class="mt-4">
                    <span class="text-gray-600 text-sm">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>

                <!-- Delete Button -->
                <button 
                    on:click={() => deleteUser(user.id)} 
                    class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Izbriši
                </button>
            </div>
        {/each}
    </div>
</div>