function compile(inputId) {

    console.log("--- Limpando Tabelas Antigas ---");
    cleanOutput(['token-output', 'error-output', 'symbolTable', 'semanticErrorTable', 'sintaticalErrorTable', 'sintaticalTable']);
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
           symbols: []
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
            symbols: []
        }));
        alert(`Análise concluída com ${syntaxErrorsFound} erro(s) sintático(s). Navegue pelas abas para verificar.`);
        return;
    }

    console.log("--- Iniciando Análise Semântica ---");
    const { errors: semanticErrors, symbols } = semanticalAnalysis(tokenList);
    console.log("--- Análise Semântica Concluída ---");

    const compilationData = {
        tokenList,
        lexicalErrors,
        syntaxErrors,
        semanticErrors,
        symbols
    };

    sessionStorage.setItem('compilationResult', JSON.stringify(compilationData));
    
    if (semanticErrors && semanticErrors.length > 0) {
        alert(`Compilação concluída com ${semanticErrors.length} erro(s) semântico(s). Navegue pelas abas para conferir.`);
    } else {
        alert("Compilação concluída com sucesso! Nenhum erro encontrado.");
    }
}