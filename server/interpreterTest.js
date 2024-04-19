const interpreter = require("./interpreter");
const parser = require("./parser")

const code = "true && false";
const parsed = parser.tokenize(code);
interpreter.test(parsed, false);