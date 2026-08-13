class Parser {
    constructor(tokenList) {
        this.tokens = tokenList;
        this.pos = 0;
        this.stack = [];
        this.errors = [];
    }

    peek(offset = 0) {
        return this.tokens[this.pos + offset] ?? {
            tokenType: 'EOF',
            token: '',
            line: '?',
            initialCol: '?'
        };
    }

    eat(expectedType) {
        const tok = this.peek();

        console.log(`%cEAT`, "color: green", `expected: ${expectedType}, found: ${tok.tokenType}`, tok);

        if (tok.tokenType === expectedType) {
            this.logStackStep(`Match: ${tok.token}`);

            this.pos++;
            return tok;
        }

        this.reportError(expectedType, tok)

        const syncTokens = ['ponto-vírgula', 'palavra-reservada-end', 'palavra-reservada-begin', 'EOF'];

        if (!syncTokens.includes(tok.tokenType)) {
            while(this.peek().tokenType !== expectedType &&
                !syncTokens.includes(this.peek().tokenType) &&
                this.peek().tokenType !== 'EOF') {
                    this.pos++;
                }
            if (this.peek().tokenType === expectedType) {
                this.pos++;
            }
        }
    }

    reportError(expected, found) {
        const errorData = {
            expected,
            found: found.token,
            tokenType: found.tokenType,
            line: found.line,
            initialCol: found.initialCol
        };

        this.errors.push(errorData);

        if (typeof sintaticErrorTable === 'function') {
            sintaticErrorTable(errorData);
        }
    }

    enterRule(ruleName) {
        this.stack.push(ruleName);
        this.logStackStep(`Enter ${ruleName}`);
    }

    exitRule() {
        this.stack.pop();
    }

    logStackStep(action) {
        const tableBody = document.querySelector('#sintaticTable tbody');
        if (!tableBody) return;

        const currentToken = this.peek().token || 'EOF';

        const safeAction = action.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const stackString = this.stack.join(' | ').replace(/</g, '&lt;').replace(/>/g, '&gt;');;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><b>${safeAction}</b></td>
            <td><code>${currentToken}</code></td>
            <td>${stackString}</td>
            `;
        tableBody.appendChild(row);
    }

    parse() {
        try {
            this.programa();
            console.log("Análise sintática concluída com sucesso.");
            return true;
        } catch (error) {
            console.error(error.message);
            return false;
        }
    }

    programa() {
        this.enterRule('<programa>');
        this.eat('palavra-reservada-program');
        this.identificador();
        this.eat('ponto-vírgula');
        this.bloco();
        this.eat('ponto-final');
        this.exitRule();
    }

    bloco() {
        this.enterRule('<bloco>');
        const nextTokenType = this.peek().tokenType;

        if (isType(nextTokenType)) {
            this.parteDeclaracoesVariaveis();
        }

        if (nextTokenType === 'palavra-reservada-procedure') {
            this.parteDeclaracoesSubRotinas();
        }

        this.comandoComposto();
        this.exitRule();
    }

    parteDeclaracoesVariaveis() {
        this.enterRule('<parte de declarações de variáveis>');
        this.declaracoesVariaveis();

        while (this.peek().tokenType === 'ponto-vírgula' && isType(this.peek(1).tokenType)) {
            this.eat('ponto-vírgula');
            this.declaracoesVariaveis();
        }
        this.eat('ponto-vírgula');
        this.exitRule();
    }

    declaracoesVariaveis() {
        this.enterRule('<declaração de variáveis>');
        this.tipo();
        this.listaIdentificadores();
        this.exitRule();
    }

    tipo() {
        this.enterRule('<tipo>');
        const nextTokenType = this.peek().tokenType;
        if (isType(nextTokenType)) {
            this.eat(nextTokenType);
        } else {
            this.reportError('tipo', this.peek());
            this.pos++;
        }
        this.exitRule();
    }

    listaIdentificadores() {
        this.enterRule('<lista de identificadores>');
        this.identificador();
        while (this.peek().tokenType === 'vírgula') {
            this.eat('vírgula');
            this.identificador();
        }
        this.exitRule();
    }

    parteDeclaracoesSubRotinas() {
        this.enterRule('<parte de declarações de subrotinas>');
        while (this.peek().tokenType === 'palavra-reservada-procedure') {
            this.declaracaoProcedimento();
            this.eat('ponto-vírgula');
        }
        this.exitRule();
    }

    declaracaoProcedimento() {
        this.enterRule('<declaração de procedimento>');
        this.eat('palavra-reservada-procedure');
        this.identificador();
        if (this.peek().tokenType === 'abre-parenteses') {
            this.parametrosFormais();
        }
        this.eat('ponto-vírgula');
        this.bloco();
        this.exitRule();
    }

    parametrosFormais() {
        this.enterRule('<parâmetros formais>');
        this.eat('abre-parenteses');
        this.secaoParametrosFormais();
        while (this.peek().tokenType === 'ponto-vírgula') {
            this.eat('ponto-vírgula');
            this.secaoParametrosFormais();
        }
        this.eat('fecha-parenteses');
        this.exitRule();
    }

    secaoParametrosFormais() {
        this.enterRule('<seção de parâmetros formais>');
        if (this.peek().tokenType === 'palavra-reservada-var') {
            this.eat('palavra-reservada-var');
        }
        this.listaIdentificadores();
        this.eat('dois-pontos');
        this.identificador();
        this.exitRule();
    }

    comandoComposto() {
        this.enterRule('<comando composto>');
        this.eat('palavra-reservada-begin');
        this.comando();
        while (this.peek().tokenType === 'ponto-vírgula') {
            this.eat('ponto-vírgula');
            this.comando();
        }
        this.eat('palavra-reservada-end');
        this.exitRule();
    }

    comando() {
        this.enterRule('<comando>');
        const nextTokenType = this.peek().tokenType;
        if (nextTokenType === 'identificador-válido' || isPredeclared(nextTokenType)) this.atribuicaoOuChamada();
        else if (nextTokenType === 'palavra-reservada-begin') this.comandoComposto();
        else if (nextTokenType === 'palavra-reservada-if') this.comandoCondicional1();
        else if (nextTokenType === 'palavra-reservada-while') this.comandoRepetitivo1();
        else {
            this.reportError('comando', this.peek())
            this.pos++
        }
        this.exitRule();
    }

    atribuicaoOuChamada() {
        this.enterRule('<atribuição ou chamada>');
        this.variavel();
        const nextTokenType = this.peek().tokenType;
        
        if (nextTokenType === 'atribuicao') {
            this.eat('atribuicao');
            this.expressao();
        } else if (nextTokenType === 'abre-parenteses') {
            this.eat('abre-parenteses');
            if (this.peek().tokenType !== 'fecha-parenteses') {
                this.listaExpressoes();
            }
            this.eat('fecha-parenteses');
        }
        this.exitRule();
    }

    chamadaProcedimento() {
        this.enterRule('<chamada de procedimento>');
        this.identificador();
        if (this.peek().tokenType === 'abre-parenteses') {
            this.eat('abre-parenteses');
            if (this.peek().tokenType !== 'fecha-parenteses') {
                this.listaExpressoes();
            }
            this.eat('fecha-parenteses');
        }
        this.exitRule();
    }

    comandoCondicional1() {
        this.enterRule('<comando condicional 1>');
        this.eat('palavra-reservada-if');
        this.expressao();
        this.eat('palavra-reservada-then');
        this.comando();
        if (this.peek().tokenType === 'palavra-reservada-else') {
            this.eat('palavra-reservada-else');
            this.comando();
        }
        this.exitRule();
    }

    comandoRepetitivo1() {
        this.enterRule('<comando repetitivo 1>');
        this.eat('palavra-reservada-while');
        this.expressao();
        this.eat('palavra-reservada-do');
        this.comando();
        this.exitRule();
    }

    expressao() {
        this.enterRule('<expressão>');
        this.expressaoSimples();
        const type = this.peek();
        
        if (typeof isRelacao === 'function' && isRelacao(type)) {
            this.eat(type.tokenType);
            this.expressaoSimples();
        }
        this.exitRule();
    }

    relacao() {
        this.enterRule('<relação>');
        if (typeof operacaoRelacional === 'function') {
            this.eat(operacaoRelacional());
        }
        this.exitRule();
    }

    expressaoSimples() {
        this.enterRule('<expressão simples>');
        let currentToken = this.peek();
        if (isSimpleOperator(currentToken)) {
            this.eat(currentToken.tokenType);
        }

        this.termo();
        currentToken = this.peek()
        while (isSimpleOperator(currentToken) || currentToken.tokenType === 'operacao-inclusiva') {
            this.eat(currentToken.tokenType);  
            this.termo();
            currentToken = this.peek();
        }
        this.exitRule();
    }

    termo() {
        this.enterRule('<termo>');
        this.fator();
        let nextTokenType = this.peek().tokenType;
        while (nextTokenType === 'operacao-multiplicacao' || nextTokenType === 'operacao-divisao' || nextTokenType === 'operacao-conjuncao') {
            this.eat(nextTokenType);
            this.fator();
            nextTokenType = this.peek().tokenType;
        }
        this.exitRule();
    }

    fator() {
        this.enterRule('<fator>');
        const nextTokenType = this.peek().tokenType;

        if (nextTokenType === 'identificador-válido') {
            this.variavel();
        } else if (nextTokenType === 'nInt' || nextTokenType === 'valor-true' || nextTokenType === 'valor-false') {
            this.eat(nextTokenType);
        } else if (nextTokenType === 'abre-parenteses') {
            this.eat('abre-parenteses');
            this.expressao();
            this.eat('fecha-parenteses');
        } else if (nextTokenType === 'operacao-negacao') {
            this.eat('operacao-negacao');
            this.fator();
        } else {
            this.reportError('fator', this.peek());
            this.pos++;
        }
        this.exitRule();
    }

    variavel() {    
        this.enterRule('<variável>');
        this.identificador();
        if (this.peek().tokenType === 'abre-colchetes') {
            this.eat('abre-colchetes');
            this.expressao();
            this.eat('fecha-colchetes');
        }
        this.exitRule();
    }

    listaExpressoes() {
        this.enterRule('<lista de expressões>');
        this.expressao();
        while (this.peek().tokenType === 'vírgula') {   
            this.eat('vírgula');
            this.expressao();
        }
        this.exitRule();
    }

    numero() {
        this.enterRule('<numero>');
        this.eat('nInt');
        this.exitRule();
    }

    digito() {
        this.enterRule('<digito>');
        this.eat('digito');
        this.exitRule();
    }

    identificador() {
        this.enterRule('<identificador>');
        const type = this.peek().tokenType;
        if (type === 'identificador-válido' || (typeof isPredeclared === 'function' && isPredeclared(type))) {
            this.eat(type);
        } else {
            this.reportError('identificador', this.peek());
            this.pos++;
        }
        this.exitRule();
    }

}

function sintaticErrorTable(error) {
    const tableBody = document.querySelector('#sintaticErrorTable tbody');
    if (!tableBody) return

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${error.expected}</td>
        <td>${error.found}</td>
        <td>${error.tokenType}</td>
        <td>${error.line}</td>
        <td>${error.initialCol}</td>
    `;
    tableBody.appendChild(row);
}

// Wrapper to match your original function signature
function syntaticalAnalysis(tokenList) {
    const parser = new Parser(tokenList);
    const success = parser.parse();
    return { success, errors: parser.errors, errorsFound: parser.errors.length };
}