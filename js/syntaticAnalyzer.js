class Parser {
    constructor(tokenList) {
        this.tokens = tokenList;
        this.pos = 0;
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
            this.pos++;
            return tok;
        }

        this.reportError(expectedType, tok)
    }

    reportError(expected, found) {
        const errorData = {
            expected,
            found: found.token,
            tokenType: found.tokenType,
            line: found.line,
            initialCol: found.initialCol
        };

        if (typeof sintaticalErrorTable === 'function') {
            sintaticalErrorTable(errorData);
        }
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
        this.eat('palavra-reservada-programa');
        this.identificador();
        this.eat('ponto-vírgula');
        this.bloco();
        this.eat('ponto-final');
    }

    bloco() {
        const type = this.peek().tokenType;

        if (type === 'tipo-inteiro' || type === 'tipo-boolean') {
            this.parteDeclaracoesVariaveis();
        }

        if (type.peek().tokenType === 'palavra-reservada-procedure') {
            this.parteDeclaracoesSubRotinas();
        }

        this.comandoComposto();
    }

    parteDeclaracoesVariaveis() {
        this.parteDeclaracoesVariaveis();

        while (this.peek().tokenType === 'ponto-vírgula' &&
                (this.peek(1).tokenType === 'tipo-inteiro' || this.peek(1).tokenType === 'tipo-boolean')) {
            this.eat('ponto-vírgula');
            this.declaracoesVariaveis();
        }
    }

    declaracoesVariaveis() {
        this.tipo();
        this.listaIdentificadores();
    }

    tipo() {
        const type = this.peek().tokenType;
        if (type === 'tipo-inteiro' || type === 'tipo-boolean') {
            this.eat(type);
        } else {
            this.reportError('tipo', this.peek());
        }
    }

    listaIdentificadores() {
        this.identificador();
        while (this.peek().tokenType === 'vírgula') {
            this.eat('vírgula');
            this.identificador();
        }
    }

    parteDeclaracoesSubRotinas() {
        while (this.peek().tokenType === 'palavra-reservada-procedure') {
            this.declaracaoProcedimento();
            this.eat('ponto-vírgula');
        }
    }

    declaracaoProcedimento() {
        this.eat('palavra-reservada-procedure');
        this.identificador();
        if (this.peek().tokenType === 'abre-parenteses') {
            this.parametrosFormais();
        }
        this.eat('ponto-vírgula');
        this.bloco();
    }

    parametrosFormais() {
        this.eat('abre-parenteses');
        this.secaoParametrosFormais();
        while (this.peek().tokenType === 'ponto-vírgula') {
            this.eat('ponto-vírgula');
            this.secaoParametrosFormais();
        }
        this.eat('fecha-parenteses');
    }

    secaoParametrosFormais() {
        if (this.peek().tokenType === 'palavra-reservada-var') {
            this.eat('palavra-reservada-var');
        }
        this.listaIdentificadores();
        this.eat('dois-pontos');
        this.identificador();
    }

    comandoComposto() {
        this.eat('palavra-reservada-begin');
        this.comando();
        while (this.peek().tokenType === 'ponto-vírgula') {
            this.eat('ponto-vírgula');
            this.comando();
        }
        this.eat('palavra-reservada-end');
    }

    comando() {
        const type = this.peek().tokenType;
        if (type === 'identificador-válido') this.atribuicaoOuChamada();
        else if (type === 'palavra-reservada-begin') this.comandoComposto();
        else if (type === 'palavra-reservada-if') this.comandoCondicional1();
        else if (type === 'palavra-reservada-while') this.comandoRepetitivo1();
        else this.reportError('comando', this.peek());
    }

    atribuicaoOuChamada() {
        this.variavel();
        const type = this.peek().tokenType;
        
        if (type === 'atribuicao') {
            this.eat('atribuicao');
            this.expressao();
        } else if (type === 'abre-parenteses') {
            this.eat('abre-parenteses');
            if (this.peek().tokenType !== 'fecha-parenteses') {
                this.listaExpressoes();
            }
            this.eat('fecha-parenteses');
        }
    }

    chamadaProcedimento() {
        this.identificador();
        if (this.peek().tokenType === 'abre-parenteses') {
            this.eat('abre-parenteses');
            if (this.peek().tokenType !== 'fecha-parenteses') {
                this.listaExpressoes();
            }
            this.eat('fecha-parenteses');
        }
    }

    comandoCondicional1() {
        this.eat('palavra-reservada-if');
        this.expressao();
        this.eat('palavra-reservada-then');
        this.comando();
        if (this.peek().tokenType === 'palavra-reservada-else') {
            this.eat('palavra-reservada-else');
            this.comando();
        }
    }

    comandoRepetitivo1() {
        this.eat('palavra-reservada-while');
        this.expressao();
        this.eat('palavra-reservada-do');
        this.comando();
    }

    expressao() {
        this.expressaoSimples();
        const type = this.peek();
        
        if (typeof isRelacao === 'function' && isRelacao(type)) {
            this.eat(type.tokenType);
            this.expressaoSimples();
        }
    }

    relacao() {
        if (typeof operacaoRelacional === 'function') {
            this.eat(operacaoRelacional());
        }
    }

    expressaoSimples() {
        let type = this.peek();
        if (typeof isSimpleOperator === 'function' && isSimpleOperator(type)) {
            this.eat(type.tokenType);
        }

        this.termo();

        while (typeof isSimpleOperator === 'function' && isSimpleOperator(this.peek())) {
            this.eat(this.peek().tokenType);  
            this.termo();
        }
    }

    termo() {
        this.fator();
        let type = this.peek().tokenType;
        while (type === 'operacao-multiplicacao' || type === 'operacao-divisao' || type === 'operacao-and') {
            this.eat(type);
            this.fator();
            type = this.peek().tokenType;
        }
    }

    fator() {
        const type = this.peek().tokenType;
        if (type === 'identificador-válido') {
            this.variavel();
        } else if (type === 'nint' || type === 'valor-true' || type === 'valor-false') {
            this.eat(type);
        } else if (type === 'abre-parenteses') {
            this.eat('abre-parenteses');
            this.expressao();
            this.eat('fecha-parenteses');
        } else if (type === 'palavra-reservada-negacao') {
            this.eat('palavra-reservada-negacao');
            this.fator();
        } else {
            this.reportError('fator', this.peek());
        }
    }

    variavel() {    
        this.identificador();
        if (this.peek().tokenType === 'abre-colchetes') {
            this.eat('abre-colchetes');
            this.expressao();
            this.eat('fecha-colchetes');
        }
    }

    listaExpressoes() {
        this.expressao();
        while (this.peek().tokenType === 'vírgula') {   
            this.eat('vírgula');
            this.expressao();
        }
    }

    digito() {
        this.eat('digito');
    }

    identificador() {
        const type = this.peek().tokenType;
        if (type === 'identificador-válido' || (typeof isPredeclared === 'function' && isPredeclared(type))) {
            this.eat(type);
        } else {
            this.reportError('identificador', this.peek());
        }
    }

    numero() {
        this.eat('nint');
    }
}

function sintaticalErrorTable(error) {
    const tableBody = document.querySelector('#sintaticalErrorTable tbody');
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
    parser.parse();
}