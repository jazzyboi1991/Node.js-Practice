const {MongoClient} = require("mongodb");
const uri = "mongodb+srv://manuelpark:fu24fu341@cluster0.7lwitnv.mongodb.net/board";

module.exports = async function() {
    return await MongoClient.connect(uri);
}