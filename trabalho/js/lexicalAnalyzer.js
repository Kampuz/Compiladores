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
        const commentOppened = i;
        while (i < input.length && input[i] !== '}') {
            
            if (isNewLine(input[i])) state = updateLine(state, i);
            i++;
        }

        if (i === input.length){
            updateError(state, "",`comentario-nao-finalizado`, commentOppened, commentOppened);
        }

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

    let finalIndex = i - 1;

    if (token.length > MAX_INT_LEN) {
        updateError(state, token, "numero-longo", updateCol(startIndex, state.offset), updateCol(i - 1, state.offset));
        token = token.substring(0, MAX_INT_LEN);
        finalIndex = startIndex  + MAX_INT_LEN;
    }

    return { token, finalIndex, tokenType: "nint" , i: i - 1};
}

function wordHandler(input, startIndex, state) {
    let i = startIndex;

    while (i < input.length && isVocabulary(input[i])) i++;

    let token = input.substring(startIndex, i);

    let tokenType = TOKEN_TYPES[token] ?? isValidIdentifier(token);
    
    let finalIndex = i - 1

    if (token.length > MAX_LEN) {
        updateError(state, token, "identificador-longo", updateCol(startIndex, state.offset), updateCol(i - 1, state.offset));
        token = token.substring(0, MAX_LEN);
        finalIndex = startIndex + MAX_LEN;
    }

    return { token, finalIndex: finalIndex, tokenType, i: i - 1 };
}

function tokenHandler(input, startIndex, state, handler, output) {
    const { token, finalIndex, tokenType, i } = handler(input, startIndex, state);
    const initialCol = updateCol(startIndex, state.offset);
    const finalCol = updateCol(finalIndex, state.offset);
    updateOutput(output, token, tokenType, state.line, initialCol, finalCol);
    return i;
}

function twoCharHandler(token, i, state, initialCol, finalCol, output) {
    const tokenType = getTokenType(token);
    i++;
    finalCol = updateCol(i, state.offset)
    updateOutput(output, token, tokenType, state.line, initialCol, finalCol);
    return i;
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
            continue;
        }
        
        if (isDigit(char)) {
            i = tokenHandler(input, i, state, numberHandler, output);
            continue;
        }
        
        if (isLetter(char)) {
            i = tokenHandler(input, i, state, wordHandler, output);
            continue;
        }
        
        if (isTwoCharToken(char, input[i + 1])) {
            let token = input[i] + input[i + 1];
            i = twoCharHandler(token, i, state, initialCol,finalCol, output);
            continue;
        }

        let token = char;
        let tokenType = getTokenType(token);
        finalCol = updateCol(i, state.offset);

        if (tokenType === 'inválido') updateError(state, token, "alfabeto-nao-identificado", initialCol, finalCol);
        else updateOutput(output, token, tokenType, state.line, initialCol, finalCol);
    }
}
