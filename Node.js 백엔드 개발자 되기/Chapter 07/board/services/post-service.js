const paginator = require("../utils/paginator");

async function list(collection, page, search) {
    const perPage = 10;
    const query = {title: new RegExp(search, "i")};
    const cursor = collection.find(query, {limit: perPage, skip:(page - 1) * perPage}).sort({
        createDt: -1,
    });
    const totalCount = await collection.count(query);
    const posts = await cursor.toArray();
    const paginatorObj = paginator({totalCount, page, perPage: perPage});
    return [posts, paginatorObj];
}

module.exports = {
    list,
    writePost,
};