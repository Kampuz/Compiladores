
class SymbolTable {
    constructor() {
        this.scopes = [new Map()];
    }

    enterScope() {
        this.scopes.push(new Map());
    }

    exitScope() {
        if (this.scopes.length <= 1) {
            throw new Error("Cannot exit global scope.");
        }
        return this.scopes.pop();
    }

    insert(symbol) {
        const currentScope = this.scopes[this.scopes.length - 1];
        if (currentScope.has(symbol.name)) {
            throw new SemanticError(`Identificador '${symbol.name}' já declarado neste escopo.`);
        }
        currentScope.set(symbol.name, symbol);
    }

    lookup(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            const symbol = this.scopes[i].get(name);
            if (symbol) {
                symbol.used = true;
                return symbol;
            }
        }
        return null;
    }

    getCurrentScopeSymbols() {
        return Array.from(this.scopes[this.scopes.length - 1].values());
    }
}