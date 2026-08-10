# Disciplina de Compiladores

Projeto para disciplina de Compiladores para o desenvolvimento, eventualmente, de um compilador.

Membros:

- Abigail Nakashima
- Miguel Moret
- Daniel Pádua

Trabalho:

- [X] Tabela de símbolos
- [X] Tabela de palavras e símbolos reservados
- [X] Manipulação de erros
- [x] Analisador Léxico de tokens simples {[0-9], +, -, *, /, ., (,)} onde devem ser indentificados {nInt, nReal, opSoma, opSub, opMult, opDiv, aP, fP}
- [x] Analisador Léxico para LALG
- [x] Rotinas para tratamento de erros léxicos
- [x] Analisador Sintático
- [X] Tratador de erros sintáticos
- [X] Analisador Semantico
- [X] Tratador de erros semanticos
- [] Gerador de código intermediário
- [] Otimizador de código
- [] Gerador de código
- [] Programa alvo
- [] frontend

Bugs:
- [] valor '-' na tabela de simbolos
- [] tudo 'e passado como valor na tabela de simbolos
- escopo do procedimento vira procedimento_x e nao procedimento_nomeProcedimento
- analise semantica nao passo a passo