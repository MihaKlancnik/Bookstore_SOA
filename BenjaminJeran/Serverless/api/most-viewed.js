const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI environment variable is not set');
}

const handler = async (req, res) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const database = client.db();
    const books = database.collection('books');
    
    const mostViewedBooks = await books
      .find({})
      .sort({ views: -1 })
      .limit(10)
      .toArray();

    if (mostViewedBooks.length === 0) {
      return res.status(200).json({ 
        message: "No books found",
        books: []
      });
    }

    return res.status(200).json({ 
      message: "Successfully retrieved most viewed books",
      books: mostViewedBooks
    });

  } catch (error) {
    console.error('Error fetching most viewed books:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
};

export default handler;