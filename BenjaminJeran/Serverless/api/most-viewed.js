const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            // Pridobi vse ključe (ID-je knjig) in njihove vrednosti (ogledi)
            const allBooks = await kv.keys();
            const booksWithViews = await Promise.all(allBooks.map(async (bookId) => {
                const views = await kv.get(bookId);
                return { bookId, views };
            }));

            // Razvrsti knjige po številu ogledov (od največ do najmanj)
            const sortedBooks = booksWithViews.sort((a, b) => b.views - a.views);

            // Vrni seznam najbolj obiskanih knjig
            return res.status(200).json({ most_viewed_books: sortedBooks });
        } catch (error) {
            console.error('Error fetching most viewed books:', error);
            return res.status(500).json({ error: 'Error fetching most viewed books' });
        }
    }

    // Če zahteva ni GET, vrni napako
    return res.status(405).json({ error: 'Method Not Allowed' });
};
