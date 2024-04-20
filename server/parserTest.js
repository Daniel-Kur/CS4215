const parser = require("./parser")

const code = `
func recursiveFactorial(n int) int {
    if (n < 0) {
        return 1
    } 
    if (n == 0) {
        return n * recursiveFactorial(n - 1)
    }
}
Println(recursiveFactorial(5))`;

console.log(JSON.stringify(parser.tokenize(code), null, 2));