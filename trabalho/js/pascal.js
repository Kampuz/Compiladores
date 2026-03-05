const TOKEN_TYPES ={
    'program': 'palavra-reservada',
    'procedure': 'palavra-reservada',
    'begin': 'palavra-reservada',
    'end': 'palavra-reservada',
    'int': 'tipo-inteiro',
    'boolean': 'tipo-boolean',
    ',': 'vírgula',
    ';': 'ponto-vírgula',
    ':': 'dois-pontos',
    '.': 'ponto-final',
    '(': 'abre-parenteses',
    ')': 'fecha-parenteses',
    ':=': 'atribucão',
    '+': 'opSoma',
    '-': 'opSub',
    '*': 'opMul',
    '/': 'opDiv'
}

function isDigit(number) {
    return ((number >= '0') && (number <= '9'))
}

function isLetter(char) {
    return (((char >= 'a') && (char <= 'z')) || ((char >= 'A') && (char <= 'Z')) || (char === '_'))
}

function tokenize() {
    const text = document.getElementById('code-input').value;
    lexicalAnalise(text);
}

function getTokenType(token) {
    return TOKEN_TYPES[token] ?? 'inválido';
}


function handleComment(input, i, state) {
    let firstChar = input[i];
    let secondChar = input[i + 1];

    if (firstChar=== '{') {
        i++;

        while (i < input.length && input[i] !== '}') {
            if (input[i] === '\n') {
                state.line++;
                state.offset = i + 1;
            }
            i++;
        }
        return i;
    } else if (firstChar === '/'  && secondChar === '/') {
        while (i < input.length && input[i] !== '\n') {
            i++;
        }
        state.line++;
        state.offset = i + 1;
        return i;
    }

    return i;
}

function lexicalAnalise(input) {
    let state = {
        line: 1,
        offset: 0
    };

    let output = "lexema | token | linha | col_inicial | col_final<br>";
    
    for (let i = 0; i < input.length; i++) {
        
        if (input[i] === ' ') continue;
        
        if (input[i] === '\n') {
            state.line++;
            state.offset = i + 1;
            continue;
        }

        if (input[i] === '{' || (input[i] === '/' && input[i + 1] === '/')) {
            i = handleComment(input, i, state);
            continue;
        }
        
        let col_inicial = i - state.offset + 1;
        let col_final = col_inicial
        let token = '';
        let tokenType = '';

        if (isDigit(input[i])) {
            let start = i;
            while(i < input.length && isDigit(input[i])) {
                i++;
            }

            if (i < input.length &&
                input[i] === '.' &&
                isDigit(input[i + 1])) {
                
                i++;
                while(i < input.length && isDigit(input[i])) {
                    i++;
                }
                tokenType = "nReal";
            } else {
                tokenType = "nInt";
            }

            token = input.substring(start, i);
            i--;
            col_final = i - state.offset + 1;

        } else if (isLetter(input[i])) {
            let start = i;

            while (i < input.length && (isLetter(input[i]) || isDigit(input[i]))) {
                i++;
            }

            token = input.substring(start, i);

            if (TOKEN_TYPES[token]) {
                tokenType = TOKEN_TYPES[token];
            } else {
                tokenType = "identificador";
            }

            i--;
            col_final = i - state.offset + 1;

        } else if (input[i] === ':' && input[i + 1] === '=') {
            token = ':=';
            tokenType = TOKEN_TYPES[token];
            i++;
            col_final = i - state.offset + 1;

        } else {
            token = input[i];
            tokenType = getTokenType(token);
        }

        output += `${token}  ${tokenType}  ${state.line}  ${col_inicial}  ${col_final}<br>`;
    }
    
    document.getElementById('token-output').innerHTML = output;
}