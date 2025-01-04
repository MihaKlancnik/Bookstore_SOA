<script>
	let { children } = $props();
</script>

<nav class="flex justify-between items-center bg-indigo-600 p-4 shadow-lg">
    <!-- Logo or Brand (optional) -->
    <a href="/" class="text-white text-2xl font-bold">Knjigarna</a>

    <!-- Navigation Links -->
    <div class="flex space-x-6">
        <a href="/" class="text-white font-medium hover:text-indigo-200 transition-colors duration-300">Domov</a>
        <a href="/app/books" class="text-white font-medium hover:text-indigo-200 transition-colors duration-300">Knjige</a>
        <a href="/app/cart" class="text-white font-medium hover:text-indigo-200 transition-colors duration-300">Košarica</a>
        <a href="/app/user" class="text-white font-medium hover:text-indigo-200 transition-colors duration-300">Uporabnik</a>
    </div>

    <!-- User Icon (Profile Icon) -->
    <div class="flex items-center space-x-4">
        <!-- Optional User Icon -->
        <a href="/app/user" class="text-white hover:text-indigo-200 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
        </a>
    </div>
</nav>
{@render children()}

