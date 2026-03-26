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

function openFile(fileInputId, targetInputId) {
    document.getElementById(fileInputId).click();
    loadFileIntoInput(fileInputId, targetInputId)
}

function saveFile(inputId) {
    const text = document.getElementById(inputId).value;
    const fileName = prompt("Enter file name:", "file.txt");


    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith('.txt') ? fileName : fileName + '.txt';
    
    link.click();
    URL.revokeObjectURL(link.href);
}

function cleanInput() {
    const confirmClear = confirm("Do you want to clear the inputs?");
    if (confirmClear) {
        const inputs = document.querySelectorAll('[id$="-input"]');
        inputs.forEach(el => el.value = '');
    }
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
    addRow('token-output', [output.token, output.tokenType, output.line, output.initialCol, output.finalCol]);
}

function tableError(error) {
    addRow('error-output', [error.errorType, error.token, error.line, error.initialCol, error.finalCol]);
}

function tokenize(outputId, errorId, InputId) {
    cleanOutput([outputId, errorId])
    const text = document.getElementById(InputId).value;
    lexicalAnalise(text);
}


function goTo(url) {
    window.location.href = url;
}