function compile(inputId, lexicalOutputId, lexicalErrorsId, syntaticalOutputId, syntaticalErrosId) {
    cleanOutput([lexicalOutputId, lexicalErrorsId, syntaticalOutputId, syntaticalErrosId])

    const codeText = document.getElementById(inputId).value;
    if (!codeText) {
        console.warn("No code to compile");
        return;
    }

    console.log("--- Startig Lexical Analysis ---")

    const { tokenList, lexicalErrors, lexicalErrorsFound } = lexicalAnalysis(codeText);

    if (tokenList && tokenList.length > 0)  {
        tokenList.forEach(token => {
            tableOutput(token)
        });
    }

    if (lexicalErrors && lexicalErrors > 0) {
        lexicalErrors.forEach(err => tableError(err));
    }
    console.log("--- Lexical Analysis Finished ---")

    if (lexicalErrorsFound > 0) {
        console.warn(`Compilation halted: Found ${errorsFound} lexical errors.`);
        return;
    }

    console.log("--- Startig Syntax Analysis ---");
    
    syntaticalAnalysis(tokenList);

    console.log("--- Syntax Analysis Finished ---")
}