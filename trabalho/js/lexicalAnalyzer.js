const TOKEN_TYPES = {
    'program': 'palavra-reservada-program',
    'procedure': 'palavra-reservada-procedure',
    'var': 'palavra-reservada-var',
    'begin': 'palavra-reservada-begin',
    'end': 'palavra-reservada-end',
    'if': 'palavra-reservada-if',
    'then': 'palavra-reservada-then',
    'else': 'palavra-reservada-else',
    'while': 'palavra-reservada-while',
    'do': 'palavra-reservada-do',
    '<>': 'operacao-diferente',
    '<': 'operacao-menor',
    '<=': 'operacao-menor-igual',
    '>=': 'operacao-maior-igual',
    '>': 'operacao-maior',
    '+': 'operacao-soma',
    '-': 'operacao-subtracao',
    'or': 'operacao-inclusiva',
    '*': 'operacao-multiplicacao',
    'div': 'operacao-divisao',
    'and': 'operacao-conjuncao',
    'not': 'operacao-negacao',
    'int': 'tipo-inteiro',
    'boolean': 'tipo-boolean',
    ',': 'vírgula',
    ';': 'ponto-vírgula',
    ':': 'dois-pontos',
    '.': 'ponto-final',
    '(': 'abre-parenteses',
    ')': 'fecha-parenteses',
    ':=': 'atribucao',
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

function updateOutput(output, token, tokenType, line, initialCol, finalCol) {
    output.token = token;
    output.tokenType = tokenType;
    output.line = line;
    output.initialCol = initialCol;
    output.finalCol = finalCol;
}

function updateLine(state, i) {
    state.line++;
    state.offset = i + 1;

    return state;
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
            if (isNewLine(input[i])) state = updateLine(state, i);
            
            i++;
        }

        if (i === input.length) {
            updateError(state, "",`comentario-nao-finalizado`, i, i);
        }

        i++;

    } else if (firstChar === '/' && secondChar === '/') {
        while (i < input.length && !isNewLine(input[i])) i++;
        state = updateLine(state, i);
    }

    return i;
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
        errorFound: false
    };

    let output = {
        token: "",
        tokenType: "",
        line: 0,
        initialCol: 0,
        finalCol: 0
    };
    for (let i = 0; i < input.length; i++) {

        let initialCol = updateCol(i, state.offset);

        let finalCol = initialCol;

        let token = '', tokenType = '';
        
        if (isSpace(input[i])) continue;
        
        if (isNewLine(input[i])) {
            state = updateLine(state, i);
            continue;
        }

        if (isCommentOpener(input[i], input[i + 1])) {
            i = commentHandler(input, i, state);

            if (state.errorFound) {
                tableError(state.error)
            }

            continue

        } else if (isDigit(input[i])) {
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
            
            token = input.substring(wordStart, wordEnd);
            finalCol = updateCol(i, state.offset);
            
            if (TOKEN_TYPES[token]) {
                tokenType = TOKEN_TYPES[token];
            } else {
                tokenType = isValidIdentifier(token);
            }

            getTokenType(token)
            
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
            console.log(state.error)
            tableError(state.error);
            continue;
        }
        updateOutput(output, token, tokenType, state.line, initialCol, finalCol)
        console.log(output)
        tableOutput(output)
    }
}