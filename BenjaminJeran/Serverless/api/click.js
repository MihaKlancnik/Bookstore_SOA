const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    // Preveri, če je metoda POST
    if (req.method === 'POST') {
        // Preberi ID knjige iz telesa zahtevka
        const { bookId } = req.body;

        // Preveri, če ID knjige ni prisoten
        if (!bookId) {
            return res.status(400).json({ error: 'Book ID is required' });
        }

        try {
            // Povečaj števec ogledov za knjigo v KV
            const views = await kv.get(bookId) || 0;
            await kv.set(bookId, views + 1);

            // Vrni uspešno sporočilo
            return res.status(200).json({ message: 'Click recorded successfully', bookId, views: views + 1 });
        } catch (error) {
            console.error('Error recording click:', error);
            return res.status(500).json({ error: 'Error recording click' });
        }
    }

    // Če zahteva ni POST, vrni napako
    return res.status(405).json({ error: 'Method Not Allowed' });
};
