const {ObjectId} = require("mongodb");
const paginator = require("../utils/paginator");

async function getDetailPost(collection, id) {
    const post = await collection.findOne({_id: new ObjectId(id)});
    // 게시글 조회수 증가 (별도 처리, post 반환에 영향 없음)
    await collection.updateOne({_id: new ObjectId(id)}, {$inc: {hits: 1}});
    return post; // 명확하게 post 객체만 반환
}

async function list(collection, page, search) {
    const perPage = 10;
    const query = {title: new RegExp(search, "i")};
    const cursor = collection.find(query, {limit: perPage, skip: (page - 1) * perPage}).sort({
        createdDt: -1,
    });
    const totalCount = await collection.countDocuments(query); // count() 대신 countDocuments() 사용 (deprecated 해결)
    const posts = await cursor.toArray();
    const paginatorObj = paginator({totalCount, page, perPage: perPage});
    return [posts, paginatorObj];
}

async function writePost(collection, post) {
    post.hits = 0;
    post.createdDt = new Date().toISOString();
    return await collection.insertOne(post);
}

const projectionOption = {
    projection: {
        password: 0,
        "comments.password": 0,
    },
};

module.exports = {
    getDetailPost,
    list,
    writePost,
};