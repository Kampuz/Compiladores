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
const MAX_INT_LEN = 10

function updateError(state, token, errorType, initialCol, finalCol) {
    state.error.token = token;
    state.error.errorType = errorType;
    state.error.line = state.line;
    state.error.initialCol = initialCol;
    state.error.finalCol = finalCol;
    state.errorFound = true;
}

function updateState(state, i) {
    state.line++;
    state.offset = i + 1;

    return state
}

function updateCol(i, offset) {
    return i - offset + 1;
}

function getTokenType(token) {
    return TOKEN_TYPES[token] ?? 'inválido';
}

function commentHandler(input, i, state) {
    let firstChar = input[i];
    let secondChar = input[i + 1];

    if (firstChar === '{') {
        while (i < input.length && input[i] !== '}') {
            if (isNewLine(input[i])) state = updateState(state, i);
            
            i++;
        }

        if (i === input.length) {
            updateError(state, "",`comentario-nao-finalizado`, i, i)
        }

        i++;

    } else if (firstChar === '/' && secondChar === '/') {
        while (i < input.length && !isNewLine(input[i])) i++;
        state = updateState(state, i)
    }

    return i;
}

function tokenize() {
    cleanOutput(['token-output', 'error-output'])
    const text = document.getElementById('code-input').value;
    lexicalAnalise(text);
}

function lexicalAnalise(input) {
    let state = {
        line: 1,
        offset: 0,
        error: {
            token: "",
            errorType: "",
            line: 0,
            initialCol: 0,
            finalCol: 0
        },
        errorFound: false,
    };

    let output = {
        token: "",
        tokenType: "",
        line: 0,
        initialCol: 0,
        finalCol: 0
    };
    
    for (let i = 0; i < input.length; i++) {
        state.errorFound = false
        let initialCol = updateCol(i, state.offset);
        let finalCol = initialCol;
        let token = '', tokenType = '';
        
        if (isSpace(input[i])) continue;
        
        if (isNewLine(input[i])) {
            state = updateState(state, i);
            continue;
        }

        if (isCommentOpener(input[i], input[i + 1])) {
            i = commentHandler(input, i, state);
            continue;
        }

        if (isDigit(input[i])) {
            let numberStart = i;
            tokenType = "nInt";

            while (i < input.length && isDigit(input[i])) i++;
            
            let numberEnd = i;

            i--;
        
            token = input.substring(numberStart, numberEnd);
            finalCol = updateCol(i, state.offset);

            if ((numberEnd - numberStart) > MAX_INT_LEN) {
                updateError(state, token, "numero-longo", initialCol, finalCol);
                token = input.substring(numberStart, numberStart + MAX_INT_LEN);
            }
        } else if (isLetter(input[i])) {
            let wordStart = i;

            while (i < input.length && isVocabulary(input[i])) i++;
            
            let wordEnd = i;

            i--;
            
            if (TOKEN_TYPES[token]) {
                tokenType = TOKEN_TYPES[token];
            } else {
                tokenType = isValidIdentifier(token);
            }
            
            token = input.substring(wordStart, wordEnd);
            finalCol = updateCol(i, state.offset);

            if ((wordEnd - wordStart) > MAX_LEN) {
                updateError(state, token, "identificador-longo", initialCol, finalCol);

                token = input.substring(wordStart, wordStart + MAX_LEN);
            }

        } else if (isTwoCharToken(input[i], input[i + 1])) {
            token = `${input[i]}${input[i + 1]}`;
            tokenType = TOKEN_TYPES[token];
            i++;
            finalCol = updateCol(i, state.offset);

        } else {
            token = input[i];
            tokenType = getTokenType(token);
            finalCol = updateCol(i, state.offset);

            if (!isVocabulary(token)) {
                updateError(state, token, "alfabeto-nao-identificado", initialCol, finalCol);
            }
        }

        if (state.errorFound) {
            tableError(state.error);
            continue;
        }

        output.token = token
        output.tokenType = tokenType
        output.line = state.line
        output.initialCol = initialCol
        output.finalCol = finalCol
        console.log(output)
        tableOutput(output)
    }
}