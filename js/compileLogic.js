function compile(inputId, lexicalOutput, lexicalErrors, syntaticalOutput, syntaticalErros) {
    cleanOutput([lexicalOutput, lexicalErrors, syntaticalOutput, syntaticalErros])

    const codeText = document.getElementById(inputId).value;
    if (!codeText) {
        console.warn("No code to compile");
        return;
    }

    console.log("--- Startig Lexical Analysis ---")

    const { tokenList, lexicalErrors, lexicalErrosFounds } = lexicalAnalysis(codeText);

    console.log("--- Lexical Analysis Finished ---")
    console.log("--- Startig Syntax Analysis ---");
    
    syntaticalAnalysis(tokenList);

    console.log("--- Syntax Analysis Finished ---")
}