const express = require("express");
const handlebars = require("express-handlebars");
const postService = require("./services/post-service");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true})); // extended: true로 변경하여 객체와 배열 파싱 지원

const mongodbConnection = require("./configs/mongodb-connection");
const { ObjectId } = require("mongodb");

app.engine(
    "handlebars",
    handlebars.create({
        helpers: require("./configs/handlebars-helpers"),
    }).engine,
);

app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    try {
        // collection이 초기화되었는지 확인
        if (!collection) {
            throw new Error("Database not connected");
        }
        const[posts, paginator] = await postService.list(collection, page, search);
        res.render("home", {title: "테스트 게시판", search, paginator, posts});
    }
    catch(error) {
        console.error(error);
        res.render("home", {title: "테스트 게시판"});
    }
});

app.get("/write", (req, res) => {
    res.render("write", {title: "테스트 게시판", mode: "create"});
});

app.get("/modify/:id", async(req, res) => {
    const post = await postService.getPostByIdForEdit(collection, req.params.id);
    console.log(post);
    res.render("write", {title: "테스트 게시판", mode: "modify", post});
});

app.post("/modify/", async(req, res) => {
    const {id, title, writer, password, content} = req.body;

    // 비밀번호 검증
    const existingPost = await postService.getPostByIdAndPassword(collection, {id, password});
    if (!existingPost) {
        return res.status(401).render("write", {
            title: "테스트 게시판",
            mode: "modify",
            post: {id, title, writer, content},
            error: "비밀번호가 올바르지 않습니다."
        });
    }

    const post = {
        title,
        writer,
        content,
        password, // 비밀번호도 포함하여 전달
    };
    
    const result = await postService.updatePost(collection, id, post);
    res.redirect(`/detail/${id}`);
});

app.delete("/delete", async(req, res) => {
    const {id, password} = req.body;
    try {
        const result = await collection.deleteOne({_id: new ObjectId(id), password: password});
        if(result.deletedCount !== 1) {
            console.log("삭제 실패");
            return res.json({isSuccess: false});
        }
        return res.json({isSuccess: true});
    }
    catch(error) {
        console.error(error);
        return res.json({isSuccess: false});
    }
});

app.post("/write", async(req, res) => {
    const post = req.body;
    try {
        // collection이 초기화되었는지 확인
        if (!collection) {
            throw new Error("Database not connected");
        }
        const result = await postService.writePost(collection, post);
        res.redirect(`/detail/${result.insertedId}`);
    } catch(error) {
        console.error(error);
        res.render("write", {title: "테스트 게시판", error: "글 작성 중 오류가 발생했습니다."});
    }
});

app.get("/detail/:id", async(req, res) => {
    try {
        // collection이 초기화되었는지 확인
        if (!collection) {
            throw new Error("Database not connected");
        }
        const result = await postService.getDetailPost(collection, req.params.id);
        res.render("detail", {
            title: "테스트 게시판",
            post: result, // result.value 대신 result 사용 (getDetailPost에서 직접 post 객체 반환)
        });
    } catch(error) {
        console.error(error);
        res.render("detail", {title: "테스트 게시판", error: "게시글을 불러올 수 없습니다."});
    }
});

app.post("/check-password", async (req, res) => {
    const {id, password} = req.body;
    const post = await postService.getPostByIdAndPassword(collection, {id, password});
    if(!post) {
        return res.status(404).json({isExist: false});
    }
    else {
        return res.json({isExist: true});
    }
});

let collection;
app.listen(3000, async() => {
    console.log("Server Started");
    const MongoClient = await mongodbConnection();
    collection = MongoClient.db().collection("post");
    console.log("MongoDB Connected");
});