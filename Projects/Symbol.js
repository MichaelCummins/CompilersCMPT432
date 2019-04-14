class symbol{
    constructor(kind, type, line, scope, scopeLevel, currentProgram, used, initailized, value){
        this.kind = kind;
        this.type = type;
        this.line = line;
        this.scope = scope;
        this.scopeLevel = scopeLevel;
        this.currentProgram = currentProgram;
        this.used = used;
        this.initialized = initailized;
        this.value = value;
    }
}