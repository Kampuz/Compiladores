const TOKENS_CALCULADORA ={
    '+': 'opSoma',
    '-': 'opSub',
    '*': 'opMul',
    '/': 'opDiv',
    '(': 'aP',
    ')': 'fP'
}

function isNumber(number) {
    return ((number >= '0') && (number <= '9'))
}

function calculadora() {
    const text = document.getElementById('code-input').value;
    processTokens(text);
}

function getTokenType(token) {
    return TOKENS_CALCULADORA[token] ?? 'inválido';
}

function processTokens(input) {
    let line = 1;
    let offset = 0;
    let output = "lexema | token | linha | col_inicial | col_final<br>";
    
    for (let i = 0; i < input.length; i++) {
        if (input[i] === ' ') continue;
        
        if (input[i] === '\n') {
            line++;
            offset = i + 1;
            continue;
        }
        
        let col_inicial = i - offset + 1;
        let col_final = col_inicial
        let token = '';
        let tokenType = '';

        if (isNumber(input[i])) {
            let start = i;
            while(i < input.length && isNumber(input[i])) {
                i++;
            }

            if (i < input.length &&
                input[i] === '.' &&
                isNumber(input[i + 1])) {
                
                i++;
                while(i < input.length && isNumber(input[i])) {
                    i++;
                }
                tokenType = "nReal";
            } else {
                tokenType = "nInt";
            }

            token = input.substring(start, i);
            i--;
            col_final = i - offset + 1;
        } else {
            token = input[i];
            tokenType = getTokenType(token);
        }

        output += `${token}  ${tokenType}  ${line}  ${col_inicial}  ${col_final}<br>`;
    }
    
    document.getElementById('token-output').innerHTML = output;
}