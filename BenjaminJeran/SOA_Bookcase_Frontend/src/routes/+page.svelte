<div class="flex flex-col items-center justify-center h-screen ">
  <h1 class="text-4xl mb-10">Dobrodošli v našo knjigarno!</h1>
  <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-gray-700">Prijava</h2>
    <div class="mt-4">
      <div>
        <label class="block text-sm text-gray-600" for="email">Mail</label>
        <input 
          type="email" 
          id="email" 
          class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" 
          placeholder="Vnesi mail"
        />
      </div>
      <div class="mt-4">
        <label class="block text-sm text-gray-600" for="password">Geslo</label>
        <input 
          type="password" 
          id="password" 
          class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" 
          placeholder="Vnesi geslo"
        />
      </div>
      <div class="flex items-center justify-between mt-4">
        <a href="/nekineki" class="text-sm text-blue-500 hover:underline">Pozabljeno geslo?</a>
        <button 
          type="submit" 
          class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          Prijava
        </button>
      </div>
    </div>
    <p class="mt-4 text-sm text-center text-gray-600">
      Še nimaš računa?
      <a href="/nekineki" class="text-blue-500 hover:underline">Registriraj se tu</a>
    </p>
  </div>
</div>
