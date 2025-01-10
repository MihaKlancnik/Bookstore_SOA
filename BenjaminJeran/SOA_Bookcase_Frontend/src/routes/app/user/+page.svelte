<script>
    import { loginState } from '$lib/state.svelte.js';
    let { data } = $props();

    let loading = true;
    let error = null;

    if (!loginState.jwtToken || loginState.jwtToken === '') {
        window.location.href = '/';
    } 

    const deleteUser = (userId) => {
        alert(`User with ID ${userId} deleted.`);
    };

    const addUser = () => {
        alert('Add user functionality goes here');
    };

    
</script>

{#if loginState.jwtToken}
 <div class="flex flex-col gap-4 items-center p-6">
    <button 
        onclick={addUser} 
        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 mb-4"
    >
        Dodaj uporabnika!
    </button>

    <div class="flex flex-row gap-6 justify-center flex-wrap">
        {#each data.users as user}
            <div class="max-w-sm rounded-lg border-2 border-gray-300 overflow-hidden shadow-lg bg-white p-6 flex flex-col">
                <h2 class="font-bold text-xl mb-2">{user.name}</h2>
                <p class="text-gray-700 text-sm">Email: {user.email ? user.email : 'Neznano'}</p>
                <p class="text-gray-700 text-sm mt-2">Phone: {user.phone ? user.phone : 'Neznano'}</p>
                <p class="text-gray-700 text-sm mt-2">Address: {user.address ? user.address : 'Neznano'}</p>
                <div class="mt-4">
                    <span class="text-gray-600 text-sm">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>

                <button 
                    onclick={() => deleteUser(user.id)} 
                    class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Izbriši
                </button>
            </div>
        {/each}
    </div>
</div>   
{/if}