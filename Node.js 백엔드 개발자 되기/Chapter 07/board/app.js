const express = require("express");
const handlebars = require("express-handlebars");
const postService = require("./services/post-service");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true})); // extended: true로 변경하여 객체와 배열 파싱 지원

const mongodbConnection = require("./configs/mongodb-connection");

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
    res.render("write", {title: "테스트 게시판"});
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

let collection;
app.listen(3000, async() => {
    console.log("Server Started");
    const MongoClient = await mongodbConnection();
    collection = MongoClient.db().collection("post");
    console.log("MongoDB Connected");
});