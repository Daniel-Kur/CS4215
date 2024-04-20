const interpreter = require("./interpreter");
const parser = require("./parser")

// Binary Operation
function runBinaryOperationTests() {
    const tests = [
        {
            code: "Println(5 + 3)",
            expected: [8],
            description: "Addition of two integers"
        },
        {
            code: "Println(10 - 6)",
            expected: [4],
            description: "Subtraction of two integers"
        },
        {
            code: "Println(4 / 2)",
            expected: [2],
            description: "Division of two integers"
        },
        {
            code: "Println(3 * 3)",
            expected: [9],
            description: "Multiplication of two integers"
        },
        {
            code: "Println(10 % 3)",
            expected: [1],
            description: "Modulus operation"
        },
        {
            code: "Println((1 < 2) && (2 > 1))",
            expected: [true],
            description: "Logical AND with two comparison operations"
        },
        {
            code: "Println((5 + 5) == 10)",
            expected: [true],
            description: "Addition within an equality check"
        },
        {
            code: "Println(4 >= 4 && 3 <= 5)",
            expected: [true],
            description: "Greater than or equal and less than or equal operations"
        },
        {
            code: "Println(2 + 2 * 2)",
            expected: [6],
            description: "Order of operations with addition and multiplication"
        },
        {
            code: "Println((3 + 7) * 2)",
            expected: [20],
            description: "Using parentheses to change the order of operations"
        }
    ];

    tests.forEach(test => {
        const parsedCode = parser.tokenize(test.code);
        console.log(test.description);
        interpreter.testGO(parsedCode, test.expected, test.code);
    });
}
runBinaryOperationTests()

// Unary Operation
function runUnaryOperationTests() {
    const tests = [
        {
            code: "Println(!true)",
            expected: [false],
            description: "Logical NOT on true"
        },
        {
            code: "Println(!false)",
            expected: [true],
            description: "Logical NOT on false"
        },
        {
            code: "Println(-5)",
            expected: [-5],
            description: "Unary negation of positive integer"
        },
        {
            code: "Println(-(-10))",
            expected: [10],
            description: "Double negation of a negative integer"
        },
        {
            code: "Println(!!true)",
            expected: [true],
            description: "Double logical NOT on true"
        },
        {
            code: "Println(!!false)",
            expected: [false],
            description: "Double logical NOT on false"
        }
    ];

    tests.forEach(test => {
        const parsedCode = parser.tokenize(test.code);
        console.log(test.description);
        interpreter.testGO(parsedCode, test.expected, test.code);
    });
}
runUnaryOperationTests();

// While Loop
function runWhileLoopTests() {
    const tests = [
        {
            code: "sum := 0 \n i := 1 \n for i < 5 { sum = sum + i \n i = i + 1 } \n Println(sum)",
            expected: [10],
            description: "Summing up numbers from 0 to 4"
        },
        {
            code: "product := 1 \n i := 1 \n for i < 4 { product = i * product \n i = i + 1 } \n Println(product)",
            expected: [6],
            description: "Calculating product from 1 to 3"
        },
        {
            code: "count := 0 \n i := 10 \n for i > 0 { count = count + 1 \n i = i - 2 } \n Println(count)",
            expected: [5],
            description: "Counting down by 2 from 10 to 2"
        },
        {
            code: "num := 0 \n for true { if num == 3 {break}\n num = num + 1 } \n Println(num)",
            expected: [3],
            description: "Breaking out of a for loop when num equals 3"
        }
    ];

    tests.forEach(test => {
        const parsedCode = parser.tokenize(test.code);
        console.log(test.description);
        interpreter.testGO(parsedCode, test.expected, test.code);
    });
}
runWhileLoopTests();

// Conditional Test Cases
function runConditionalTests() {
    const tests = [
        {
            code: `
if true {
    Println("Condition is true")
} else {
    Println("Condition is false")
}`,
            expected: ['"Condition is true"'],
            description: "If statement with a true condition"
        },
        {
            code: `
if false {
    Println("Condition is true")
} else {
    Println("Condition is false")
}`,
            expected: ['"Condition is false"'],
            description: "If statement with a false condition"
        },
        {
            code: `
if 5 > 3 {
    Println("5 is greater than 3")
}`,
            expected: ['"5 is greater than 3"'],
            description: "If statement with a comparison operator"
        },
        {
            code: `
if 1 == 1 && 2 != 3 {
    Println("Both conditions are true")
}`,
            expected: ['"Both conditions are true"'],
            description: "If statement with logical AND"
        },
        {
            code: `
if 1 != 1 {
    Println("1 is not equal to 1")
} else {
    Println("1 is equal to 1")
}`,
            expected: ['"1 is equal to 1"'],
            description: "If-Else with inequality"
        },
        {
            code: `
if 2 > 1 {
    if (2 < 3) {
        Println("Nested conditions are true")
    }
}`,
            expected: ['"Nested conditions are true"'],
            description: "Nested if statements"
        },
        {
            code: `
if !(3 < 2) {
    Println("Negated condition is true")
}`,
            expected: ['"Negated condition is true"'],
            description: "If statement with negation"
        }
    ];

    tests.forEach(test => {
        const parsedCode = parser.tokenize(test.code);
        console.log(test.description);
        interpreter.testGO(parsedCode, test.expected, test.code);
    });
}
runConditionalTests();

// Function Test Cases
function runFunctionDeclarationTests() {
    const tests = [
        {
            code: `
func add(a int, b int) int {
    return a + b
}
Println(add(5, 3))`,
            expected: [8],
            description: "Function declaration with addition operation"
        },
        {
            code: `
func subtract(a int, b int) int {
    return a - b
}
Println(subtract(4, 10))`,
            expected: [6],
            description: "Function declaration with subtraction operation"
        },
        {
            code: `
func multiply(a int, b int) int {
    return a * b
}
Println(multiply(6, 7))`,
            expected: [42],
            description: "Function declaration with multiplication operation"
        },
    ];

    tests.forEach(test => {
        const parsedCode = parser.tokenize(test.code);
        console.log(test.description);
        interpreter.testGO(parsedCode, test.expected, test.code);
    });
}
runFunctionDeclarationTests()