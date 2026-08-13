function textToVector(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const vector = [];

    for (const line of lines) {
        const match = line.match(/^(?:\d+:\s*)?([A-Z]+)(?:\s(-?\d+))?\s*$/);
        if (!match) {
            throw new Error(`Linha de código de máquina inválida: "${line}"`);
        }

        const [, op, argStr] = match;
        vector.push({ op: op.toUpperCase(), arg: argStr !== undefined ? parseInt(argStr, 10) : null});
    }

    return vector;
}

function executeCode() {

    const codeInput = document.getElementById('code-output');
    const executionOutput = document.getElementById('execution-output');
    let compilationResult;
    
    const text = codeInput ? codeInput.value.trim() : '';

    if (!text) {
        alert("Nenhum código para executar. Compile ou carregue um arquivo primeiro.")
        return;
    }

    let generatedCodeVector;
    try {
        generatedCodeVector = textToVector(text);
    } catch (err) {
        if (executionOutput) executionOutput.value = `Erro ao interpretar o código de máquina:\n${err.message}`;
        return;
    }
    
    const outputLines = [];

    const wm = new CodeGenerator({
        input: () => {
            const value = prompt('Digite um número inteiro:');
            const parsed = parseInt(value, 10);
            if (Number.isNaN(parsed)) {
                throw new Error(`Entrada inválida para leitura de inteiro: '${value}'`);
            }
            return parsed;
        },
        output: (value) => {
            outputLines.push(String(value));
        },
        outputChar: (value) => {
            outputLines.push(String.fromCharCode(value));
        }
    });

    wm.code_vector = generatedCodeVector;

    if (executionOutput) executionOutput.value = 'Executando...';

    try {
        wm.interpret();
        executionOutput.value = outputLines.length > 0 ? outputLines.join('') + '\nExecução encerrada com sucesso' : '(Programa executado com sucesso, mas não produziu nenhuma saída.)';
    } catch (error) {
        console.error(error);
        executionOutput.value = `Erro durante a execução:\n${error.message}\n\n--- Saída até o momento ---\n${outputLines.join('')}`;
    }
}