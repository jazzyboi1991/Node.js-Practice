const {ObjectId} = require("mongodb");
const paginator = require("../utils/paginator");

const projectionOption = {
    projection: {
        password: 0,
        "comments.password": 0,
    },
};

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

async function getDetailPost(collection, id) {
    const post = await collection.findOne({_id: new ObjectId(id)});
    // 게시글 조회수 증가 (별도 처리, post 반환에 영향 없음)
    await collection.updateOne({_id: new ObjectId(id)}, {$inc: {hits: 1}});
    return post; // 명확하게 post 객체만 반환
}

async function getPostByIdAndPassword(collection, {id, password}) {
    return await collection.findOne({_id: new ObjectId(id), password: password},
    projectionOption);
}

async function getPostById(collection, id) {
    return await collection.findOne({_id: new ObjectId(id)}, projectionOption);
}

async function getPostByIdForEdit(collection, id) {
    return await collection.findOne({_id: new ObjectId(id)});
}

async function updatePost(collection, id, post) {
    // 비밀번호가 비어있으면 업데이트에서 제외
    const updateFields = { ...post };
    if (!updateFields.password || updateFields.password.trim() === '') {
        delete updateFields.password;
    }
    
    const toUpdatePost = {
        $set: updateFields,
    };
    return await collection.updateOne({_id: new ObjectId(id)}, toUpdatePost);
}

module.exports = {
    list,
    writePost,
    getDetailPost,
    updatePost,
    getPostById,
    getPostByIdAndPassword,
    getPostByIdForEdit,
};