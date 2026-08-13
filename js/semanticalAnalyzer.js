class SemanticError extends Error {
    constructor(message, token = null) {
        const formattedMessage = token
            ? `[Linha ${token.line}, Coluna ${token.initialCol || token.column}] Erro Semântico: ${message}`
            : `Erro Semântico: ${message}`;
        super(formattedMessage);
        this.name = "SemanticError";
        this.token = token;
    }
}

class SemanticSymbolTable {
    constructor() {
        this.symbols = [];
        this.currentScope = 'global';
        this.currentLevel = 0;
    }

    insert(symbol) {
        const entry = {
            name: symbol.name,
            type: symbol.type || 'void',
            category: symbol.category || 'var',
            value: symbol.value !== undefined ? symbol.value : '-',
            isRef: symbol.isRef || false,
            used: symbol.used || false,
            level: this.currentLevel,
            scope: this.currentScope,
            params: symbol.params || []
        };
        this.symbols.push(entry);
        return entry;
    }

    lookup(name) {
        for (let i = this.symbols.length - 1; i >= 0; i--) {
            if (this.symbols[i].name === name) {
                return this.symbols[i];
            }
        }
        return null;
    }

    enterScope(scopeName) {
        this.currentLevel++;
        this.currentScope = scopeName || `procedimento_${this.currentLevel}`;
    }

    exitScope() {
        if (this.currentLevel > 0) {
            this.currentLevel--;
            this.currentScope = this.currentLevel === 0 ? 'global' : `procedimento_${this.currentLevel}`;
        }
    }

    getAllSymbols() {
        return this.symbols;
    }
}

class SemanticAnalyzer {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.symbolTable = new SemanticSymbolTable();
        this.warnings = [];
    }

    analyze() {
        this.programa();
        return {
            warnings: this.warnings,
            symbols: this.symbolTable.getAllSymbols()
        };
    }

    currentToken() {
        return this.tokens[this.index];
    }

    match(...types) {
        if (this.index >= this.tokens.length) return false;
        return types.includes(this.currentToken().tokenType || this.currentToken().type);
    }

    consume(expectedType) {
        const token = this.currentToken();
        const type = token ? (token.tokenType || token.type) : 'EOF';
        if (!token || type !== expectedType) {
            throw new SemanticError(`Esperado token do tipo '${expectedType}', mas encontrado '${type}'`, token);
        }
        this.index++;
        return token;
    }

    consumeTypeToken() {
        if (this.match('tipo-inteiro', 'tipo-boolean')) {
            const t = this.currentToken();
            this.index++;
            return t;
        }
        throw new SemanticError('Esperado tipo válido (int ou boolean)', this.currentToken());
    }

    tokenTypeToDataType(tokenType) {
        switch (tokenType) {
            case 'tipo-inteiro':
                return 'integer';
            case 'tipo-boolean':
                return 'boolean';
            default:
                throw new SemanticError(`Tipo de token desconhecido: ${tokenType}`, this.currentToken());
        }
    }

    areTypesCompatible(target, source) {
        if (target === source) return true;
        return false;
    }

    checkUnusedSymbols() {
        const symbols = this.symbolTable.getAllSymbols();
        if (Array.isArray(symbols)) {
            for (const symbol of symbols) {
                if (symbol.category === 'var' && !symbol.used) {
                    this.warnings.push(`Aviso: Identificador '${symbol.name}' declared mas não utilizado.`);
                }
            }
        }
    }

    programa() {
        this.consume('palavra-reservada-program');
        const idToken = this.consume('identificador-válido');

        this.symbolTable.insert({
            name: idToken.token || idToken.value,
            category: 'program',
            type: 'void',
            used: true
        });

        this.consume('ponto-vírgula');
        this.bloco();
        this.consume('ponto-final');
        
        this.checkUnusedSymbols();
    }

    bloco() {
        if (this.match('tipo-inteiro', 'tipo-boolean')) {
            this.secaoDeclaracaoVariaveis();
        }
        while (this.match('palavra-reservada-procedure')) {
            this.declaracaoProcedimento();
        }
        this.comandoComposto();
    }

    secaoDeclaracaoVariaveis() {
        while (this.match('tipo-inteiro', 'tipo-boolean')) {
            this.declaracaoVariaveis();
        }
    }

    declaracaoVariaveis() {
        const typeToken = this.consumeTypeToken();
        const dataType = this.tokenTypeToDataType(typeToken.tokenType || typeToken.type);
        const ids = [];

        do {
            const token = this.consume('identificador-válido');
            ids.push(token.token || token.value);
            if (this.match('vírgula')) {
                this.consume('vírgula');
            } else {
                break;
            }
        } while (true);

        this.consume('ponto-vírgula');

        for (const name of ids) {
            this.symbolTable.insert({
                name,
                category: 'var',
                type: dataType,
                used: false
            });
        }
    }

    declaracaoProcedimento() {
        this.consume('palavra-reservada-procedure');
        const idToken = this.consume('identificador-válido');
        let params = [];

        if (this.match('abre-parenteses')) {
            this.consume('abre-parenteses');
            if (!this.match('fecha-parenteses')) {
                params = this.secaoParametrosFormais();
            }
            this.consume('fecha-parenteses');
        }

        this.symbolTable.insert({
            name: idToken.token || idToken.value,
            category: 'procedure',
            type: 'void',
            used: true,
            params
        });

        this.consume('ponto-vírgula');
        this.symbolTable.enterScope();

        for (const p of params) {
            this.symbolTable.insert({
                name: p.name,
                category: 'var',
                type: p.type,
                used: false
            });
        }

        this.bloco();
        this.consume('ponto-vírgula');

        this.checkUnusedSymbols();
        this.symbolTable.exitScope();
    }

    secaoParametrosFormais() {
        const params = [];

        do {
            let isRef = false;
            if (this.match('palavra-reservada-var')) {
                this.consume('palavra-reservada-var');
                isRef = true;
            }

            const ids = [];
            do {
                const token = this.consume('identificador-válido');
                ids.push(token.token || token.value);
                if (this.match('vírgula')) {
                    this.consume('vírgula');
                } else {
                    break;
                }
            } while (true);

            this.consume('dois-pontos');
            const typeToken = this.consumeTypeToken();
            const dataType = this.tokenTypeToDataType(typeToken.tokenType || typeToken.type);

            for (const name of ids) {
                params.push({ name, type: dataType, isRef });
            }

            if (this.match('ponto-vírgula')) {
                this.consume('ponto-vírgula');
            } else {
                break;
            }
        } while (true);

        return params;
    }

    comandoComposto() {
        this.consume('palavra-reservada-begin');
        this.comandos();
        this.consume('palavra-reservada-end');
    }

    comandos() {
        this.comando();
        while (this.match('ponto-vírgula')) {
            this.consume('ponto-vírgula');
            if (this.match('palavra-reservada-end')) break;
            this.comando();
        }
    }

    comando() {
        if (this.match('identificador-válido')) {
            this.atribuicaoOuChamada();
        } else if (this.match('palavra-reservada-begin')) {
            this.comandoComposto();
        } else if (this.match('palavra-reservada-if')) {
            this.comandoCondicional();
        } else if (this.match('palavra-reservada-while')) {
            this.comandoRepeticao();
        } else if (this.match('palavra-reservada-read')) {
            this.comandoRead();
        } else if (this.match('palavra-reservada-write')) {
            this.comandoWrite();
        }
    }

    atribuicaoOuChamada() {
        const idToken = this.consume('identificador-válido');
        const name = idToken.token || idToken.value;
        const sym = this.symbolTable.lookup(name);

        if (!sym) {
            throw new SemanticError(`Identificador não declarado: '${name}'`, idToken);
        }

        if (sym.category === 'var') {
            sym.used = true;
            this.consume('atribuicao');
            const exprType = this.expressao();
            if (!this.areTypesCompatible(sym.type, exprType)) {
                throw new SemanticError(
                    `Incompatibilidade de tipos na atribuição para '${sym.name}': esperado '${sym.type}', recebido '${exprType}'`,
                    idToken
                );
            }
        } else if (sym.category === 'procedure') {
            const args = [];

            if (this.match('abre-parenteses')) {
                this.consume('abre-parenteses');
                if (!this.match('fecha-parenteses')) {
                    do {
                        const isVariable = this.match('identificador-válido');
                        const exprType = this.expressao();
                        args.push({ type: exprType, isVariable });

                        if (this.match('vírgula')) {
                            this.consume('vírgula');
                        } else {
                            break;
                        }
                    } while (true);
                }
                this.consume('fecha-parenteses');
            }

            const expectedParams = sym.params || [];

            if (args.length !== expectedParams.length) {
                throw new SemanticError(
                    `O procedimento '${sym.name}' espera ${expectedParams.length} argumento(s), mas recebeu ${args.length}`,
                    idToken
                );
            }

            for (let i = 0; i < args.length; i++) {
                const param = expectedParams[i];
                const arg = args[i];

                if (!this.areTypesCompatible(param.type, arg.type)) {
                    throw new SemanticError(
                        `Tipo incompatível no parâmetro ${i + 1} de '${sym.name}': esperado '${param.type}', recebido '${arg.type}'`,
                        idToken
                    );
                }

                if (param.isRef && !arg.isVariable) {
                    throw new SemanticError(
                        `O parâmetro ${i + 1} ('${param.name}') de '${sym.name}' é passado por referência ('var') e requer uma variável`,
                        idToken
                    );
                }
            }
        }
    }

    comandoCondicional() {
        this.consume('palavra-reservada-if');
        const exprType = this.expressao();
        if (exprType !== 'boolean') {
            throw new SemanticError(`A condição do 'if' deve ser do tipo boolean (recebido: '${exprType}')`);
        }
        this.consume('palavra-reservada-then');
        this.comando();
        if (this.match('palavra-reservada-else')) {
            this.consume('palavra-reservada-else');
            this.comando();
        }
    }

    comandoRepeticao() {
        this.consume('palavra-reservada-while');
        const exprType = this.expressao();
        if (exprType !== 'boolean') {
            throw new SemanticError(`A condição do 'while' deve ser do tipo boolean (recebido: '${exprType}')`);
        }
        this.consume('palavra-reservada-do');
        this.comando();
    }

    comandoRead() {
        this.consume('palavra-reservada-read');
        this.consume('abre-parenteses');
        do {
            const idToken = this.consume('identificador-válido');
            const name = idToken.token || idToken.value;
            const sym = this.symbolTable.lookup(name);

            if (!sym) {
                throw new SemanticError(`Variável não declarada no 'read': '${name}'`, idToken);
            }
            if (sym.category !== 'var') {
                throw new SemanticError(`Apenas variáveis podem ser passadas para 'read'`, idToken);
            }
            sym.used = true;

            if (this.match('vírgula')) {
                this.consume('vírgula');
            } else {
                break;
            }
        } while (true);
        this.consume('fecha-parenteses');
    }

    comandoWrite() {
        this.consume('palavra-reservada-write');
        this.consume('abre-parenteses');
        do {
            this.expressao();
            if (this.match('vírgula')) {
                this.consume('vírgula');
            } else {
                break;
            }
        } while (true);
        this.consume('fecha-parenteses');
    }

    expressao() {
        let leftType = this.expressaoSimples();

        if (this.match('operacao-maior', 'operacao-menor', 'operacao-igualdade', 'operacao-diferente', 'operacao-maior-igual', 'operacao-menor-igual')) {
            this.consume(this.currentToken().tokenType || this.currentToken().type);
            const rightType = this.expressaoSimples();

            const numeric = ['integer'];
            if (numeric.includes(leftType) && numeric.includes(rightType)) {
                return 'boolean';
            }
            if (leftType === rightType) {
                return 'boolean';
            }

            throw new SemanticError(`Incompatibilidade de tipos na comparação relacional ('${leftType}' vs '${rightType}')`);
        }

        return leftType;
    }

    expressaoSimples() {
    let hasUnary = false;

    // 1. Trata sinal unário (+ | -)
    if (this.match('operacao-adicao', 'operacao-subtracao', '+', '-')) {
        hasUnary = true;
        const unaryToken = this.currentToken();
        this.consume(unaryToken.tokenType || unaryToken.type);
    }

    // 2. Primeiro termo
    let leftType = this.termo();

    if (hasUnary && leftType === 'boolean') {
        throw new SemanticError(`Operador unário não pode ser aplicado a tipos booleanos`, this.currentToken());
    }

    // 3. Adicionado 'operacao-inclusiva' e 'palavra-reservada-or' na verificação
    while (this.match(
        'operacao-adicao', 'operacao-subtracao', 'operacao-or', 
        'operacao-inclusiva', 'palavra-reservada-or', '+', '-', 'or'
    )) {
        const token = this.currentToken();
        const opType = token.tokenType || token.type;
        const opVal = String(token.value || token.token || '').toLowerCase();
        
        this.consume(opType);

        const rightType = this.termo();

        // Checa se o operador atual é o 'or'
        if (opType === 'operacao-or' || opType === 'operacao-inclusiva' || opVal === 'or') {
            if (leftType !== 'boolean' || rightType !== 'boolean') {
                throw new SemanticError(`Operador 'or' exige operandos do tipo boolean`, token);
            }
            leftType = 'boolean';
        } else {
            if (leftType === 'boolean' || rightType === 'boolean') {
                throw new SemanticError(`Operação aditiva não é permitida com tipos booleanos`, token);
            }
            leftType = 'integer';
        }
    }

    return leftType;
}

    termo() {
    let leftType = this.fator();

    // Regra 19 da LALG: <termo> ::= <fator> {(* | div | and) <fator>}
    while (
        this.match('operacao-multiplicacao', 'operacao-divisao', 'operacao-conjuncao')
    ) {
        const token = this.currentToken();
        const opType = token.tokenType || token.type;
        const tokenValue = String(token.value || token.token || '').toLowerCase();
        
        this.consume(opType);

        const rightType = this.fator();

        // Trata o operador lógico 'and'
        if (opType === 'operacao-conjuncao' || tokenValue === 'and') {
            if (leftType !== 'boolean' || rightType !== 'boolean') {
                throw new SemanticError(`Operador 'and' exige operandos do tipo 'boolean'`, token);
            }
            leftType = 'boolean';
        } else {
            // Trata 'mult' e 'div'
            if (leftType === 'boolean' || rightType === 'boolean') {
                throw new SemanticError(`Operações de multiplicação/divisão não são permitidas com tipos booleanos`, token);
            }
            leftType = 'integer';
        }
    }

    return leftType;
    }

    fator() {
        if (this.match('palavra-reservada-not', 'not')) {
            const token = this.consume(this.currentToken().tokenType || this.currentToken().type);
            const subType = this.fator(); // Chamada recursiva para avaliar o fator negado

            if (subType !== 'boolean') {
                throw new SemanticError(`Operador 'not' só pode ser aplicado a expressões do tipo 'boolean'`, token);
            }

            return 'boolean';
        }

        if (this.match('identificador-válido')) {
            const token = this.consume('identificador-válido');
            const name = token.token || token.value;
            const sym = this.symbolTable.lookup(name);

            if (!sym) {
                throw new SemanticError(`Identificador não declarado: '${name}'`, token);
            }
            if (sym.category !== 'var') {
                throw new SemanticError(`O identificador '${name}' não é uma variável`, token);
            }
            sym.used = true;
            return sym.type;
        } 

        if (this.match('boolean', 'valor-true', 'valor-false')) {
            this.consume(this.currentToken().tokenType || this.currentToken().type);
            return 'boolean';
        }
        
        if (this.match('nInt', 'numero-inteiro')) {
            this.consume(this.currentToken().tokenType || this.currentToken().type);
            return 'integer';
        } 
        
        if (this.match('abre-parenteses')) {
            this.consume('abre-parenteses');
            const type = this.expressao();
            this.consume('fecha-parenteses');
            return type;
        }

        throw new SemanticError('Expressão inválida encontrada no fator', this.currentToken());
    }
}

function semanticalAnalysis(tokens) {
    try {
        const analyzer = new SemanticAnalyzer(tokens);
        const result = analyzer.analyze();
        
        return {
            errors: [],
            semanticErrors: [],
            warnings: result.warnings || [],
            symbols: result.symbols || []
        };
    } catch (error) {
        const errObj = {
            message: error.message,
            token: error.token ? (error.token.token || error.token.value || error.token.tokenType) : '',
            line: error.token ? error.token.line : 0,
            column: error.token ? (error.token.initialCol || error.token.column) : 0
        };

        return {
            errors: [errObj],
            semanticErrors: [errObj],
            warnings: [],
            symbols: []
        };
    }
}