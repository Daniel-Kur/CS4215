const parser = require("./parser")

const code = "y := [3]int{1,2,3} \n len(y)";

console.log(JSON.stringify(parser.tokenize(code), null, 2));