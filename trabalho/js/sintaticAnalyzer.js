let tokens = [];
let pos = 0;

function current(offset = 0) {
    return tokens[pos + offset] ?? { tokenType: 'EOF', token: '', line: '?', initialCol: '?' };
}

function eat(expectedType) {
    const tok = current();

    console.log(`%cEAT`, "color: green;", `expected: ${expectedType}, found: ${tok.tokenType}`, tok);

    if (tok.tokenType === expectedType) {
        pos++;
        return tok;
    }

    sintaticalError(expectedType, tok);
}

function sintaticalError(expected, found) {
    sintaticalErrorTable({
        expected,
        found: found.token,
        tokenType: found.tokenType,
        line: found.line,
        initialCol: found.initialCol
    });

    throw new Error(`Sintatical error: Expected '${expected}', but found '${found.token}'`);
}

function sintaticalErrorTable(error) {
    const tableBody = document.querySelector('#sintaticalErrorTable tbody');
    const row = document.createElement('tr');
    
    row.innerHTML = `<td>${error.expected}</td>
                    <td>${error.found}</td>
                    <td>${error.tokenType}</td>
                    <td>${error.line}</td>
                    <td>${error.initialCol}</td>
                    `;
    tableBody.appendChild(row);
}

function sintaticalAnalysis(tokenList) {
    tokens = tokenList;
    pos = 0;

    try {
        programa();
        console.log("Análise sintática concluída com sucesso.");
    } catch (error) {
        console.error("Sintatical error:", error.message);
    }
}




function programa() {
    eat('palavra-reservada-program');
    identificador();
    eat('ponto-vírgula');
    bloco();
    eat('ponto-final');
}

function bloco() {
    if (current().tokenType === 'tipo-inteiro' || current().tokenType === 'tipo-boolean') {
        parteDeclaracoesVariaveis();
    }

    if (current().tokenType === 'palavra-reservada-procedure') {
        parteDeclaracoesSubRotinas();
    }

    comandoComposto();
}

function parteDeclaracoesVariaveis() {
    declaracoesVariaveis();
    while (current().tokenType === 'ponto-vírgula' && (current(1).tokenType === 'tipo-inteiro' || current(1).tokenType === 'tipo-boolean')) {
        eat('ponto-vírgula');
        declaracoesVariaveis();
    }
    eat('ponto-vírgula');
}

function declaracoesVariaveis() {
    tipo();
    listaIdentificadores();
}

function tipo() {
    const t = current().tokenType;
    if (t === 'tipo-inteiro' || t === 'tipo-boolean') eat(t)
    else sintaticalError('tipo', current());
}

function listaIdentificadores() {
    identificador();
    while (current().tokenType === 'vírgula') {
        eat('vírgula');
        identificador();
    }
}

function parteDeclaracoesSubRotinas() {
    while (current().tokenType === 'palavra-reservada-procedure') {
        declaracaoProcedimento();
        eat('ponto-vírgula');
    }
}

function declaracaoProcedimento() {
    eat('palavra-reservada-procedure');
    identificador()
    if (current().tokenType === 'abre-parenteses') {
        parametrosFormais();
    }
    eat('ponto-vírgula');
    bloco();
}

function parametrosFormais() {
    eat('abre-parenteses');
    secaoParametrosFormais();
    while (current().tokenType === 'ponto-vírgula') {
        eat('ponto-vírgula');
        secaoParametrosFormais();
    }
    eat('fecha-parenteses');
}

function secaoParametrosFormais() {
    if (current().tokenType === 'palavra-reservada-var') {
        eat('palavra-reservada-var');
    }
    listaIdentificadores();
    eat('dois-pontos');
    identificador();
}


function comandoComposto() {
    eat('palavra-reservada-begin');
    comando();
    while (current().tokenType === 'ponto-vírgula') {
        eat('ponto-vírgula');
        comando();
    }
    eat('palavra-reservada-end');
}

function comando() {
    const t = current().tokenType;
    if (t === 'identificador-válido') atribuicaoOuChamada();
    else if (current().tokenType === 'palavra-reservada-begin')comandoComposto();
    else if (current().tokenType === 'palavra-reservada-if') comandoCondicional1();
    else if (current().tokenType === 'palavra-reservada-while') comandoRepetitivo1();
    else sintaticalError('comando', current());
}

function atribuicaoOuChamada() {
    variavel();
    if (current().tokenType === 'atribuicao') {
        eat('atribuicao');
        expressao();
    } else if (current().tokenType === 'abre-parenteses') {
        eat('abre-parenteses');
        if (current().tokenType !== 'fecha-parenteses') {
            listaExpressoes();
        }
        eat('fecha-parenteses');
    }
}

function chamadaProcedimento() {
    identificador();
    if (current().tokenType === 'abre-parênteses') {
        eat('abre-parênteses');
        if (current().tokenType !== 'fecha-parênteses') {
            listaExpressoes();
        }
        eat('fecha-parênteses');
    }
}

function comandoCondicional1() {
    eat('palavra-reservada-if');
    expressao();
    eat('palavra-reservada-then');
    comando();
    if (current().tokenType === 'palavra-reservada-else') {
        eat('palavra-reservada-else');
        comando();
    }
}

function comandoRepetitivo1() {
    eat('palavra-reservada-while');
    expressao();
    eat('palavra-reservada-do');
    comando();
}

function expressao() {
    expressaoSimples()
    t = current()
    if (isRelacao(t)) {
        eat(t.tokenType);
        expressaoSimples();
    }
}

function relacao() {
    eat(operacaoRelacional());
}

function expressaoSimples() {
    const t = current();
    if (isSimpleOperator(t)) eat(t.tokenType); 

    termo();

    while (isSimpleOperator(current())) {
        eat(current().tokenType);  
        termo();
    }
}

function termo() {
    fator();
    while (current().tokenType === 'operacao-multiplicacao' || current().tokenType === 'operacao-divisao' || current().tokenType === 'operacao-and') {
        eat(current().tokenType);
        fator();
    }
}

function fator() {

    const t = current().tokenType;
    if (t === 'identificador-válido') variavel();
    else if (t === 'nint' || t === 'valor-true' || t === 'valor-false') eat(t);
    else if (t === 'abre-parenteses') {
        eat('abre-parenteses');
        expressao();
        eat('fecha-parenteses');
    }
    else if (t === 'palavra-reservada-negacao') {
        eat('palavra-reservada-negacao');
        fator();
    }
    else sintaticalError('fator', current());
}

function variavel() {    
    identificador();

    if (current().tokenType === 'abre-colchetes') {
        eat('abre-colchetes');
        expressao();
        eat('fecha-colchetes');
    }
}

function listaExpressoes() {
    expressao();
    while (current().tokenType === 'vírgula') {   
        eat('vírgula');
        expressao();
    }
}



function digito() {
    eat('digito');
}

function identificador() {
    const t = current().tokenType;
    if (t === 'identificador-válido' || isPredeclared(t)) eat(t);
    else sintaticalError('identificador', current());
}

function numero() {
    eat('nint')
}