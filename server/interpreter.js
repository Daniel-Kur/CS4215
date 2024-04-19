/* *************************
 * values of the interpreter
 * *************************/

// for numbers, strings, booleans, undefined, null
// we use the value directly

// closures aka function values
const is_closure = x =>
    x !== null && 
    typeof x === "object" &&
    x.tag === 'closure'

const is_builtin = x =>
    x !== null &&
    typeof x === "object" && 
    x.tag == 'builtin'

// Function to check if a value is a number
function is_number(value) {
    return typeof value === 'number' && !isNaN(value);
}

// Function to check if a value is a string
function is_string(value) {
    return typeof value === 'string';
}

// catching closure and builtins to get short displays
const value_to_string = x => 
     is_closure(x)
     ? '<closure>'
     : is_builtin(x)
     ? '<builtin: ' + x.sym + '>'
     : stringify(x)

/* **********************
 * operators and builtins
 * **********************/

const binop_microcode = {
    '+': (x, y)   => (is_number(x) && is_number(y)) ||
                     (is_string(x) && is_string(y))
                     ? x + y 
                     : error([x,y], "+ expects two numbers" + 
                                    " or two strings, got:"),
    // todo: add error handling to JS for the following, too
    '*':   (x, y) => x * y,
    '-':   (x, y) => x - y,
    '/':   (x, y) => x / y,
    '%':   (x, y) => x % y,
    '<':   (x, y) => x < y,
    '<=':  (x, y) => x <= y,
    '>=':  (x, y) => x >= y,
    '>':   (x, y) => x > y,
    '===': (x, y) => x === y,
    '!==': (x, y) => x !== y,
    '&&': (x, y) => x && y,
    '||': (x, y) => x || y,
}

// v2 is popped before v1
const apply_binop = (op, v2, v1) => binop_microcode[op](v1, v2)

const unop_microcode = {
    '-unary': x => - x,
    '!'     : x => is_boolean(x) 
                   ? ! x 
                   : error(x, '! expects boolean, found:')
}

const apply_unop = (op, v) => unop_microcode[op](v)

function error(message, type = "") {
    console.error(`Error ${type}: ${message}`);
    throw new Error(`Error ${type}: ${message}`);
}

function arity(x) {
    if (typeof x === 'function' && x !== null) {
        return x.arity;
    } else {
        return error(x, 'arity expects function, received:');
    }
}

const builtin_mapping = {

}
// const builtin_mapping = {
//     display       : display,
//     get_time      : get_time,
//     stringify     : stringify,
//     error         : error,
//     prompt        : prompt,
//     is_number     : is_number,
//     is_string     : is_string,
//     is_function   : x => typeof x === 'object' &&
//                          (x.tag == 'builtin' ||
//                           x.tag == 'closure'),
//     is_boolean    : is_boolean,
//     is_undefined  : is_undefined,
//     parse_int     : parse_int,
//     char_at       : char_at,
//     arity         : x => typeof x === 'object' 
//                          ? x.arity
//                          : error(x, 'arity expects function, received:'),
//     math_abs      : math_abs,
//     math_acos     : math_acos,
//     math_acosh    : math_acosh,
//     math_asin     : math_asin,
//     math_asinh    : math_asinh,
//     math_atan     : math_atan,
//     math_atanh    : math_atanh,
//     math_atan2    : math_atan2,
//     math_ceil     : math_ceil,
//     math_cbrt     : math_cbrt,
//     math_expm1    : math_expm1,
//     math_clz32    : math_clz32,
//     math_cos      : math_cos,
//     math_cosh     : math_cosh,
//     math_exp      : math_exp,
//     math_floor    : math_floor,
//     math_fround   : math_fround,
//     math_hypot    : math_hypot,
//     math_imul     : math_imul,
//     math_log      : math_log,
//     math_log1p    : math_log1p,
//     math_log2     : math_log2,
//     math_log10    : math_log10,
//     math_max      : math_max,
//     math_min      : math_min,
//     math_pow      : math_pow,
//     math_random   : math_random,
//     math_round    : math_round,
//     math_sign     : math_sign,
//     math_sin      : math_sin,
//     math_sinh     : math_sinh,
//     math_sqrt     : math_sqrt,
//     math_tanh     : math_tanh,
//     math_trunc    : math_trunc,
//     pair          : pair,
//     is_pair       : is_pair,
//     head          : head,
//     tail          : tail,
//     is_null       : is_null,
//     set_head      : set_head,
//     set_tail      : set_tail,
//     array_length  : array_length,
//     is_array      : is_array,
//     list          : list,
//     is_list       : is_list,
//     display_list  : display_list,
//     // from list libarary
//     equal         : equal,
//     length        : length,
//     list_to_string: list_to_string,
//     reverse       : reverse,
//     append        : append,
//     member        : member,
//     remove        : remove,
//     remove_all    : remove_all,
//     enum_list     : enum_list,
//     list_ref      : list_ref,
//     // misc
//     draw_data     : draw_data,
//     parse         : parse,
//     tokenize      : tokenize,
//     apply_in_underlying_javascript: apply_in_underlying_javascript
// }

const apply_builtin = (builtin_symbol, args) =>{
    console.log(args)
    builtin_mapping[builtin_symbol](...args)
}

/* ************
 * environments
 * ************/

// Frames are objects that map symbols (strings) to values.

const global_frame = {}

// fill global frame with built-in objects
for (const key in builtin_mapping) 
    global_frame[key] = { tag:   'builtin', 
                          sym:   key, 
                          arity: arity(builtin_mapping[key])
                        }
// fill global frame with built-in constants
// global_frame.undefined    = undefined
// global_frame.math_E       = math_E
// global_frame.math_LN10    = math_LN10
// global_frame.math_LN2     = math_LN2
// global_frame.math_LOG10E  = math_LOG10E
// global_frame.math_LOG2E   = math_LOG2E
// global_frame.math_PI      = math_PI
// global_frame.math_SQRT1_2 = math_SQRT1_2
// global_frame.math_SQRT2   = math_SQRT2
class Pair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }

    // Accessor for the first element
    head() {
        return this.first;
    }

    // Accessor for the second element
    tail() {
        return this.second;
    }

    // Method to convert the pair to a string for easier debugging
    toString() {
        return `(${this.first}, ${this.second})`;
    }

    // Static method to check if an object is a Pair
    static isPair(obj) {
        return obj instanceof Pair;
    }
}

// An environment is null or a pair whose head is a frame 
// and whose tail is an environment.
const empty_environment = null
const global_environment = new Pair(global_frame, empty_environment)

const lookup = (x, e) => {
    if (is_null(e)) 
        console.log(x, 'unbound name:')
    if (e.head().hasOwnProperty(x)) {
        const v = e.head()[x]
        if (is_unassigned(v))
            console.log(cmd.sym, 'unassigned name:')
        return v
    }
    return lookup(x, e.tail())
}

function is_null(x) {
    return x === null;
}

const assign = (x, v, e) => {
    if (is_null(e))
        console.log(x, 'unbound name:')
    if (e.head().hasOwnProperty(x)) {
        e.head()[x] = v
    } else {
        assign(x, v, e.tail())
    }
}

const extend = (xs, vs, e) => {
    if (vs.length > xs.length) error('too many arguments')
    if (vs.length < xs.length) error('too few arguments')
    const new_frame = {}
    for (let i = 0; i < xs.length; i++) 
        new_frame[xs[i]] = vs[i]
    return new Pair(new_frame, e)
}

// At the start of executing a block, local 
// variables refer to unassigned values.
const unassigned = { tag: 'unassigned' }

const is_unassigned = v => {
    return v !== null && 
    typeof v === "object" && 
    v.hasOwnProperty('tag') &&
    v.tag === 'unassigned'
} 

/* ******************
 * handling sequences
 * ******************/

// Every sequence pushes a single value on stash.
// Empty sequences push undefined.
// Commands from non-empty sequences are separated 
// by pop_i instructions so that only the result
// result of the last statement remains on stash.
const handle_sequence = seq => {
    if (seq.length === 0) 
        return [{tag: "lit", undefined}]
    let result = []
    let first = true
    for (let cmd of seq) {
        first ? first = false
              : result.push({tag: 'pop_i'})
        result.push(cmd)
    }
    return result.reverse()
}

/* ***************
 * handling blocks
 * ***************/

// scanning out the declarations from (possibly nested)
// sequences of statements, ignoring blocks
const scan = comp => 
    comp.tag === 'seq'
    ? comp.stmts.reduce((acc, x) => acc.concat(scan(x)),
                        [])
    : ['let', 'const', 'fun'].includes(comp.tag)
    ? [comp.sym]
    : []

/* **********************
 * using arrays as stacks
 * **********************/

// add values destructively to the end of 
// given array; return the array
const push = (array, ...items) => {
    array.splice(array.length, 0, ...items)
    return array 
}

// return the last element of given array
// without changing the array
const peek = array =>
    array.slice(-1)[0];

function array_length(arr) {
    if (Array.isArray(arr)) {
        return arr.length;
    } else {
        throw new Error('len function expects an array, received: ' + typeof arr);
    }
}


// Concurrency
function executeChannelOperation(command, env) {
    switch (command.type) {
        case 'createChannel':
            const channel = new Channel(command.bufferSize);
            env[command.varName] = channel;
            break;
        case 'send':
            const ch = lookup(command.channel, env);
            return ch.send(execute(command.value, env));
        case 'receive':
            const chan = lookup(command.channel, env);
            return chan.receive();
    }
}

function executeLockOperation(command, env) {
    switch (command.type) {
        case 'lock':
            const mutex = lookup(command.mutex, env);
            return mutex.lock();
        case 'unlock':
            const mtx = lookup(command.mutex, env);
            mtx.unlock();
            break;
    }
}

/* **************************
 * interpreter configurations
 * **************************/

// An interpreter configuration has three parts:
// C: control: stack of commands
// S: stash: stack of values
// E: environment: list of frames

// control C

// The control C is a stack of commands that still need
// to be executed by the interpreter. The control follows 
// stack discipline: pop, push, peek at end of the array.

// Commands are nodes of syntax tree or instructions.

// Instructions are objects whose tag value ends in '_i'.

// Execution initializes C as a singleton array
// containing the given program.

let C

// stash S 

// stash S is array of values that stores intermediate 
// results. The stash follows strict stack discipline:
// pop, push, peek at the end of the array.

// Execution initializes stash S as an empty array.

let S

// environment E

// See *environments* above. Execution initializes 
// environment E as the global environment.

let E

/* *********************
 * interpreter microcode
 * *********************/

// The interpreter dispaches for each command tag to the 
// microcode that belong to the tag.

// microcode.cmd_tag is the microcode for the command,
// a function that takes a command as argument and 
// changes the configuration according to the meaning of
// the command. The return value is not used.
        
const microcode = {
    //
    // expressions
    //
    arr_len: 
        cmd => 
        push(C, {tag: "arr_len_i"}, cmd.expr),
    lit:
        cmd =>
        push(S, cmd.val),
    nam:
        cmd => 
        push(S, lookup(cmd.sym, E)),
    unop:
        cmd =>
        push(C, {tag: 'unop_i', sym: cmd.sym}, cmd.frst),
    binop:
        cmd =>
        push(C, {tag: 'binop_i', sym: cmd.sym}, cmd.scnd, cmd.frst),
    log:
        cmd => 
        push(C, cmd.sym == '&&' 
                ? {tag: 'cond_expr', 
                   pred: cmd.frst, 
                   cons: {tag: 'lit', val: true},
                   alt: cmd.scnd}
                : {tag: 'cond_expr',  
                   pred: cmd.frst,
                   cons: cmd.scnd, 
                   alt: {tag: 'lit', val: false}}),
    cond_expr: 
        cmd => 
        push(C, {tag: 'branch_i', cons: cmd.cons, alt: cmd.alt}, cmd.pred),
    app: 
        cmd =>
        push(C, {tag: 'app_i', arity: cmd.args.length}, 
                ...cmd.args, // already in reverse order, see ast_to_json
                cmd.fun),
    assmt: 
        cmd =>
        push(C, {tag: 'assmt_i', sym: cmd.sym}, cmd.expr),
    lam:
        cmd =>
        push(S, {tag: 'closure', prms: cmd.prms, body: cmd.body, env: E}),
    arr_lit:
        cmd =>
        push(C, {tag: 'arr_lit_i', arity: cmd.elems.length}, 
                ...cmd.elems), // already in reverse order, see ast_to_json
    arr_acc: 
        cmd =>
        push(C, {tag: 'arr_acc_i'}, cmd.ind, cmd.arr),
    arr_assmt: 
        cmd => 
        push(C, {'tag': 'arr_assmt_i'}, cmd.expr, cmd.ind, cmd.arr),
    
    //
    // statements
    //
    seq: 
        cmd => push(C, ...handle_sequence(cmd.stmts)),
    cond_stmt:
        cmd =>
        push(C, {tag: 'branch_i', cons: cmd.cons, alt: cmd.alt},
                cmd.pred),
    blk:
        cmd => {
            const locals = scan(cmd.body)
            const unassigneds = locals.map(_ => unassigned)
            if (! (C.length === 0))
                push(C, {tag: 'env_i', env: E})
            push(C, cmd.body)
            E = extend(locals, unassigneds, E)
        },
    let: 
        cmd => 
        push(C, {tag: 'lit', val: undefined}, 
                {tag: 'pop_i'},
                {tag: 'assmt', sym: cmd.sym, expr: cmd.expr}),
    const:
        cmd =>
        push(C, {tag: "lit", val: undefined},
                {tag: 'pop_i'},
                {tag: 'assmt', sym: cmd.sym, expr: cmd.expr}),
    ret:
        cmd =>
        push(C, {tag: 'reset_i'}, cmd.expr),
    fun:
        cmd =>
        push(C, {tag:  'const',
                 sym:  cmd.sym,
                 expr: {tag: 'lam', prms: cmd.prms, body: cmd.body}}),
                 
    break:
        cmd => 
        push(C, {tag: 'break_i'}),
        
    cont:
        cmd => 
        push(C, {tag: 'cont_i'}),
        
    // CHANGED 
    
    while:
        cmd =>
        push(C, {tag: 'lit', val: undefined},
        
                {tag: 'while_i', pred: cmd.pred, 
                body: cmd.body, 
                // while instructions remember the 
                // original environment
                env: E},
                
                cmd.pred),
    
    //
    // instructions
    //
    arr_len_i:
        cmd => {
            S.push(S.pop().length)
        },
    reset_i:
        cmd =>
        C.pop().tag === 'mark_i'    // mark found?  
        ? null                    // stop loop
        : push(C, cmd),           // continue loop by pushing same
                                  // reset_i instruction back on control
    assmt_i:  
        // peek top of stash without popping:
        // the value remains on the stash
        // as the value of the assignment
        cmd =>
        assign(cmd.sym, peek(S), E),
    unop_i:
        cmd => 
        push(S, apply_unop(cmd.sym, S.pop())),
    binop_i: 
        cmd =>
        push(S, apply_binop(cmd.sym, S.pop(), S.pop())),
    pop_i: 
        _ =>
        S.pop(),
    app_i: 
        cmd => {
            const arity = cmd.arity
            let args = []
            for (let i = arity - 1; i >= 0; i--)
                args[i] = S.pop()
            const sf = S.pop()
            if (sf.tag === 'builtin')
                return push(S, apply_builtin(sf.sym, args))
            // remaining case: sf.tag === 'closure'
            if (C.length === 0 || peek(C).tag === 'env_i') {   
                // current E not needed:
                // just push mark, and not env_i
                push(C, {tag: 'mark_i'})
            } else if (peek(C).tag === 'reset_i') {            
                // tail call: 
                // The callee's ret_i will push another reset_i
                // which will go to the correct mark.
                C.pop()
                // The current E is not needed, because
                // the following reset_i is the last body 
                // instruction to be executed.
            } else {
                // general case:
                // push current environment
                push(C, {tag: 'env_i', env: E}, {tag: 'mark_i'}) 
            }
            push(C, sf.body)
            E = extend(sf.prms, args, sf.env)
            },
    branch_i: 
        cmd => 
        push(C, S.pop() ? cmd.cons : cmd.alt),
        
    // CHANGED

    break_i:
        cmd => {
            // find the closest while_i 
            let next = C.pop()
            while (next.tag !== 'while_i') {
                next = C.pop()
            }
            // restore the environment
            push(C, {tag: 'env_i', env: next.env})
            // stop the loop by not pushing while_i
        },

    // CHANGED

    cont_i: 
        cmd => {
            // find the closest while_i 
            let next = C.pop()
            while (next.tag !== 'while_i') {
                next = C.pop()
            }

            // continue the loop after restoring environment
            push(C, {tag: 'while_i', pred: next.pred, 
                        body: next.body, env: next.env}, 
                    next.pred,
                    {tag: 'env_i', env: next.env}
                    )
        },
        
    while_i:
        cmd => 
        S.pop() 
        ? push(C, cmd,             // push while_i itself back on control
                    cmd.pred,
                    {tag: 'pop_i'},  // pop body value
                    cmd.body)        
        : null,
    env_i: 
        cmd => 
        E = cmd.env,
    arr_lit_i: 
        cmd => {
            const arity = cmd.arity
            const array = S.slice(- arity - 1, S.length)
            S = S.slice(0, - arity)
            push(S, array)
        },
    arr_acc_i:
        cmd => {
            const ind = S.pop()
            const arr = S.pop()
            push(S, arr[ind])
        },       
    arr_assmt_i:
        cmd => {
            const val = S.pop()
            const ind = S.pop()
            const arr = S.pop()
            arr[ind] = val
            push(S, val)
        },
    goroutine: cmd => {
        const funcDetails = lookup(cmd.call.func, E);
        if (funcDetails && funcDetails.tag === 'closure') {
            setTimeout(() => {
                const newC = [funcDetails.body];
                const newS = [];
                const newE = extend(funcDetails.prms, cmd.call.args, funcDetails.env);
                const result = executeClosure(newC, newS, newE);
                handleGoroutineResult(result);  // Callback to handle result
            }, 0);
        } else {
            console.error("Function not found or is not a callable closure");
        }
    },
    createChannel: cmd => {
        const channel = new Channel(cmd.bufferSize);
        assign(cmd.varName, channel, E);
    },
    send: async cmd => {
        const channel = lookup(cmd.channelName, E);
        const value = evaluate(cmd.value, E);
        await channel.send(value);
    },
    receive: async cmd => {
        const channel = lookup(cmd.channelName, E);
        const value = await channel.receive();
        push(S, value);
    },
    lock: async cmd => {
        const mutex = lookup(cmd.mutexName, E);
        await mutex.lock();
    },
    unlock: cmd => {
        const mutex = lookup(cmd.mutexName, E);
        mutex.unlock();
    },
}

function handleGoroutineResult(result) {
    console.log("Goroutine completed with result:", result);
}

function evaluate(expr, env) {
    if (typeof expr === 'number' || typeof expr === 'string' || typeof expr === 'boolean') {
        // Base case: if the expression is a literal (number, string, boolean), return it directly.
        return expr;
    } else if (expr.tag) {
        // Handle different types of expressions based on their tags.
        switch (expr.tag) {
            case 'nam': // Variable names
                return lookup(expr.sym, env);
            case 'app': // Function applications
                return applyFunction(expr, env);
            case 'binop': // Binary operations
                return applyBinOp(expr, env);
            case 'unop': // Unary operations
                return applyUnOp(expr, env);
            default:
                throw new Error("Unsupported expression type: " + expr.tag);
        }
    } else {
        throw new Error("Invalid expression format");
    }
}

function applyFunction(expr, env) {
    const func = lookup(expr.fun.sym, env);
    if (func && func.tag === 'closure') {
        const argsEvaluated = expr.args.map(arg => evaluate(arg, env));
        return executeFunction(func, argsEvaluated);
    } else {
        throw new Error("Function not found: " + expr.fun.sym);
    }
}

function applyBinOp(expr, env) {
    const left = evaluate(expr.left, env);
    const right = evaluate(expr.right, env);
    switch (expr.op) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        // Add other operations based on your language's support
        default:
            throw new Error("Unsupported binary operator: " + expr.op);
    }
}

function applyUnOp(expr, env) {
    const operand = evaluate(expr.operand, env);
    switch (expr.op) {
        case '!':
            return !operand;
        // Add other unary operators as needed
        default:
            throw new Error("Unsupported unary operator: " + expr.op);
    }
}

function executeFunction(func, args) {
    if (func.body) {
        // Assuming func is a 'closure' with a defined body and its own scoped environment
        const localEnv = extend(func.params, args, func.env);
        return executeGO(func.body, localEnv); // Reuse your existing execute logic for function bodies
    } else {
        throw new Error("Function execution error: Body is undefined");
    }
}


function executeClosure(C, S, E) {
    // Similar to the runInterpreter function, you may need to handle execution specific to closures
    while (C.length > 0) {
        const cmd = C.pop();
        if (microcode.hasOwnProperty(cmd.tag)) {
            microcode[cmd.tag](cmd);
        } else {
            console.error("Unknown command in closure:", command_to_string(cmd));
        }
    }
}

/* *********
 * debugging
 * *********/

// used for display of environments
const all_except_last = xs =>
    is_null(tail(xs))
    ? null 
    : pair(head(xs), all_except_last(tail(xs)))

const command_to_string = cmd =>
    (cmd.tag === 'env_i')
    ? '{ tag: "env_i", env: ...}'
    : JSON.stringify(cmd)

const debug = (cmd) => {
    display(cmd.tag, "executed command:")
    display("", "C:")
    for (let cmd of C) 
       display('', command_to_string(cmd))
    display("", "S:")
    for (let val of S)
       display('', value_to_string(val))
    display("", "E:")
    for_each(frame => {
                for (const key in frame) {
                    display("", key + ": " + value_to_string(frame[key]))
                }
                display("",'               ')
             },
             all_except_last(E))
    
}

/* ****************
 * interpreter loop
 * ****************/

const step_limit = 1000000

const execute = (program) => {
    C = [program]
    S = []
    E = global_environment
    let i = 0
    while (i < step_limit) {
        if (C.length === 0) break
        const cmd = C.pop()
        if (microcode.hasOwnProperty(cmd.tag)) {
            microcode[cmd.tag](cmd)
            //debug(cmd)
        } else {
            console.log("", "unknown command: " + 
                      command_to_string(cmd))
        }
        i++
    }
    if (i === step_limit) {
        console.log("step limit " + stringify(step_limit) + " exceeded")
    }
    if (S.length > 1 || S.length < 1) {
        console.log(S, 'internal error: stash must be singleton but is: ')
    }
    return S[0]
}

//Asycn Execution

function executeGO(program) {
    //console.log(stringify(tokenize(program)));
    C = [tokenize(program)]; // Initialize the control stack with the program
    S = [];                  // Initialize an empty stash
    E = global_environment;  // Set the current environment to the global environment

    // Main loop replaced by an asynchronous scheduler
    runInterpreter(); // This function will handle the execution loop
}

function runInterpreter() {
    let steps = 0;
    const maxStepsPerTick = 100; // Prevent freezing by limiting execution steps per tick

    function step() {
        for (let i = 0; i < maxStepsPerTick; i++) {
            if (C.length === 0) return finish(); // No more commands to execute
            const cmd = C.pop();
            if (microcode.hasOwnProperty(cmd.tag)) {
                microcode[cmd.tag](cmd);
            } else {
                console.error("Unknown command:", command_to_string(cmd));
            }
        }
        // Schedule the next batch of commands
        setTimeout(step, 0); // Continue execution in the next event loop tick
    }

    function finish() {
        if (S.length !== 1) {
            console.error('Internal error: stash must be singleton but is:', S);
        }
        console.log(S[0]); // Output the result of the program
    }

    setTimeout(step, 0); // Start the execution
}

function stringify(value) {
    return JSON.stringify(value, replacer, 0);
}

function replacer(key, value) {
    if (typeof value === 'function') {
        return value.toString(); // Convert functions to their source code
    } else if (typeof value === 'undefined') {
        return 'undefined'; // JSON.stringify omits undefined values
    } else if (typeof value === 'symbol') {
        return value.toString(); // Convert symbols to string representations
    }
    return value;
}
const _ = require('lodash');
const test = (program, expected) => {
    console.log("", `
    
****************
Test case: ` + program + "\n")
    const result = execute(program)
    // Debug: check and log types
    console.log("Result Type:", typeof result);
    console.log("Expected Type:", typeof expected);

    // Using JSON.stringify for deeper inspection
    console.log("Result Stringified:", JSON.stringify(result));
    console.log("Expected Stringified:", JSON.stringify(expected));
    if (stringify(result) === stringify(expected)) {
        console.log(result, "success:")
    } else {
        console.log(expected, "FAILURE! expected:")
        console.log(result, "result:")
    }
}

const testAsy = (program, expected) => {
    console.log("", `
    
****************
Test case: ` + program + "\n")
    const result = executeGO(program)
    // Debug: check and log types
    console.log("Result Type:", typeof result);
    console.log("Expected Type:", typeof expected);

    // Using JSON.stringify for deeper inspection
    console.log("Result Stringified:", JSON.stringify(result));
    console.log("Expected Stringified:", JSON.stringify(expected));
    if (stringify(result) === stringify(expected)) {
        console.log(result, "success:")
    } else {
        console.log(expected, "FAILURE! expected:")
        console.log(result, "result:")
    }
}

module.exports = {execute, executeGO, test};