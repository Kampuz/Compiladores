function loadFileIntoInput(fileInputId, targetInputId) {
    const fileInput = document.getElementById(fileInputId);
    const codeInput = document.getElementById(targetInputId);

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        file.text().then(text => {
            codeInput.value = text;
        }).catch(err => {
            console.error("Error reading file:", err);
        });
    });
}

function abrirArquivo(fileInputId, targetInputId) {
    document.getElementById(fileInputId).click();
    loadFileIntoInput(fileInputId, targetInputId)
}

function cleanInput() {
    const inputs = document.querySelectorAll('[id$="-input"]');
    inputs.forEach(el => el.value = '');
}

function cleanOutput(ids) {
    ids.forEach(id => {
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
    addRow('token-output', [
        output.token,
        output.tokenType,
        output.line,
        output.initialCol,
        output.finalCol
    ]);
}

function tableError(error) {
    addRow('error-output', [
        error.errorType,
        error.token,
        error.line,
        error.initialCol,
        error.finalCol
    ]);
}

function tokenize() {
    cleanOutput(['token-output', 'error-output'])
    const text = document.getElementById('code-input').value;
    lexicalAnalise(text);
}