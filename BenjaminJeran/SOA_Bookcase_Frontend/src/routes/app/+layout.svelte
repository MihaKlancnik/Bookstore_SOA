<script>
	let { children } = $props();
</script>

<nav class="flex flex-row justify-between bg-indigo-500 p-4">
	<a href="/">Domov</a>
	<a href="/app/books">Knjige</a>
	<a href="/app/cart">Košarica</a>
	<a href="/app/user">Uporabnik</a>
</nav>

{@render children()}

