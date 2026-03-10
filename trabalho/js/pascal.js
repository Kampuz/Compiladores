const TOKEN_TYPES = {
    'program': 'palavra-reservada-program',
    'procedure': 'palavra-reservada-procedure',
    'var': 'palavra-reservada-var',
    'begin': 'palavra-reservada-begin',
    'end': 'palavra-reservada-end',
    'int': 'tipo-inteiro',
    'boolean': 'tipo-boolean',
    ',': 'vírgula',
    ';': 'ponto-vírgula',
    ':': 'dois-pontos',
    '.': 'ponto-final',
    '(': 'abre-parenteses',
    ')': 'fecha-parenteses',
    ':=': 'atribucao',
    '+': 'operacao-soma',
    '-': 'operacao-subtracao',
    '*': 'operacao-multiplicacao',
    '/': 'operacao-divisao',
    '<>': 'operacao-diferente',
    '>=': 'operacao-maior-igual',
    '<=': 'operacao-menor-igual',
    '<': 'operacao-menor',
    '>': 'operacao-maior',
    'not': 'operacao-negacao',
    'or': 'operacao-inclusiva',
    'and': 'operacao-conjuncao',
    'if': 'palavra-reservada-if',
    'then': 'palavra-reservada-then',
    'else': 'palavra-reservada-else',
    'while': 'palavra-reservada-while',
    'do': 'palavra-reservada-do',
}

const MAX_LEN = 10

function isVocabulary(symbol) {
    return (isDigit(symbol) || isLetter(symbol) || getTokenType(symbol) !== 'inválido');
}

function isDigit(number) {
    return ((number >= '0') && (number <= '9'));
}

function isLetter(char) {
    return (((char >= 'a') && (char <= 'z')) || ((char >= 'A') && (char <= 'Z')) || (char === '_'));
}

function tokenize() {
    const text = document.getElementById('code-input').value;
    lexicalAnalise(text);
}

function getTokenType(token) {
    return TOKEN_TYPES[token] ?? 'inválido';
}

function isValidIdentifier(token) {
    if (!isLetter(token[0])) return false;
    
    for (let i = 1; i < token.length; i++) {
        if (!isLetter(token[i]) && !isDigit(token[i])) return false;
    }

    return true;
}


function handleComment(input, i, state) {
    let firstChar = input[i];
    let secondChar = input[i + 1];

    if (firstChar === '{') {
        i++;

        while (i < input.length && input[i] !== '}') {
            if (input[i] === '\n') {
                state.line++;
                state.offset = i + 1;
            }
            i++;
        }
        return i;
    } else if (firstChar === '/' && secondChar === '/') {
        while (i < input.length && input[i] !== '\n') {
            i++;
        }
        state.line++;
        state.offset = i + 1;
        return i;
    }

    return i;
}

function lexicalAnalise(input) {
    let state = {
        line: 1,
        offset: 0
    };

    let output = "";
    let error = "";

    for (let i = 0; i < input.length; i++) {

        if (input[i] === ' ' || input[i] == '\t') continue;

        else if (input[i] === '\n') {
            state.line++;
            state.offset = i + 1;
            continue;
        }

        else if (input[i] === '{' || (input[i] === '/' && input[i + 1] === '/')) {
            i = handleComment(input, i, state);
            continue;
        }

        let col_inicial = i - state.offset + 1;
        let col_final = col_inicial
        let token = '';
        let tokenType = '';

        if (isDigit(input[i])) {
            let start = i;
            let float_start = 0;
            while (i < input.length && isDigit(input[i])) i++;

            if (i < input.length && input[i] === '.' && isDigit(input[i + 1])) {
                i++;
                float_start = i
                while (i < input.length && isDigit(input[i])) i++;
                tokenType = "nReal";
            } else {
            tokenType = "nInt";
        }

        token = input.substring(start, i);
        i--;
        col_final = i - state.offset + 1;
        if ((tokenType === "nReal") && ((i + 1) - float_start) > MAX_LEN) {
            error += `${token}  numero-real-longo  ${state.line}  ${col_inicial}  ${col_final}<br>`
        }

    } else if (isLetter(input[i])) {
        let start = i;

        while (i < input.length && (isLetter(input[i]) || isDigit(input[i]))) i++;
        
        token = input.substring(start, i);
        
        if (TOKEN_TYPES[token]) {
            tokenType = TOKEN_TYPES[token];
        } else {
            if (isValidIdentifier(token))
                tokenType = "identificador-válido";
            else tokenType = "identificador-inválido"
        }
        
        i--;
        col_final = i - state.offset + 1;
        if ((i - start) > MAX_LEN) {
            error += `${token}  identificador-longo  ${state.line}  ${col_inicial}  ${col_final}<br>`
        }
        
    } else if (input[i] === ':' && input[i + 1] === '=') {
        token = ':=';
        tokenType = TOKEN_TYPES[token];
        i++;
        col_final = i - state.offset + 1;

    } else if ((input[i] === '<' && (input[i + 1] === '>' || input[i + 1] === '=') ||
        (input[i] === '>' && input[i + 1] === '='))) {
        token = `${input[i]}${input[i + 1]}`;
        tokenType = TOKEN_TYPES[token];
        i++;
        col_final = i - state.offset + 1;

    } else {
        token = input[i];
        console.log(getTokenType(token))
        tokenType = getTokenType(token);
        col_final = i - state.offset + 1;

        if (!isVocabulary(token)) {
            error += `${token}  alfabeto-nao-identificado  ${state.line}  ${col_inicial}  ${col_final}<br>`
        }
    }

    output += `${token}  ${tokenType}  ${state.line}  ${col_inicial}  ${col_final}<br>`;
}

document.getElementById('token-output').innerHTML = output;
document.getElementById('error-output').innerHTML = error;
}