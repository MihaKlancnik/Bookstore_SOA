<script>
    import { createAccountState } from '$lib/state.svelte.js';
 
   async function handleCreateAccount() {
     const { username, password } = createAccountState;
     try {
       const res = await fetch('http://localhost:4001/api/users', {
           method: 'POST',
           body: JSON.stringify({ name: createAccountState.username, email: createAccountState.email, password: createAccountState.password }),
           headers: { 'Content-Type': 'application/json' }
       });
 
       if (res.ok) {
         console.log('Račun uspešno ustvarjen');
         window.location.href = '/'; 
       } else {
         console.error('Napaka pri ustvarjanju računa');
       }
     } catch (error) {
       console.error('Napaka:', error);
     }
   }
 </script>
 
 <div class="flex flex-col items-center justify-center h-screen">
   <h1 class="text-4xl mb-10">Ustvari Račun</h1>
   <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
     <h2 class="text-2xl font-bold text-center text-gray-700">Registracija</h2>
     <div class="mt-4">
       <div>
         <label class="block text-sm text-gray-600" for="username">Uporabniško ime</label>
         <input 
           type="text" 
           id="username" 
           class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" 
           placeholder="Vnesi uporabniško ime"
           bind:value={createAccountState.username}
         />
       </div>
       <div>
        <label class="block text-sm text-gray-600" for="email">Email</label>
        <input 
          type="text" 
          id="email" 
          class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" 
          placeholder="Vnesi svoj email"
          bind:value={createAccountState.email}
        />
      </div>
       <div class="mt-4">
         <label class="block text-sm text-gray-600" for="password">Geslo</label>
         <input 
           type="password" 
           id="password" 
           class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" 
           placeholder="Vnesi geslo"
           bind:value={createAccountState.password}
         />
       </div>
       <div class="flex items-center justify-between mt-4">
         <button 
           type="submit" 
           on:click={handleCreateAccount}
           class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
         >
           Registracija
         </button>
       </div>
     </div>
     <p class="mt-4 text-sm text-center text-gray-600">
       Že imaš račun?
       <a href="/" class="text-blue-500 hover:underline">Prijavi se tu</a>
     </p>
   </div>
 </div>
 