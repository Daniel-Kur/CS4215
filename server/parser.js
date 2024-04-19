const moo = require('moo');

let lexer = moo.compile({
    NL:        { match: /\n/, lineBreaks: true },
    WS:        /[ \t]+/,
    comment:   /\/\/.*?$/,
    break:      "break",
    len:        "len",
    lbracket: '[',
    rbracket: ']',
    type: ['int', 'float', 'string', 'bool'],
    func_dec:   "func",
    ret:       "return",
    for:        "for",
    if:         "if",
    go:         "go",
    else:       "else",
    type:      ['int', 'float', 'string', 'bool'],
    number:    /0|[1-9][0-9]*/,
    string:    /"(?:\\["\\]|[^\n"\\])*"/,
    boolean:   ['true', 'false'],
    identifier: /[a-zA-Z_][a-zA-Z0-9_]*/,
    not:       '!',
    and:       '&&',
    or:        '||',
    plus:      '+',
    minus:     '-',
    mult:      '*',
    div:       '/',
    mod:        '%',
    assign:    ':=',
    lt:        '<',
    gt:        '>',
    equals:    '===',
    lparen:    '(',
    rparen:    ')',
    lbrace:    '{',
    rbrace:    '}',
    mutate:    '=',
    keyword:   ['while', 'if', 'else', 'return'],
    comma:     ',',
    colon:     ':',
});

function tokenize(input) {
    lexer.reset(input);
    let tokens = [], currentToken;
    while (currentToken = lexer.next()) {
        if (currentToken.type !== 'WS' && currentToken.type !== 'comment') {
            tokens.push(currentToken);
        }
    }

    const output = {
        tag: "blk",
        body: parseTokens(tokens, 0).output[0]
    };

    return output;
}

function convertLiteral(value) {
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
        return parseFloat(value);  // Convert to number if possible
    } else if (value === "true" || value === "false") {
        return value === "true";  // Convert to boolean
    }
    return value.slice(1, -1);  // Return the original string if no conversion is applicable
}

function parseTokens(tokens, startIndex) {
    let output = [];
    let i = startIndex;
    let stmts = [];

    while (i < tokens.length) {
        let token = tokens[i];
        switch (token.type) {
            case "break":
                stmts.push({
                    tag: "break"
                });
                i++
                break
            case "len":
                if (tokens[i+1] && tokens[i+1].type === 'lparen' &&
                    tokens[i+2] && tokens[i+2].type === 'identifier' &&
                    tokens[i+3] && tokens[i+3].type === 'rparen') {
                    stmts.push({
                        tag: 'arr_len',
                        expr: {
                            tag: "nam",
                            sym: tokens[i+2].value
                        }
                    });
                    i += 4; // Move past 'len', '(', identifier, and ')'
                }
                break
            case 'NL':
                // New line might indicate the end of a statement
                // if (stmts.length > 0) {
                //     // If there are collected statements, push them as a sequence
                //     output.push({tag: "seq", stmts: stmts});
                //     stmts = []; // Reset for the next possible sequence
                // }
                i++;
                break;
            case "go":
                // Expect the next tokens to form a function call
                i++; // Move past 'go'
                const goroutineResult = parseFunctionCall(tokens, i);
                stmts.push({
                    tag: 'goroutine',
                    call: goroutineResult.result
                });
                i = goroutineResult.nextIndex; // Adjust index after processing the goroutine call
                break;
            case "for":
                const forResult = parseFor(tokens, i);
                stmts.push(forResult.result);
                i = forResult.nextIndex - 1; // Adjust index after processing the loop
                break;
            case "if":
                const ifResult = parseConditional(tokens, i);
                stmts.push(ifResult.result);
                i = ifResult.nextIndex; // should be correctly set by parseConditional
                break;
            case "ret":
                const exprResult = parseExpression(tokens, i + 1);
                stmts.push({
                    tag: "ret",
                    expr: exprResult.result.body
                });
                i = exprResult.nextIndex; // move beyond the parsed expression
                break;
            case 'func_dec':
                const funDecResult = parseFunctionDeclaration(tokens, i);
                stmts.push(funDecResult.result);
                i = funDecResult.nextIndex;
                break;
            case 'identifier':
                if (tokens[i + 1] && tokens[i + 1].type === 'lparen') {
                    const callResult = parseFunctionCall2(tokens, i);
                    stmts.push(callResult.result);
                    i = callResult.nextIndex;
                } else if (tokens[i + 1] && tokens[i + 1].type === 'assign') {
                    if (tokens[i + 2] && tokens[i + 2].type === 'lbracket') {
                        const arrayDeclResult = parseArrayDeclaration(tokens, i);
                        stmts.push(arrayDeclResult.result);
                        i = arrayDeclResult.nextIndex; // Adjust after the array declaration
                    } else {
                        i += 2; // Skip 'assign' and to the expression
                        const expressionResult = parseExpression(tokens, i);
                        stmts.push({
                            tag: 'let',
                            sym: token.value,
                            expr: expressionResult.result.body
                        });
                        i = expressionResult.nextIndex; // move beyond the parsed expression
                    }
                } else if (tokens[i + 1] && tokens[i + 1].type === 'mutate') {
                    i+=2;
                    const expressionResult2 = parseExpression(tokens, i);
                        stmts.push({
                            tag: 'assmt',
                            sym: token.value,
                            expr: expressionResult2.result
                        });
                        i = expressionResult2.nextIndex;
                } else {
                    stmts.push({ tag: 'nam', sym: token.value });
                    i++;
                }
                break;
            case 'not':
                // Ensure unary operation parsing also correctly updates `i`
                let operand = tokens[++i];
                    stmts.push({
                        tag: 'unop',
                        sym: '!',
                        frst: { tag: 'lit', val: operand.value }
                    });
                i++;
                break;
            default:
                if (['plus', 'minus', 'mult', 'div', 'lt', 'gt', 'equals', 'and', 'or', 'mod'].includes(token.type)) {
                    let left = stmts.pop();
                    i++; // Move to right operand
                    const rightResult = parseExpression(tokens, i);
                    stmts.push({
                        tag: 'binop',
                        sym: token.value,
                        frst: left,
                        scnd: rightResult.result.body
                    });
                    i = rightResult.nextIndex; // move beyond the parsed right expression
                } else {
                    // Convert literals to their correct type
                    if (['number', 'string', 'boolean'].includes(token.type)) {
                        stmts.push({ tag: 'lit', val: convertLiteral(token.value) });
                    }
                    i++;
                }
                break;
        }
    }

    // If there are remaining statements after the last newline, wrap them in a sequence
    if (stmts.length > 1) {
        output.push({tag: "seq", stmts: stmts});
    } else {
        output.push(stmts[0])
    }

    return {output: output, nextIndex: i};
}

function parseFunctionCall2(tokens, startIndex) {
    let i = startIndex;
    if (!tokens[i] || tokens[i].type !== 'identifier') {
        throw new Error("Expected function name at position " + i);
    }
    let functionName = tokens[i].value;
    i++; // Move past the function name

    if (!tokens[i] || tokens[i].type !== 'lparen') {
        throw new Error("Expected '(' after function name at position " + i);
    }
    i++; // Move past '('

    const args = [];
    while (i < tokens.length && tokens[i].type !== 'rparen') {
        // Expecting an expression for each argument
        const exprResult = parseExpression(tokens, i);
        args.push(exprResult.result);
        i = exprResult.nextIndex-1;

        // If there's a comma, skip it and move to the next argument
        if (tokens[i] && tokens[i].type === 'comma') {
            i++;
        }
    }

    if (!tokens[i] || tokens[i].type !== 'rparen') {
        throw new Error("Expected ')' at the end of arguments list at position " + i);
    }
    i++; // Move past ')'

    return {
        result: {
            tag: "app",
            fun: { tag: "nam", sym: functionName },
            args: args
        },
        nextIndex: i
    };
}

function parseComplexStructure(tokens, startIndex, type) {
    // Parsing complex structures like functions, loops, conditions
    // This function needs to be implemented based on your specific language constructs
    // Placeholder function below
    return {
        result: {tag: type, content: "Parsed content of " + type},
        nextIndex: startIndex + 1 // Just a placeholder increment
    };
}

function parseFunctionDeclaration(tokens, startIndex) {
    let i = startIndex;
    i++; // Move past 'func'

    if (!tokens[i] || tokens[i].type !== 'identifier') {
        throw new Error("Expected function name identifier");
    }
    const functionName = tokens[i].value;
    i++; // Move past function name

    if (!tokens[i] || tokens[i].type !== 'lparen') {
        throw new Error("Expected '(' after function name");
    }
    i++; // Move past '('
    const params = [];
    while (tokens[i] && tokens[i].type !== 'rparen') {
        if (tokens[i].type === 'identifier' && tokens[i + 1] && tokens[i + 1].type === 'type') {
            params.push(tokens[i].value);
            i += 2; // Move past parameter name and type
        }
        if (tokens[i] && tokens[i].type === 'comma') {
            i++; // Skip commas
        }
    }
    
    if (!tokens[i] || tokens[i].type !== 'rparen') {
        throw new Error("Expected ')' after parameters");
    }
    i++; // Move past ')'

    let type = "void"
    // type checking
    if (tokens[i] || tokens[i].type === 'type') {
        type = tokens[i].value;
    }
    i++;

    if (!tokens[i] || tokens[i].type !== 'lbrace') {
        throw new Error("Expected '{' to start function body");
    }
    i++; // Move past '{'

    // Now parse the function body as a sequence or block until '}'
    let body = "";
    while (tokens[i] && tokens[i].type !== 'rbrace') {
        body = body + tokens[i].value + " ";
        i++ ;
    }
    const body2 = tokenize(body)

    return {
        result: {
            tag: 'fun',
            sym: functionName,
            prms: params,
            body: body2
        },
        nextIndex: i
    };
}

function parseConditional(tokens, startIndex) {
    let i = startIndex + 1; // Move past 'if'
    let condition = [];
    while (i < tokens.length && tokens[i].type !== 'lbrace') {
        condition.push(tokens[i]);
        i++;
    }
    if (i < tokens.length) i++; // Safely move past '{'
    const conditionExpr = parseTokens(condition, 0).output[0];

    let cons = [];
    let isLbrace = 0;
    while (i < tokens.length && (tokens[i].type !== 'rbrace' || isLbrace > 0)) {
        if (tokens[i].type === 'lbrace') isLbrace++;
        if (tokens[i].type === 'rbrace') isLbrace--;
        cons.push(tokens[i]);
        i++;
    }
    if (i < tokens.length) i++; // Safely move past '}'
    const consExpr = parseTokens(cons, 0).output[0];

    let alt = { "tag": "seq", "stmts": [] };
    if (i < tokens.length && tokens[i].type === "else") {
        i++;
        if (i < tokens.length && tokens[i].type === 'if') {
            const altResult = parseConditional(tokens, i);
            alt = altResult.result;
            i = altResult.nextIndex;
        } else if (i < tokens.length && tokens[i].type === 'lbrace') {
            let elseCons = [];
            i++; // Move past '{'
            while (i < tokens.length && tokens[i].type !== 'rbrace') {
                elseCons.push(tokens[i]);
                i++;
            }
            if (i < tokens.length) i++; // Safely move past '}'
            const elseExpr = parseTokens(elseCons, 0).output;
            alt = elseExpr;
        }
    }

    return {
        result: {
            tag: "cond_stmt",
            pred: conditionExpr,
            cons: consExpr,
            alt: alt
        },
        nextIndex: i
    };
}

function parseArrayDeclaration(tokens, startIndex) {
    let i = startIndex; // Start where the identifier token is found
    let identifier = tokens[i].value; // The variable name
    i++; // Move past identifier
    i++; //now it is in [

    let size = null;
    let type = null;
    let elems = [];

    if (tokens[i].type === 'lbracket') {
        i++; // Move past '['
        size = tokens[i].value; // Get size
        i++; // Move past size
        if (tokens[i].type === 'rbracket') {
            i++; // Move past ']'
            type = tokens[i].value; // Get type
            i++; // Move past type
        }
    }

    if (tokens[i].type === 'lbrace') {
        i++; // Move past '{'
        while (i < tokens.length && tokens[i].type !== 'rbrace') {
            if (tokens[i].type !== 'comma') {
                const exprResult = elemsReduction(tokens, i);
                elems.unshift(exprResult.result);
                i = exprResult.nextIndex - 1;
            }
            i++; // Move past element or comma
        }
        i++; // Move past '}'
    }

    return {
        result: {
            tag: "let",
            sym: identifier,
            expr: {
                tag: "arr_lit",
                elems: elems
            }
        },
        nextIndex: i
    };
}

function elemsReduction(tokens, startIndex) {
    let expr = "";
    let i = startIndex;
    while (i < tokens.length && tokens[i].type !== 'rbrace' && tokens[i].type !== 'NL') {
        expr = expr + tokens[i].value + " ";
        i++;
        break;
    }
    return {
        result: tokenize(expr).body, // Concatenating expressions for simplicity
        nextIndex: i
    };
}

function parseExpression(tokens, startIndex) {
    let expr = "";
    let i = startIndex;
    while (i < tokens.length && tokens[i].type !== 'rbrace' && tokens[i].type !== 'NL') {
        expr = expr + tokens[i].value + " ";
        i++;
    }
    return {
        result: tokenize(expr), // Concatenating expressions for simplicity
        nextIndex: i
    };
}

function parseFor(tokens, startIndex) {
    let i = startIndex + 1; // Move past 'for'
    let condition = [];
    // Ensure i is within bounds and check for the start of the body
    while (i < tokens.length && tokens[i].type !== 'lbrace') {
        condition.push(tokens[i]);
        i++;
    }
    const conditionExpr = parseTokens(condition, 0).output;
    let body = [];
    if (i < tokens.length) i++; // Safely move past '{'
    // Ensure i is within bounds and parse until the matching '}'
    let isLbrace = 0;
    while (i < tokens.length && (tokens[i].type !== 'rbrace' || isLbrace > 0)) {
        if (tokens[i].type === 'lbrace') isLbrace++;
        if (tokens[i].type === 'rbrace') isLbrace--;
        body.push(tokens[i]);
        i++;
    }
    const bodyExpr = parseTokens(body, 0).output;
    if (i < tokens.length) i++; // Safely move past '}'

    return {
        result: {
            tag: "while",
            pred: conditionExpr[0],
            body: bodyExpr[0]
        },
        nextIndex: i+1
    };
}

function parseFunctionCall(tokens, startIndex) {
    let i = startIndex;
    let functionName = tokens[i].value; // Assuming the function name immediately follows 'go'
    i++; // Move past function name
    let args = [];
    if (tokens[i].type === 'lparen') {
        i++; // Move past '('
        while (i < tokens.length && tokens[i].type !== 'rparen') {
            args.push(tokens[i].value); // Simplify: assume args are literals or identifiers
            i++;
            if (tokens[i].type === 'comma') i++; // Skip commas
        }
        i++; // Move past ')'
    }
    return {
        result: {
            func: functionName,
            args: args
        },
        nextIndex: i
    };
}

module.exports = {tokenize};