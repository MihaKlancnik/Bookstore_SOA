<script>
	let { children } = $props();
    import { loginState, UserState } from '$lib/state.svelte.js';
    import { goto } from '$app/navigation';

    const logout = () => {
        loginState.jwtToken = '';
        loginState.email = '';
        loginState.password = '';
        localStorage.removeItem('jwt_token');
        goto(`/`) 
    }

</script>

<nav class="flex justify-between items-center bg-indigo-600 p-4 shadow-lg">
    <a href="/" class="text-white text-2xl font-bold">Knjigarna</a>

    <div class="flex space-x-6">
        <a href="/app/books" class="text-white font-medium hover:text-indigo-200 transition-colors duration-300">Knjige</a>
        <a href="/app/cart" class="text-white font-medium hover:text-indigo-200 transition-colors duration-300">Košarica</a>
        {#if UserState.role === 'admin'}
            <a href="/app/user" class="text-white font-medium hover:text-indigo-200 transition-colors duration-300">Uporabnik</a>
        {/if}
    </div>

    <div class="flex items-center space-x-4">
        <p class="text-white hover:text-indigo-200" >Prijavljeni ste kot: : {loginState.email}</p>
        <a href="/app/user" class="text-white hover:text-indigo-200 transition-colors duration-300" aria-label="userButton">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
        </a>
        <button class="text-white hover:text-indigo-200" onclick={logout}>Odjava</button>
    </div>
</nav>
{@render children()}

