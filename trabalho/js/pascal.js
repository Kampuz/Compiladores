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

function getTokenType(token) {
    return TOKEN_TYPES[token] ?? 'inválido';
}

function isVocabulary(symbol) {
    return (isDigit(symbol) || isLetter(symbol) || getTokenType(symbol) !== 'inválido');
}

function isDigit(number) {
    return ((number >= '0') && (number <= '9'));
}

function isLetter(char) {
    return (((char >= 'a') && (char <= 'z')) || ((char >= 'A') && (char <= 'Z')) || (char === '_'));
}

function isSpace(char) {
    return (char === ' ' || char === '\t')
}

function isNewLine(char) {
    return (char === '\n')
}

function isCommentOpener(firstChar, secondChar) {
    return firstChar === '{' || (firstChar === '/' && secondChar === '/')
}

function tokenize() {
    const text = document.getElementById('code-input').value;
    lexicalAnalise(text);
}

function isValidIdentifier(token) {
    if (!isLetter(token[0])) return false;
    
    for (let i = 1; i < token.length; i++) {
        if (!isLetter(token[i]) && !isDigit(token[i])) return false;
    }

    return true;
}

function updateState(state, i) {
    state.line++;
    state.offset = i + 1;

    return state
}

function updateCol(i, offset) {
    return i - offset + 1;
}

function handleComment(input, i, state) {
    let firstChar = input[i];
    let secondChar = input[i + 1];

    if (firstChar === '{') {
        while (i < input.length && input[i] !== '}') {
            if (isNewLine(i)) {
                state = updateState(state, i)
            }

            i++;
        }

    } else if (firstChar === '/' && secondChar === '/') {
        while (i < input.length && !isNewLine(i)) i++;

        state = updateState(state, i)
    }

    return i;
}

function lexicalAnalise(input) {
    let state = {
        line: 1,
        offset: 0,
        error: "",
        output: ""
    };

    for (let i = 0; i < input.length; i++) {

        if (isSpace(input[i])) continue;

        if (isNewLine(input[i])) {
            state = updateState(state, i)
            continue;
        }

        else if (isCommentOpener(input[i], input[i + 1])) {
            i = handleComment(input, i, state);
            continue;
        }

        let initialCol = updateCol(i, state.offset);
        let finalCol = initialCol
        let token = '';
        let tokenType = '';

        if (isDigit(input[i])) {
            let floatStart = i, start = i;

            while (i < input.length && isDigit(input[i])) i++;

            if (i < input.length && input[i] === '.' && isDigit(input[i + 1])) {
                i++;
                floatStart = i;
                while (i < input.length && isDigit(input[i])) i++;
                tokenType = "nReal";
            } else {
            tokenType = "nInt";
            }

            token = input.substring(start, i);
            i--;
            finalCol = updateCol(i, state.offset);

            if ((tokenType === "nReal") && ((i + 1) - floatStart) > MAX_LEN) {
                state.error += `${token}  numero-real-longo  ${state.line}  ${initialCol}  ${finalCol}<br>`
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
            finalCol = updateCol(i, state.offset);
            if ((i - start) > MAX_LEN) {
                state.error += `${token}  identificador-longo  ${state.line}  ${initialCol}  ${finalCol}<br>`
            }
            
        } else if (input[i] === ':' && input[i + 1] === '=') {
            token = ':=';
            tokenType = TOKEN_TYPES[token];
            i++;
            finalCol = updateCol(i, state.offset);

        } else if ((input[i] === '<' && (input[i + 1] === '>' || input[i + 1] === '=') ||
            (input[i] === '>' && input[i + 1] === '='))) {
            token = `${input[i]}${input[i + 1]}`;
            tokenType = TOKEN_TYPES[token];
            i++;
            finalCol = updateCol(i, state.offset);

        } else {
            token = input[i];
            console.log(getTokenType(token))
            tokenType = getTokenType(token);
            finalCol = updateCol(i, state.offset);

            if (!isVocabulary(token)) {
                state.error += `${token}  alfabeto-nao-identificado  ${state.line}  ${initialCol}  ${finalCol}<br>`
            }
        }

    state.output += `${token}  ${tokenType}  ${state.line}  ${initialCol}  ${finalCol}<br>`;
}

document.getElementById('token-output').innerHTML = state.output;
document.getElementById('error-output').innerHTML = state.error;
}