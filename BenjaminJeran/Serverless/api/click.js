const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI environment variable is not set');
}

const handler = async (req, res) => {
  const client = new MongoClient(uri);
  
  const { bookId } = req.body || {};
  
  if (!bookId) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  try {
    await client.connect();
    const database = client.db();
    const books = database.collection('books');
    
    // Using upsert: true to create a new document if it doesn't exist
    const result = await books.updateOne(
      { _id: bookId },
      { 
        $inc: { views: 1 },
        $setOnInsert: { createdAt: new Date() } // Optional: sets creation date for new documents
      },
      { upsert: true }
    );

    return res.status(200).json({ 
      message: "View count updated successfully",
      isNewBook: result.upsertedCount > 0
    });

  } catch (error) {
    console.error('Error updating view count:', error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
};

export default handler;