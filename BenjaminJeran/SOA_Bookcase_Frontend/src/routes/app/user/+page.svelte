<script>
	import { goto } from '$app/navigation';
	import { UserState } from '$lib/state.svelte.js';

	let { data } = $props();

	console.log(data.users);
	console.log('notifications', data.notifications);
	console.log('inventory', data.inventory);

	let users = $state(data.users);
	let orders = $state(data.orders);
	let notifications = $state(data.notifications);
	let inventory = $state(data.inventory);

	let newUser = $state({
		name: '',
		email: '',
		password: ''
	});

	let loading = true;
	let error = null;

	let jwtToken = localStorage.getItem('jwt_token');
	console.log('Tukaj je token: ');
	console.log(jwtToken);

	if (!jwtToken) {
		goto('/');
	}

	const deleteUser = async (userId) => {
		try {
			const response = await fetch(`http://localhost:4001/api/users/${userId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${jwtToken}`,
					'Content-Type': 'application/json'
				}
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
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newUser)
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
	<div class="flex flex-col items-center gap-4 p-6">
		{#if UserState.role === 'admin'}
			<form
				onsubmit={addUser}
				class="flex max-w-xl flex-col gap-4 overflow-hidden rounded-lg border-2 border-gray-300 bg-white p-6 shadow-lg"
			>
				<h2 class="text-lg font-semibold">Dodaj novega uporabnika</h2>
				<input
					type="text"
					placeholder="Ime"
					bind:value={newUser.name}
					class="mt-2 w-full rounded-lg border px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
					required
				/>
				<input
					type="email"
					placeholder="E-pošta"
					bind:value={newUser.email}
					class="mt-2 w-full rounded-lg border px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
				<input
					type="text"
					placeholder="Geslo"
					bind:value={newUser.password}
					class="mt-2 w-full rounded-lg border px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
				<button
					type="submit"
					class="rounded-lg bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600"
				>
					Dodaj uporabnika
				</button>
			</form>
			<div class="p-4">
				{#if notifications.length > 0}
					<h2 class="mb-4 text-xl text-center font-semibold">Obvestilo!</h2>
					<div>
						<div class="mb-4 rounded-lg bg-white p-4 shadow-md">
							<p class="text-gray-800">{@html notifications}</p>
						</div>
					</div>
				{:else}
					<p class="text-gray-500">Ni obvestil na voljo.</p>
				{/if}
			</div>

			<div class="overflow-x-auto">
				{#if inventory.length > 0}
					<table class="min-w-full border-collapse border border-gray-300 bg-white shadow-lg">
						<thead class="bg-gray-200">
							<tr>
								<th class="px-4 py-2 text-left text-gray-700 font-semibold border-b border-gray-300">ID</th>
								<th class="px-4 py-2 text-left text-gray-700 font-semibold border-b border-gray-300">Količina</th>
								<th class="px-4 py-2 text-left text-gray-700 font-semibold border-b border-gray-300">Nazadnje posodobljeno</th>
							</tr>
						</thead>
						<tbody>
							{#each inventory as item}
								<tr class="hover:bg-gray-100">
									<td class="px-4 py-2 border-b border-gray-300">{item.id}</td>
									<td class="px-4 py-2 border-b border-gray-300">{item.quantity}</td>
									<td class="px-4 py-2 border-b border-gray-300">{new Date(item.lastUpdated).toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p class="text-gray-700">Ni podatkov o zalogi.</p> <!-- Display message when inventory is empty -->
				{/if}
			</div>
			
			
			<div class="flex flex-row flex-wrap justify-center gap-6">
				{#each users as user}
					<div
						class="flex max-w-sm flex-col overflow-hidden rounded-lg border-2 border-gray-300 bg-white p-6 shadow-lg"
					>
						<h2 class="mb-2 text-xl font-bold">{user.name}</h2>
						<p class="text-sm text-gray-700">Email: {user.email ? user.email : 'Neznano'}</p>
						<p class="mt-2 text-sm text-gray-700">Phone: {user.phone ? user.phone : 'Neznano'}</p>
						<p class="mt-2 text-sm text-gray-700">
							Address: {user.address ? user.address : 'Neznano'}
						</p>
						<div class="mt-4">
							<span class="text-sm text-gray-600"
								>Joined: {new Date(user.created_at).toLocaleDateString()}</span
							>
						</div>

						<button
							onclick={() => deleteUser(user.id)}
							class="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white transition duration-300 hover:bg-red-600"
						>
							Izbriši
						</button>
					</div>
				{/each}
			</div>
		{/if}

		

		{#if UserState.role !== 'admin'}
			<h1 class="text-4xl font-bold">Vaš račun</h1>
			<div
				class="flex max-w-sm flex-col overflow-hidden rounded-lg border-2 border-gray-300 bg-white p-6 shadow-lg"
			>
				<h2 class="mb-2 text-xl font-bold">{users.name}</h2>
				<p class="text-sm text-gray-700">Email: {users.email ? users.email : 'Neznano'}</p>
				<p class="mt-2 text-sm text-gray-700">Phone: {users.phone ? users.phone : 'Neznano'}</p>
				<p class="mt-2 text-sm text-gray-700">Address: {users.address ? users.address : 'Neznano'}</p>
				<div class="mt-4">
					<span class="text-sm text-gray-600"
						>Joined: {new Date(users.created_at).toLocaleDateString()}</span
					>
				</div>
			</div>
			<h1 class="text-center text-4xl font-bold text-indigo-600">Moje naročila</h1>

			{#if orders.length > 0}
				<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each orders as order}
						<div
							class="transform overflow-hidden rounded-lg border-2 border-gray-300 bg-white p-6 shadow-lg transition-all hover:scale-105 hover:border-indigo-500 hover:shadow-2xl"
						>
							<h2 class="mb-4 text-xl font-bold text-gray-900">Naročilo #{order.order_id}</h2>
							<div class="space-y-3">
								<p class="text-sm text-gray-700">
									<span class="font-semibold text-indigo-600">Knjiga:</span>
									<span class="text-gray-800">{order.book_id}</span>
								</p>
								<p class="text-sm text-gray-700">
									<span class="font-semibold text-indigo-600">Količina:</span>
									<span class="text-gray-800">{order.quantity}</span>
								</p>
								<p class="text-sm text-gray-700">
									<span class="font-semibold text-indigo-600">Cena:</span>
									<span class="text-gray-800">{order.price}€</span>
								</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="mt-6 text-center text-lg text-gray-600">Nimate nobenih naročil.</p>
			{/if}
		{/if}
	</div>
{/if}
