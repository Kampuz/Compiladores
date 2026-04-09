function sintaticAnalysis(input, startIndex) {
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