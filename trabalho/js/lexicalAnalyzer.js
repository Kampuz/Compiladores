import {TOKEN_TYPES, MAX_LEN, MAX_INT_LEN} from './tokens'

function updateError(state, token, errorType, initialCol, finalCol) {
    state.error.token = token;
    state.error.errorType = errorType;
    state.error.line = state.line;
    state.error.initialCol = initialCol;
    state.error.finalCol = finalCol;
    state.errorFound = true;

    console.log(state.error)
    tableError(state.error)
}

function updateOutput(output, token, tokenType, line, initialCol, finalCol) {
    output.token = token;
    output.tokenType = tokenType;
    output.line = line;
    output.initialCol = initialCol;
    output.finalCol = finalCol;

    console.log(output)
    tableOutput(output)
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

        if (i === input.length) updateError(state, "",`comentario-nao-finalizado`, i, i);

        i++;

    } else if (firstChar === '/' && secondChar === '/') {
        while (i < input.length && !isNewLine(input[i])) i++;
        state = updateLine(state, i);
    }
    return i;
}

function numberHandler(input, startIndex, state) {
    let i = startIndex;

    while (i < input.length && isDigit(input[i])) i++;

    let token = input.substring(startIndex, i);

    if (token.length > MAX_INT_LEN) {
        updateError(state, token, "numero-longo", startIndex + 1, i);
        token = token.substring(0, MAX_INT_LEN);
    }

    return { token, finalIndex: i - 1 };
}

function wordHandler(input, startIndex) {
    let i = startIndex
    while (i < input.length && isVocabulary(input[i])) i++;

    const token = input.substring(startIndex, i);

    let tokenType = TOKEN_TYPES[token] ?? isValidIdentifier(token);

    if (token.length > MAX_LEN) {
        updateError(state, token, "identificador-longo", startIndex + 1, i);
        token = token.substring(0, MAX_INT_LEN);
    }

    return { token, finalIndex: i - 1, tokenType };
}

function lexicalAnalysis(input) {
    let state = {
        line: 1,
        offset: 0,
        error: {},
        errorFound: false
    };

    let output = {};

    for (let i = 0; i < input.length; i++) {

        const initialCol = updateCol(i, state.offset);
        let finalCol = initialCol;
        const char = input[i]
        
        if (isSpace(char)) continue;
        if (isNewLine(char)) {
            state = updateLine(state, i);
            continue;
        }

        if (isCommentOpener(char, input[i + 1])) {
            i = commentHandler(input, i, state);
            if (state.errorFound) tableError(state.error);
            continue;
        }
        
        if (isDigit(char)) {
            const { token, finalIndex } = numberHandler(input, i, state);
            finalCol = updateCol(finalIndex, state.offset);
            i = finalIndex;
            updateOutput(output, token, "nInt", state.line, initialCol, finalCol);
            continue;
        }
        
        if (isLetter(char)) {
            const {token, finalIndex, tokenType} = wordHandler(input, i);
            finalCol = updateCol(finalIndex, state.offset);
            i = finalIndex;
            updateOutput(output, token, tokenType, state.line, initialCol, finalCol);
            continue;
        }
        
        if (isTwoCharToken(char, input[i + 1])) {
            const token = char + input[i + 1];
            const tokenType = getTokenType(token);
            i++;
            finalCol = updateCol(i, state.offset)
            updateOutput(output, token, tokenType, state.line, initialCol, finalCol);
            continue;
        }
        const token = char;
        const tokenType = getTokenType(token);
        finalCol = updateCol(i, state.offset);

        if (tokenType === 'inválido') updateError(state, token, "alfabeto-nao-identificado", initialCol, finalCol);
        else updateOutput(output, token, tokenType, state.line, initialCol, finalCol);
    }
}
