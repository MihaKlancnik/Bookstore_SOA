<script>
	import { goto } from '$app/navigation';
	import { UserState } from '$lib/state.svelte.js';

    let { data } = $props();

    console.log(data.users);

    let users = $state(data.users)
    let orders = $state(data.orders);

    let newUser = $state({
        name: '',
        email: '',
        password: ''
    });

    let loading = true;
    let error = null;

    let jwtToken = localStorage.getItem('jwt_token');
    console.log("Tukaj je token: ")
    console.log(jwtToken);
   
    if (!jwtToken){
        goto('/');
    }

    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:4001/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete user.');
            }

            users = users.filter((user) => user.id !== userId);
        } catch (err) {
            alert(`Error deleting user: ${err.message}`);
        }
    };

    const addUser = async () => {
        try {
            const response = await fetch('http://localhost:4001/api/users', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error('Failed to add user.');
            }

            const createdUser = await response.json();
          
            users = [...data.users, createdUser];

            newUser = {
                name: '',
                email: '',
                password: ''
            };

        } catch (err) {
            alert(`Error adding user: ${err.message}`);
        }
    };

    
</script>

{#if jwtToken}
 <div class="flex flex-col gap-4 items-center p-6">
    {#if UserState.role === "admin"}
        <form 
            onsubmit={addUser} 
            class="flex flex-col gap-4 max-w-xl rounded-lg border-2 border-gray-300 overflow-hidden shadow-lg bg-white p-6 "
        >
            <h2 class="text-lg font-semibold">Dodaj novega uporabnika</h2>
            <input 
                type="text" 
                placeholder="Ime" 
                bind:value={newUser.name} 
                class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required 
            />
            <input 
                type="email" 
                placeholder="E-pošta" 
                bind:value={newUser.email} 
                class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <input 
                type="text" 
                placeholder="Geslo" 
                bind:value={newUser.password} 
                class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <button 
                type="submit" 
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
                Dodaj uporabnika
            </button>
        </form>
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
    
                    <button 
                        onclick={() => deleteUser(user.id)} 
                        class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                    >
                        Izbriši
                    </button>
                </div>
            {/each}
        </div>
    {/if}
    
    <h1 class="font-bold text-6xl">Vaš račun</h1>
    <div class="max-w-sm rounded-lg border-2 border-gray-300 overflow-hidden shadow-lg bg-white p-6 flex flex-col">
        <h2 class="font-bold text-xl mb-2">{users.name}</h2>
        <p class="text-gray-700 text-sm">Email: {users.email ? users.email : 'Neznano'}</p>
        <p class="text-gray-700 text-sm mt-2">Phone: {users.phone ? users.phone : 'Neznano'}</p>
        <p class="text-gray-700 text-sm mt-2">Address: {users.address ? users.address : 'Neznano'}</p>
        <div class="mt-4">
            <span class="text-gray-600 text-sm">Joined: {new Date(users.created_at).toLocaleDateString()}</span>
        </div>
    </div>

    {#if UserState.role !== "admin"}
    <h1 class="font-bold text-6xl">Moje naročila</h1>
    {#if orders.length > 0}
        <div class="flex flex-col gap-4 mt-6">
            {#each orders as order}
                <div class="rounded-lg border-2 border-gray-300 overflow-hidden shadow-lg bg-white p-6">
                    <h2 class="font-bold text-xl mb-2">Naročilo #{order.order_id}</h2>
                    <p class="text-gray-700 text-sm">Knjiga: {order.book_id}</p>
                    <p class="text-gray-700 text-sm">Količina: {order.quantity}</p>
                    <p class="text-gray-700 text-sm">Cena: {order.price}€</p>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-gray-600">Nimate nobenih naročil.</p>
    {/if}
{/if}
    
</div>   
{/if}