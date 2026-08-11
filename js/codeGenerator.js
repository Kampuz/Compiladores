class CodeGenerator {
    constructor(io = {}) {
        this.code_vector = [];
        this.data_vector = [];
        this.counter = 0;
        this.top_pile = -1;

        this.input = io.input || (() => parseInt(prompt("Digite um inteiro:"), 10));
        this.inputChar = io.inputChar || (() => prompt("Digite um caractere:"));
        this.output = io.output || ((value) => console.log(value));
        this.outputChar = io.outputChar || ((value) => console.log(String.fromCharCode(value)));
    }

    gerar(op, arg = null) {
        this.code_vector.push({ op, arg });
        return this.code_vector.length - 1;
    }

    patch(address, arg) {
        this.code_vector[address].arg = arg;
    }

    counterIsValid(counter) {
        return ((counter >= 0) && (counter < this.code_vector.length));
    }

    isEnd(instruction) {
        return instruction.op === 'PARA';
    }

    isJump(instruction) {
        return instruction.op === 'DSVS' || instruction.op === 'DSVF';
    }

    execute(instruction) {
        const { op, arg } = instruction;
        const D = this.data_vector;

        switch (op) {
            case 'CRCT':
                this.top_pile++;
                D[this.top_pile] = arg;
                break;
            case 'CRVL':
                this.top_pile++;
                D[this.top_pile] = D[arg];
                break;
            case 'ARMZ':
                D[arg] = D[this.top_pile];
                this.top_pile--;
                break;
            case 'SOMA':
                D[this.top_pile - 1] += D[this.top_pile];
                this.top_pile--;
                break;
            case 'SUBT':
                D[this.top_pile - 1] -= D[this.top_pile];
                this.top_pile--;
                break;
            case 'MULT':
                D[this.top_pile - 1] *= D[this.top_pile];
                this.top_pile--;
                break;
            case 'DIVI':
                if (D[this.top_pile] === 0) {
                    throw new Error("Divisão por zero");
                }
                D[this.top_pile - 1] /= D[this.top_pile];
                this.top_pile--;
                break;
            case 'MODI':
                if (D[this.top_pile] === 0) {
                    throw new Error("Divisão por zero");
                }
                D[this.top_pile - 1] %= D[this.top_pile];
                this.top_pile--;
                break;
            case 'INVR':
                D[this.top_pile] = -D[this.top_pile];
                break;
            case 'CONJ':
                if (D[this.top_pile - 1] === 1 && D[this.top_pile] === 1) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;
            case 'DISJ':
                if (D[this.top_pile - 1] === 1 || D[this.top_pile] === 1) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;
            case 'NEGA':
                D[this.top_pile] = 1 - D[this.top_pile];
                break;
            case 'CMME':
                if (D[this.top_pile - 1] < D[this.top_pile]) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;
            case 'CMME':
                if (D[this.top_pile - 1] < D[this.top_pile]) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;
            case 'CMMA':
                if (D[this.top_pile - 1] > D[this.top_pile]) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;
            case 'CMIG':
                if (D[this.top_pile - 1] == D[this.top_pile]) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;
            case 'CMDG':
                if (D[this.top_pile - 1] >= D[this.top_pile]) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;
            case 'CMEG':
                if (D[this.top_pile - 1] <= D[this.top_pile]) {
                    D[this.top_pile - 1] = 1;
                } else {
                    D[this.top_pile - 1] = 0;
                }
                this.top_pile--;
                break;

            // Desvios

            case 'DSVS':
                this.counter = arg;
                break;
            case 'DSVF':
                if (D[this.top_pile] === 0) {
                    this.counter = arg;
                } else {
                    this.counter++;
                }
                this.top_pile--;
                break;
            
                // Entrada/Saída

            case 'LEIT':
                this.top_pile++;
                D[this.top_pile] = input();
                break;
            case 'LECH':
                this.top_pile++;
                D[this.top_pile] = inputChar();
                break;
            case 'IMPR':
                output(D[this.top_pile]);
                this.top_pile--;
                break;
            case 'IMPC':
                outputChar(D[this.top_pile]);
                this.top_pile--;
                break;
            case 'IMPE':
                output('\n');
                break;

            // Programa

            case 'INPP':
                this.top_pile = -1;
                break;
            case 'AMEM':
                this.top_pile += arg;
                break;
            case 'DMEM':
                this.top_pile -= arg;
                break;
            case 'NADA':
                break;
            case 'PARA':
                break;


            default:
                throw new Error(`Comando desconhecido: ${instruction}`);
            
        }
        
    }

    interpretar() {
        while (this.counterIsValid(this.counter) && !this.isEnd(this.code_vector[this.counter])) {
            const instruction = this.code_vector[this.counter];
            const wasJump = this.isJump(instruction);
            
            this.execute(instruction);
            
            if (!wasJump) {
                this.counter++;
            }
        }
    }

    toText() {
        return this.code_vector.map((instruction, index) => `${index}: ${instruction.op}${instruction.arg !== null && instruction.arg !== undefined ? ' ' + instruction.arg : ''}`).join('\n');
    }
}