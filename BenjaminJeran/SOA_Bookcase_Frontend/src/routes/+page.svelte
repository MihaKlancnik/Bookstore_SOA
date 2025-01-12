<script>
	import { goto } from '$app/navigation';
   import { loginState } from '$lib/state.svelte.js';
   import { UserState } from '$lib/state.svelte.js';
   async function handleSubmit() {
   const { email, password } = loginState;

  try {
    const res = await fetch('http://localhost:4001/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const { token } = await res.json();

      if (isJwtValid(token)) {

        console.log(token)
        loginState.jwtToken = token;

        localStorage.setItem('jwt_token', token);
        console.log('Prijava je bila uspešna');

        const decodedPayload = JSON.parse(atob(token.split('.')[1]));

        UserState.name = decodedPayload.name;
        UserState.role = decodedPayload.role

        if (decodedPayload.role === 'admin') {
          console.log('User is an admin');
        } 

        goto(`/app/books`);

      } else {
        console.error('Napacen ali potekel token');
        alert('Seja je potekla. Prosimo, prijavite se ponovno.');
      }
    } else {
      console.error('Prijava ni bila uspešna');
      alert('Prijava ni bila uspešna. Prosimo, poskusite ponovno.');
    }
  } catch (error) {
    console.error('Napaka', error);
    alert('Nekaj je šlo narobe. Prosimo, poskusite ponovno.');
  }
}


function isJwtValid(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);

    return decodedPayload.exp && decodedPayload.exp > currentTime;
  } catch (error) {
    console.error('Invalid JWT:', error);
    return false;
  }
}


</script>

<div class="flex flex-col items-center justify-center h-screen ">
  <h1 class="text-4xl mb-10">Dobrodošli v našo knjigarno!</h1>
  <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-gray-700">Prijava</h2>
    <div class="mt-4">
      <div>
        <label class="block text-sm text-gray-600" for="email">E-Mail</label>
        <input 
          type="email" 
          id="email" 
          class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" 
          placeholder="Vnesi mail"
          bind:value={loginState.email}
        />
      </div>
      <div class="mt-4">
        <label class="block text-sm text-gray-600" for="password">Geslo</label>
        <input 
          type="password" 
          id="password" 
          class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" 
          placeholder="Vnesi geslo"
          bind:value={loginState.password}
        />
      </div>
      <div class="flex items-center justify-between mt-4">
        <button 
          type="submit" 
          on:click={handleSubmit}
          class="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          Prijava
        </button>
      </div>
    </div>
    <p class="mt-4 text-sm text-center text-gray-600">
      Še nimaš računa?
      <a href="/register" class="text-blue-500 hover:underline">Registriraj se tu</a>

  </div>
</div>
