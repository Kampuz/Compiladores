/**
 * Passada de Geração de Código.
 *
 * Percorre a lista de tokens (já validada pela análise sintática/semântica)
 * e emite instruções da máquina virtual (CodeGenerator) usando a mesma
 * gramática recursiva descendente do semanticalAnalyzer.js.
 *
 * LIMITAÇÃO ATUAL: procedimentos ainda não são suportados (endereçamento
 * por nível/deslocamento não implementado). Programas com "procedure"
 * geram um erro controlado em vez de código incorreto.
 */
class CodeGenerationVisitor {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.gen = new CodeGenerator();
        this.scopes = [new Map()];
        this.nextAddress = 0;
    }

    currentToken() {
        return this.tokens[this.index];
    }

    type() {
        const t = this.currentToken();
        return t ? (t.tokenType || t.type) : 'EOF';
    }

    match(...types) {
        return types.includes(this.type());
    }

    consume(expectedType) {
        const token = this.currentToken();
        const type = token ? (token.tokenType || token.type) : 'EOF';
        if (!token || type !== expectedType) {
            throw new Error(`Erro na geração de código: esperado '${expectedType}', encontrado '${type}'`);
        }
        this.index++;
        return token;
    }

    declare(name, dataType) {
        const address = this.nextAddress++;
        this.scopes[this.scopes.length - 1].set(name, { address, type: dataType });
        return address;
    }

    resolve(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) return this.scopes[i].get(name);
        }
        throw new Error(`Erro na geração de código: identificador '${name}' não encontrado`);
    }

    tokenTypeToDataType(tokenType) {
        switch (tokenType) {
            case 'tipo-inteiro': return 'integer';
            case 'tipo-real': return 'real';
            case 'tipo-boolean': return 'boolean';
            default: throw new Error(`Tipo de token desconhecido: ${tokenType}`);
        }
    }

    generate() {
        try {
            this.programa();
            this.gen.gerar('PARA', null);
            return { success: true, code: this.gen.code_vector, gen: this.gen };
        } catch (error) {
            return { success: false, error: error.message, code: this.gen.code_vector, gen: this.gen };
        }
    }

    // ---- Gramática ----

    programa() {
        this.consume('palavra-reservada-program');
        this.consume('identificador-válido');
        this.consume('ponto-vírgula');
        this.gen.gerar('INPP');
        this.bloco();
        this.consume('ponto-final');
    }

    bloco() {
        if (this.match('palavra-reservada-var')) {
            this.secaoDeclaracaoVariaveis();
        }
        if (this.match('palavra-reservada-procedure')) {
            throw new Error('Geração de código ainda não suporta procedimentos nesta versão.');
        }
        this.comandoComposto();
    }

    secaoDeclaracaoVariaveis() {
        this.consume('palavra-reservada-var');
        let total = 0;
        while (this.match('tipo-inteiro', 'tipo-real', 'tipo-boolean')) {
            total += this.declaracaoVariaveis();
        }
        if (total > 0) this.gen.gerar('AMEM', total);
    }

    declaracaoVariaveis() {
        const typeToken = this.consume(this.type());
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

        for (const name of ids) this.declare(name, dataType);
        return ids.length;
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

        if (this.match('abre-parenteses')) {
            throw new Error(`Geração de código ainda não suporta chamadas de procedimento ('${name}').`);
        }

        const symbol = this.resolve(name);
        this.consume('atribuicao');
        this.expressao();
        this.gen.gerar('ARMZ', symbol.address);
    }

    comandoCondicional() {
        this.consume('palavra-reservada-if');
        this.expressao();
        this.consume('palavra-reservada-then');

        const addrDSVF = this.gen.gerar('DSVF', null);
        this.comando();

        if (this.match('palavra-reservada-else')) {
            const addrDSVS = this.gen.gerar('DSVS', null);
            this.gen.patch(addrDSVF, this.gen.code_vector.length);
            this.consume('palavra-reservada-else');
            this.comando();
            this.gen.patch(addrDSVS, this.gen.code_vector.length);
        } else {
            this.gen.patch(addrDSVF, this.gen.code_vector.length);
        }
    }

    comandoRepeticao() {
        const addrCond = this.gen.code_vector.length;
        this.consume('palavra-reservada-while');
        this.expressao();
        this.consume('palavra-reservada-do');

        const addrDSVF = this.gen.gerar('DSVF', null);
        this.comando();
        this.gen.gerar('DSVS', addrCond);
        this.gen.patch(addrDSVF, this.gen.code_vector.length);
    }

    comandoRead() {
        this.consume('palavra-reservada-read');
        this.consume('abre-parenteses');
        do {
            const idToken = this.consume('identificador-válido');
            const name = idToken.token || idToken.value;
            const symbol = this.resolve(name);
            this.gen.gerar('LEIT');
            this.gen.gerar('ARMZ', symbol.address);

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
            this.gen.gerar('IMPR');

            if (this.match('vírgula')) {
                this.consume('vírgula');
            } else {
                break;
            }
        } while (true);
        this.consume('fecha-parenteses');
        this.gen.gerar('IMPE');
    }

    expressao() {
        this.expressaoSimples();

        const relMap = {
            'operacao-maior': 'CMMA',
            'operacao-menor': 'CMME',
            'operacao-maior-igual': 'CMDG',
            'operacao-menor-igual': 'CMEG',
            'operacao-igualdade': 'CMIG',
            'operacao-diferente': 'CMIG', // seguido de NEGA abaixo
        };

        if (this.match(...Object.keys(relMap))) {
            const opType = this.type();
            this.consume(opType);
            this.expressaoSimples();
            this.gen.gerar(relMap[opType]);
            if (opType === 'operacao-diferente') this.gen.gerar('NEGA');
        }
    }

    expressaoSimples() {
        let leadingSign = null;
        if (this.match('operacao-adicao', 'operacao-subtracao')) {
            leadingSign = this.type();
            this.consume(leadingSign);
        }

        this.termo();
        if (leadingSign === 'operacao-subtracao') this.gen.gerar('INVR');

        const addMap = {
            'operacao-adicao': 'SOMA',
            'operacao-subtracao': 'SUBT',
            'operacao-inclusiva': 'DISJ',
        };

        while (this.match(...Object.keys(addMap))) {
            const opType = this.type();
            this.consume(opType);
            this.termo();
            this.gen.gerar(addMap[opType]);
        }
    }

    termo() {
        this.fator();

        const mulMap = {
            'operacao-multiplicacao': 'MULT',
            'operacao-divisao': 'DIVI',
            'operacao-conjuncao': 'CONJ',
        };

        while (this.match(...Object.keys(mulMap))) {
            const opType = this.type();
            this.consume(opType);
            this.fator();
            this.gen.gerar(mulMap[opType]);
        }
    }

    fator() {
        if (this.match('identificador-válido')) {
            const idToken = this.consume('identificador-válido');
            const name = idToken.token || idToken.value;
            const symbol = this.resolve(name);
            this.gen.gerar('CRVL', symbol.address);
        } else if (this.match('nInt', 'numero-inteiro')) {
            const token = this.consume(this.type());
            this.gen.gerar('CRCT', parseInt(token.token || token.value, 10));
        } else if (this.match('valor-true')) {
            this.consume('valor-true');
            this.gen.gerar('CRCT', 1);
        } else if (this.match('valor-false')) {
            this.consume('valor-false');
            this.gen.gerar('CRCT', 0);
        } else if (this.match('abre-parenteses')) {
            this.consume('abre-parenteses');
            this.expressao();
            this.consume('fecha-parenteses');
        } else if (this.match('operacao-negacao')) {
            this.consume('operacao-negacao');
            this.fator();
            this.gen.gerar('NEGA');
        } else {
            throw new Error(`Erro na geração de código: token inesperado '${this.type()}' em fator`);
        }
    }
}

/**
 * Wrapper com a mesma convenção de retorno das outras fases
 * (lexicalAnalysis, syntaticalAnalysis, semanticalAnalysis).
 */
function codeGeneration(tokenList) {
    const visitor = new CodeGenerationVisitor(tokenList);
    const result = visitor.generate();

    return {
        success: result.success,
        error: result.success ? null : result.error,
        codeVector: result.code,
        codeText: result.gen.toText(),
    };
}