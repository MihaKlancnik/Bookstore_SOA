<script>
	import '../app.css';
	let { children } = $props();
</script>

<nav class="flex flex-row justify-between bg-indigo-500 p-4">
	<a href="/">Domov</a>
	<a href="/books">Knjige</a>
	<a href="/cart">Košarica</a>
	<a href="/user">Uporabnik</a>
</nav>

{@render children()}

