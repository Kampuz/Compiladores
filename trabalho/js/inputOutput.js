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

function tableOutput(output) {
    const table = document.getElementById('token-output');
    const newRow = table.insertRow(-1)

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);

    cell1.textContent = output.token;
    cell2.textContent = output.tokenType;
    cell3.textContent = output.line;
    cell4.textContent = output.initialCol;
    cell5.textContent = output.finalCol;
}

function tableError(error) {
    const table = document.getElementById('error-output');
    const newRow = table.insertRow(-1)

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);

    cell1.textContent = error.errorType;
    cell2.textContent = error.token;
    cell3.textContent = error.line;
    cell4.textContent = error.initialCol;
    cell5.textContent = error.finalCol;
}

function tokenize() {
    cleanOutput(['token-output', 'error-output'])
    const text = document.getElementById('code-input').value;
    lexicalAnalise(text);
}