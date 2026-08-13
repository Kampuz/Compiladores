function compile(inputId) {

    console.log("--- Limpando Tabelas Antigas ---");
    cleanOutput(['lexicTable', 'lexicErrorTable', 'symbolTable', 'semanticErrorTable', 'sintaticErrorTable', 'sintaticTable']);
    console.log("--- Tabelas Limpas ---");

    const codeInput = document.getElementById(inputId);
    if (!codeInput || !codeInput.value.trim()) {
        alert("Por favor, digite ou carregue um código antes de compilar.");
        return;
    }
    const codeText = codeInput.value;
    
    console.log("--- Iniciando Análise Léxica ---");
    const { tokenList, errors: lexicalErrors, errorsFound: lexicalErrorsFound } = lexicalAnalysis(codeText);
    console.log("--- Análise Léxica Concluída ---");

    if (lexicalErrorsFound > 0) {
        console.warn(`Compilation halted: Found ${lexicalErrorsFound} lexical errors.`);
        sessionStorage.setItem('compilationResult', JSON.stringify({
           tokenList,
           lexicalErrors,
           syntaxErrors: [],
           semanticErrors: [],
           symbols: [],
           generatedCodeText : null
        }));
        alert(`Análise concluída com ${lexicalErrorsFound} erro(s) léxico(s). Navegue pelas abas para verificar.`);
        return;
    }

    console.log("--- Iniciando Análise Sintática ---");
    const { errors: syntaxErrors, errorsFound: syntaxErrorsFound } = syntaticalAnalysis(tokenList);
    console.log("--- Análise Sintática Concluída ---");

    if (syntaxErrorsFound > 0) {
        console.warn(`Compilation halted: Found ${syntaxErrorsFound} syntax errors.`);
        sessionStorage.setItem('compilationResult', JSON.stringify({
            tokenList,
            lexicalErrors,
            syntaxErrors,
            semanticErrors: [],
            symbols: [],
            generatedCodeText : null
        }));
        alert(`Análise concluída com ${syntaxErrorsFound} erro(s) sintático(s). Navegue pelas abas para verificar.`);
        return;
    }

    console.log("--- Iniciando Análise Semântica ---");
    const { errors: semanticErrors, symbols } = semanticalAnalysis(tokenList);
    console.log("--- Análise Semântica Concluída ---");

    let generatedCodeText = null;
    let generatedCodeVector = null;
    let codeGenError = null;

    if (!semanticErrors || semanticErrors.length === 0) {
        console.log("--- Iniciando Geração de Código ---");
        const genResult = codeGeneration(tokenList);
        if (genResult.success) {
            generatedCodeText = genResult.codeText;
            generatedCodeVector = genResult.codeVector;
        } else {
            codeGenError = genResult.error;
            console.warn(`Geração de código interrompida: ${codeGenError}`);
        }
        console.log("--- Geração de Código Concluída ---");
    }

    const compilationData = {
        tokenList,
        lexicalErrors,
        syntaxErrors,
        semanticErrors,
        symbols,
        generatedCodeText,
        generatedCodeVector,
        codeGenError
    };

    sessionStorage.setItem('compilationResult', JSON.stringify(compilationData));
    
    if (semanticErrors && semanticErrors.length > 0) {
        alert(`Compilação concluída com ${semanticErrors.length} erro(s) semântico(s). Navegue pelas abas para conferir.`);
    } else if (codeGenError) {
        alert(`Análise concluída sem erros, mas a geração de código falhou: ${codeGenError}`);
    } else {
        alert("Compilação concluída com sucesso! Nenhum erro encontrado.");
    }
}

function generateCode() {
    const raw = sessionStorage.getItem('compilationResult');
    if (!raw) {
        alert("Compile o código primeiro (ava Editor) antes de gerar o código-alvo.");
        return;
    }

    const compilationData = JSON.parse(raw);
    const output = document.getElementById('code-output');

    if (compilationData.codeGenError) {
        if (output) output.value = `Erro na geração de código:\n${compilationData.codeGenError}`;
        return;
    }

    if (!compilationData.generatedCodeText) {
        if (output) output.value = 'Nenhum código gerado ainda. Corrija os erros e compile novamente.';
        return;
    }

    if (output) output.value = compilationData.generatedCodeText;
}