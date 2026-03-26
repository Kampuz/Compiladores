
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

function isTwoCharToken(firstChar, secondChar) {
    return ((firstChar === ':' && secondChar === '=') ||
            (firstChar === '<' && (secondChar === '>' || secondChar === '=')) ||
            (firstChar === '>' && secondChar === '='))
}

function isValidIdentifier(token) {
    console.log(token)
    if (!isLetter(token[0])){
        return "identificador-inválido";
    }
    
    for (let i = 1; i < token.length; i++) {
        if (!isLetter(token[i]) && !isDigit(token[i])) return "identificador-inválido"
    }
    
    return "identificador-válido"
}