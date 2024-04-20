const express = require("express")
const cors = require("cors")
const PORT = 3000;
const parser = require("./parser");
const interpreter = require("./interpreter");

const app = express();
app.use(cors())
app.use(express.json())

app.post("/parse", (req, res) => {
    console.log('Request object:', req.body);
    const parsed = parser.tokenize(req.body.key);
    res.json(parsed)
})

app.post("/exec", (req, res) => {
    const parsed = parser.tokenize(req.body.key);
    const ret = interpreter.exec(parsed)
    if (ret === undefined) {
        res.json("undefined");
    } else {
        res.json(ret)
    }
})

app.post("/execGo", (req, res) => {
    const parsed = parser.tokenize(req.body.key);
    const ret = interpreter.executeGO(parsed)
    if (ret === undefined) {
        res.json("undefined");
    } else {
        res.json(ret)
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})