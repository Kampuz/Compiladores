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
            while (table.rows.length > 1) {
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
    addRow('lexicTable', [output.token, output.tokenType, output.line, output.initialCol, output.finalCol]);
}

function tableError(error) {
    addRow('lexicErrorTable', [error.errorType, error.token, error.line, error.initialCol, error.finalCol]);
}

function goTo(url) {
    window.location.href = url;
}

function switchTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
}

// Função para Renderizar Resultados nas Tabelas
function renderResults() {
    const compilationData = JSON.parse(sessionStorage.getItem('compilationResult'));
    if (!compilationData) return;

    // 1. Limpa todas as tabelas
    ['#lexicTable', '#lexicErrorTable', '#symbolTable', 'semanticTable', '#semanticErrorTable'].forEach(sel => {
            const tbody = document.querySelector(`${sel} tbody`);
            if (tbody) tbody.innerHTML = '';
        });

    // 2. Renderiza a Tabela de Símbolos diretamente na DOM
    const tokenTbody = document.querySelector('#lexicTable tbody');
    if (compilationData.tokenList && tokenTbody) {
        compilationData.tokenList.forEach(token => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${token.token}</td>
                <td>${token.tokenType}</td>
                <td>${token.line}</td>
                <td>${token.initialCol}</td>
                <td>${token.finalCol}</td>
            `;
            tokenTbody.appendChild(tr);
        });
    }

    const symbolTbody = document.querySelector('#symbolTable tbody');
    if (compilationData.symbols && symbolTbody) {
        compilationData.symbols.forEach(sym => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sym.name || '-'}</td>
                <td>${sym.type || '-'}</td>
                <td>${sym.category || '-'}</td>
                <td>${sym.value !== undefined ? sym.value : '-'}</td>
                <td>${sym.isRef ? 'Referência (var)' : 'Valor'}</td>
                <td>${sym.used ? 'Sim' : 'Não'}</td>
                <td>${sym.level || 0}</td>
                <td>${sym.scope || 'global'}</td>
            `;
            symbolTbody.appendChild(tr);
        });
    }

    const semanticTbody = document.querySelector('#semanticTable tbody');
    if (compilationData.tokenList && semanticTbody) {
        const symbolNames = new Set((compilationData.symbols || []).map(s => s.name));
        compilationData.tokenList.forEach(token => {
            const isIdentifier = token.tokenType === 'identificador-válido';
            const symbolLabel = isIdentifier ? (symbolNames.has(token.token) ? token.token : 'não declarado') : '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${token.token}</td>
                <td>${token.tokenType}</td>
                <td>${token.line}</td>
                <td>${token.initialCol}</td>
                <td>${token.finalCol}</td>
                <td>${symbolLabel}</td>
            `;
            semanticTbody.appendChild(tr)
        })
    }

    const semanticErrorTbody = document.querySelector('#semanticErrorTable tbody');
    if (compilationData.semanticErrors && semanticErrorTbody) {
        compilationData.semanticErrors.forEach(err => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${err.message || ''}</td>
                <td>${err.token || ''}</td>
                <td>${err.line || 0}</td>
                <td>${err.column || 0}</td>
            `;
            semanticErrorTbody.appendChild(tr);
        });
    }

    const codeOutput = document.getElementById('code-output');
    if (codeOutput) {
        if (compilationData.codeGenError) {
            codeOutput.value = `Erro na geração de código:\n${compilationData.codeGenError}`;
        } else if (compilationData.generatedCodeText) {
            codeOutput.value = compilationData.generatedCodeText;
        } else {
            codeOutput.value = '';
        }
    }
}

// Sobrescreve o clique do botão Compilar para renderizar automaticamente
const originalCompile = window.compile;
window.compile = function(...args) {
    if (typeof originalCompile === 'function') {
        originalCompile(...args);
    }
    renderResults();
};