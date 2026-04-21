function loadFile(fileInputId, codeOutputId) {
    const fileInput = document.getElementById(fileInputId);
    const codeOutput = document.getElementById(codeOutputId);

    fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return

        try {
            codeOutput.value = await file.text();
        } catch (err) {
            console.error("Error reading file:", err);
        }
    };
}

function openFile(fileInputId) {
    document.getElementById(fileInputId).click();
}

function saveFile(inputId) {
    const text = document.getElementById(inputId).value;
    let filename = prompt("Enter file name:", "file.txt");

    if (!filename) return;

    if (!filename.endsWith('.txt')) filename += '.txt'; ;

    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    link.click();
    URL.revokeObjectURL(link.href);
}

function cleanInput() {
    if (confirm("Do you want to clear the inputs?")) {
        const inputs = document.querySelectorAll('[id$="-input"]');
        inputs.forEach(el => el.value = '');
    }
}

function cleanOutput(idArray) {
    idArray.forEach(id => {
        const table = document.getElementById(id);
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
    });
}

function addRow(tableId, values) {
    const table = document.getElementById(tableId);
    const row = table.insertRow(-1)

    values.forEach((value, index) => {
        const cell = row.insertCell(index);
        cell.textContent = value;
    });
}

function tableOutput(output) {
    addRow('token-output', [output.token, output.tokenType, output.line, output.initialCol, output.finalCol]);
}

function tableError(error) {
    addRow('error-output', [error.errorType, error.token, error.line, error.initialCol, error.finalCol]);
}

function callLexicalAnalysis(inputId) {
    const text = document.getElementById(inputId).value;
    return lexicalAnalysis(text);
}

function callsyntaticAnalysis(outputId, errorId, input) {
    cleanOutput(['syntaticalErrorTable'])
    const { tokenList, lexicalErrorFound } = callLexicalAnalysis(outputId, errorId, input);
    
    syntaticalAnalysis(tokenList);
    if (lexicalErrorFound) return;
}

function compile(inputId, lexicalOutput, lexicalErrors, syntaticalOutput, syntaticalErros) {
    cleanOutput([lexicalOutput, lexicalErrors, syntaticalOutput, syntaticalErros])

    const { tokenList, lexicalErrorFound, errors } = callLexicalAnalysis(inputId);
    
    syntaticalAnalysis(tokenList);
}

function goTo(url) {
    window.location.href = url;
}