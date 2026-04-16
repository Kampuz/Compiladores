function isNewLine(char) {
    return (char === '\n')
}

function isSpace(char) {
    return (char === ' ' || char === '\t')
}

function isDigit(number) {
    return ((number >= '0') && (number <= '9'));
}

function isLetter(char) {
    return (((char >= 'a') && (char <= 'z')) || ((char >= 'A') && (char <= 'Z')) || (char === '_'));
}
function isVocabulary(symbol) {
    return (isDigit(symbol) || isLetter(symbol));
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

function isRelacao(token) {
    return ['operacao-igual', 'operacao-diferente', 'operacao-maior', 'operacao-maior-igual', 'operacao-menor', 'operacao-menor-igual'].includes(token.tokenType);
}

function isSimpleOperator(token) {
    return ['operacao-adicao', 'operacao-subtracao', 'operacao-or'].includes(token.tokenType);
}

function isPredeclared(tokenType) {
    return ['palavra-reservada-read', 'palavra-reservada-write', 'tipo-inteiro', 'tipo-boolean', 'valor-true', 'valor-false'].includes(tokenType);
}