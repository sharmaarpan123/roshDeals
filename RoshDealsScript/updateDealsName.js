const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://yash18chouhan:J2sqQkZObeONVgco@cluster0.a6fmka5.mongodb.net?retryWrites=true&w=majority";

const dbName = "MyOoryks";
const collectionName = "deals";

async function updateUserPhone() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = await client.db(dbName);
    const dealsCollection = await database.collection(collectionName);

    const allDeals = await dealsCollection
      .find(
        {
          uniqueIdentifier: { $regex: "unique", $options: "i" },
        },
        { projection: { _id: 1, uniqueIdentifier: 1 } }
      )
      .toArray();

    // const result = await Promise.all(
    //   allDeals.map((item, index) =>
    //     dealsCollection.updateOne(
    //       { _id: item._id },
    //       { $set: { uniqueIdentifier: "unique slug " + (index + 1) } }
    //     )
    //   )
    // );

    console.log(result, "result");
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

updateUserPhone();
