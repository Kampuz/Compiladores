const { isValidElement } = require("react");

class Lexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.line = 1;
        this.lineStart = 0;
        this.tokens = [];
        this.errors = [];
    }

    get currentCol() {
        return this.pos - this.lineStart + 1;
    }

    isAtEnd() {
        return this.pos >= this.input.length;
    }

    peek(offset = 0) {
        if (this.pos + offset >= this.input.length) return '\0';
        return this.input[this.pos + offset];
    }

    advance() {
        const char = this.input[this.pos++];

        if (typeof isNewLine === 'function' && isNewLine(char)) {
            this.line++;
            this.lineStart = this.pos;
        }
        return char;
    }

    reportError(token, errorType, initialCol, finalCol) {
        const error = { token, errorType, line: this.line, initialCol, finalCol }
        this.errors.push(error);

        console.error(error);
        if (typeof tableError === 'function') tableError(error);
    }

    addToken(token, tokenType, initialCol, finalCol) {
        const output = { token, tokenType, line: this.line, initialCol, finalCol }
        this.tokens.push(output);

        console.error(output);
        if (typeof tableOutput === 'function') tableOutput(error);
    }

    lex() {
        while (!this.isAtEnd()) {
            const initialCol = this.currentCol;
            const char = this.advance();

            if (isSpace(char) || isNewLine(char)) continue;

            if (char === '{') {
                this.handleBlockComment(initialCol);
                continue;
            }

            if (char === '/' && this.peek() === '/') {
                this.handleLineComment(char, initialCol);
                continue;
            }

            if (isDigit(char)) {
                this.handleNumber(char, initialCol);
                continue;
            }

            if (isLetter(char)) {
                this.handleWord(char, initialCol);
                continue;
            }

            if (isTwoCharToken(char, this.peek())) {
                const token = char + this.advance();
                this.addToken(token, getTokenType(token), initialCol, this.currentCol - 1);
                continue;
            }

            const tokenType = getTokenType(char);
            if (tokenType === 'inválido') {
                this.reportError(char, "alfabeto-nao-identificado", initialCol, initialCol);
            } else {
                this.addToken(char, tokenType, initialCol, initialCol);
            }
        }
        
        return { tokenList: this.tokens, erros: this.errors, errorsFound: this.errors.length};
    }

    handleBlockComment(initialCol) {
        while (!this.isAtEnd() && this.peek() != '}') {
            this.advance();
        }

        if (this.isAtEnd()) {
            this.reportError("", "comentario-nao-finalizado", initialCol, initialCol);
        } else {
            this.advance();
        }
    }

    handleLineComment() {
        while (!this.isAtEnd() && !isNewLine(this.peek())) {
            token += this.advance();
        }
    }

    handleNumber(firstChar, initialCol) {
        let token = firstChar;

        while (!this.isAtEnd() && isDigit(this.peek())) {
            token += this.advance();
        }

        let finalCol = this.currentCol - 1;

        if (token.length > MAX_INT_LEN) {
            this.reportError(token, "numero-longo", initialCol, finalCol);
            token = token.substring(0, MAX_INT_LEN);
            finalCol = initialCol + MAX_INT_LEN - 1;
        }

        this.addToken(token, "nInt", initialCol, finalCols);
    }

    handleWord(firstChar, initialCol) {
        let token = firstChar;

        while (!this.isAtEnd() && isVocabulary(this.peek())) {
            token += this.advance();
        }

        let finalCol = this.currentCol - 1;

        if (token.length > MAX_LEN) {
            this.reportError(token, "identificador-longo", initialCol, finalCol);
            token = token.substring(0, MAX_LEN);
            finalCol = initialCol + MAX_LEN - 1;
        }

        const tokenType = TOKEN_TYPES[token] ?? isValidIdentifier(token);
        this.addToken(token, tokenType, initialCol, finalCols);
    }
}

function lexicalAnalysis(input) {
    const lexer = new Lexer(input);
    return lexer.lex();
}