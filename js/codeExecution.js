function executeCode() {
    const raw = sessionStorage.getItem('compilationResult');
    if (!raw) {
        alert("Compile o código primeiro antes de executar.");
        return;
    }


    const compilationData = JSON.parse(raw);
    const output = document.getElementById('execution-output');

    if (compilationData.codeGenError) {
        if (output) output.value = `Não é possível executar: houve um erro na geração de código.\n${compilationData.codeGenError}`;
        return;
    }

    if (!compilationData.generatedCodeVector || compilationData.generatedCodeVector.length === 0) {
        if (output) output.value = 'Nenhim código gerado ainda. Corrija os erros e compile novamente';
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

    wm.code_vector = compilationData.generatedCodeVector;

    if (output) output.value = 'Executando...';

    try {
        wm.interpretar();
        output.value = outputLines.length > 0 ? outputLines.join('') : '(Programa executado com sucesso, mas não produziu nenhuma saída.)';
    } catch (error) {
        console.error(error);
        output.value = `Erro durante a execução:\n${error.message}\n\n--- Saída até o momento ---\n${outputLines.join('')}`;
    }
}