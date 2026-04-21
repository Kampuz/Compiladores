function cleanInput() {
    if (confirm("Do you want to clear the inputs?")) {
        const inputs = document.querySelectorAll('[id$="-input"]');
        inputs.forEach(el => el.value = '');
    }
}

function cleanOutput(idArray) {
    for (const id of idArray) {
        const table = document.getElementById(id);
        if (!table) continue;
        
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        } else {
            while (table.rows.lenght > 1) {
                table.deleteRow(1);
            }
        }
    }
}

function addRow(tableId, values) {
    const table = document.getElementById(tableId);

    if (!table) return;

    const target = table.querySelector('tbody') || table
    const row = target.insertRow(-1)

    values.forEach(value => {
        const cell = row.insertCell();
        cell.textContent = value;
    });
}

function tableOutput(output) {
    addRow('token-output', [output.token, output.tokenType, output.line, output.initialCol, output.finalCol]);
}

function tableError(error) {
    addRow('error-output', [error.errorType, error.token, error.line, error.initialCol, error.finalCol]);
}

function goTo(url) {
    window.location.href = url;
}