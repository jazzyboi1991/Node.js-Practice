const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.set({"Content-Type": "text/html; charest=utf-8"});
    res.end("Hello Express");
});

app.listen(port, () => {
    console.log(`START SERVER : use ${port}`);
});