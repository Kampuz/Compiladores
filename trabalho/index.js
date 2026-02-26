function lerTexto() {
    let code = document.getElementById('code-input').value
    return code
}

function isNumber(number) {
    return ((number >= '0') && (number <= '9'))
}

function getTokenType(token) {
    switch (token) {
        case '+':
            return "opSoma";
        case '-':
            return "opSub";
        case '*':
            return "opMul";
        case '/':
            return "opDiv";
        case '(':
            return "aP";
        case ')':
            return "fP";
        default:
            return "Inválido"
    }
}

function tokenizar() {
    let input = lerTexto();
    let input_len = input.length;
    let line = 1;
    let offset = 0;
    let col_inicial = 1;
    let col_final = 1
    let token;
    let tokenType;
    let output = "lexema | token | linha | col_inicial | col_final<br>"

    for (let i = 0; i < input_len; i++) {
        if (isNumber(input[i])) {
            col_inicial = i + 1;
            col_final = col_inicial;
            tokenType = "nInt";
            while(col_final < input_len && isNumber(input[col_final])) {
                col_final++;
            }
            if (col_final + 1 < input_len &&
                input[col_final] == '.' &&
                isNumber(input[col_final + 1])) {
                tokenType = "nReal";
                col_final++;
                while(col_final < input_len && isNumber(input[col_final])) {
                    col_final++;
                }
            }
            token = input.substring(col_inicial - 1, col_final);
            i = col_final - 1;
            col_inicial = col_inicial - offset;
            col_final = col_final - offset;
        } else {
            if (input[i] == ' ') {
                continue;
            } else if (input[i] === '\n') {
                line++;
                offset = i + 1;
                continue;
            }
            col_inicial = i+1 - offset
            col_final = col_inicial
            token = input[i];
            tokenType = getTokenType(token)
        }
        output += `${token}  ${tokenType}  ${line}  ${col_inicial}  ${col_final}<br>`;
        document.getElementById('token-output').innerHTML = output;
    }
}