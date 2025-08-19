const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://manuelpark:fu24fu341@cluster0.guk9cex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function main() {
    try {
        await client.connect();
        console.log("MongoDB 접속 성공");
        const collection = client.db("test").collection("person");
        
        await collection.insertOne({name: "Andy", age: 30});
        console.log("문서 추가 완료");

        const documents = await collection.find({name: "Andy"}).toArray();
        console.log("찾은 문서: ", documents);

        await collection.updateOne({name: "Andy"}, {$set: {age: 31}});
        console.log("문서 업데이트");

        const updatedDocuments = await collection.find({name: "Andy"}).toArray();
        console.log("갱신된 문서: ", updatedDocuments);

        // await collection.deleteOne({name: "Andy"});
        // console.log("문서 삭제");
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await client.close();
    }
}

main();