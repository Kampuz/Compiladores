function lerTexto() {
    let code = document.getElementById('code-input').value
    console.log(code)
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
            return "aPar";
        case ')':
            return "fPar";
        default:
            return "Inválido"
    }
}

function rodar() {
    let input = lerTexto();
    let input_len = input.length;
    let line = 1;
    let col_inicial = 1;
    let col_final = 1
    let token;
    let tokenType;

    console.log("lexema(lido)  token(representa) linha col_inicial col_final")
    for (let i = 0; i < input_len; i++) {
        if (isNumber(input[i])) {
            col_inicial = i + 1;
            col_final = col_inicial;
            tokenType = "nInt";
            while(isNumber(input[col_final]) && col_final < input_len) {
                col_final++;
            }
            if (input[col_final] == '.' && isNumber(input[col_final + 1])) {
                tokenType = "nReal";
                col_final++;
                while(isNumber(input[col_final]) && col_final < input_len) {
                    col_final++;
                }
            }
            token = input.substring(col_inicial - 1, col_final);
            i = col_final - 1;
        } else {
            if (input[i] == ' ') {
                break;
            } else if (input[i] == '\n') {
                line;
                break;
            }
            col_inicial = i+1
            col_final = i+1
            token = input[i];
            tokenType = getTokenType(token)
        }
        let output = `${token}  ${tokenType}  ${line}  ${col_inicial}  ${col_final}`
        console.log(output)
    }
}