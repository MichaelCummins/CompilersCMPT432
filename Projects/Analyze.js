var analyzerTokens = [];
var analyzerCurrentToken;
var numAnalyzerErrors = 0;
var numAnalyzerWarnings = 0;
var currentScope = 0;
var scopeLevel = 0;
var addition = false;
var temporaryId = null;
var temporaryValue = null;
var temporaryType = null;
var ast = new Tree();
ast.addNode("root", "branch");

var sT = new symbolTree();

function analyzerInit(){
    analyzerTokens = [];
    analyzerCurrentToken;
    numAnalyzerErrors = 0;
    numAnalyzerWarnings = 0;
    currentScope = 0;
    scopeLevel = 0;
    addition = false;
    temporaryId = null;
    temporaryValue = null;
    temporaryType = null;
    ast = new Tree();
    ast.addNode("root", "branch");
    sT = new symbolTree();
}

function getNextAnalyzerToken(){
    analyzerCurrentToken = analyzerTokens[0];
    analyzerTokens.shift();
}

function analyzerLookAhead(){
    return analyzerTokens[0];
}

function analyzerStart(userInput){
    analyzerInit();
    analyzerTokens = userInput;
    
    analyzeProgram();
    
    if(numAnalyzerErrors != 0){
        outputMessage("Analyzer failed with " + numAnalyzerErrors + " errors");
    }
    
    return numAnalyzerErrors;
}

function analyzeProgram(){
    ast.addNode("Program", "branch");
    outputMessage("Analyze program");
    getNextAnalyzerToken();
    analyzeBlock();
    if(analyzerCurrentToken.kind == "EOF"){
        getNextAnalyzerToken();
    }
    ast.endChildren();
}

function analyzeBlock(){
    outputMessage("Analyze Block");
    scopeLevel++;
    currentScope++;
    ast.addNode("Block", "branch");
    sT.addNode("Scope: " + currentScope, "branch" + currentScope);
    
    if(matchToken(analyzerCurrentToken, "L_Brace")){
        getNextAnalyzerToken();
    }
    analyzeStatementList();
    if(matchToken(analyzerCurrentToken, "R_Brace")){
        getNextAnalyzerToken();
    }
    
    scopeLevel--;
    currentScope--;
    sT.endChildren();
    ast.endChildren();
}

function analyzeStatementList(){
    outputMessage("Analyze Statement List");
    
    if(matchToken(analyzerCurrentToken, "R_Brace")){
        //Epsilon
    }else if(matchToken(analyzerCurrentToken, "print") || matchToken(analyzerCurrentToken, "id")
        || matchToken(analyzerCurrentToken, "int") || matchToken(analyzerCurrentToken, "string")
        || matchToken(analyzerCurrentToken, "boolean") || matchToken(analyzerCurrentToken, "while")
        || matchToken(analyzerCurrentToken, "if") || matchToken(analyzerCurrentToken, "L_Brace")){
        analyzeStatement();
        analyzeStatementList();
    }
}

function analyzeStatement(){
    outputMessage("Analyze Statement");
        //Since a statement can be many things in our grammar check what it starts with
        //If it starts with the token PRINT its a print statement
    if(matchToken(analyzerCurrentToken, "print")){
        //Go to print statement
        analyzePrintStatement();
        //If its an id it goes to assignment 
    }else if(matchToken(analyzerCurrentToken, "id")){
        //Go to assignment statement
        analyzeAssignmentStatement();
        //If it starts with int string or boolean it is a variable declaration
    }else if(matchToken(analyzerCurrentToken, "int") || matchToken(analyzerCurrentToken, "string") || 
             matchToken(analyzerCurrentToken, "boolean")){
        //Go to variable declaration
        analyzeVarDecl();
        //If it is while it is the start of a while statement
    }else if(matchToken(analyzerCurrentToken, "while")){
        //Go to while statement
        analyzeWhileStatement();
        //If it is if it is the start of an if statement
    }else if(matchToken(analyzerCurrentToken, "if")){
        //Go to if statement
        analyzeIfStatement();
        //If anything else, parse as a block statment
    }else if(matchToken(analyzerCurrentToken, "L_Brace")){
        analyzeBlock();
    }
}

function analyzePrintStatement(){
    outputMessage("Analyzing print statement");
    ast.addNode("Print", "Branch");
    getNextAnalyzerToken();
    
    if(matchToken(analyzerCurrentToken, "L_Paren")){
        getNextAnalyzerToken();
    }
    
    analyzeExpr();
    
    if(matchToken(analyzerCurrentToken, "R_Paren")){
        getNextAnalyzerToken();
    }

    ast.endChildren();
}

function analyzeAssignmentStatement(){
    outputMessage("Analyzing Assignment Statement");
    ast.addNode("Assignment Statement", "branch");
    if(matchToken(analyzerCurrentToken, "id")){
        var id = analyzerCurrentToken.value;
        var kind = getVariableDetails(id, sT.cur);
        if(kind == undefined){
            numAnalyzerErrors++;
            outputMessage("ERROR ID " + id + " was not declared in this scope " + currentScope);
        }
        
        if(!addition){
            temporaryId = id;
            try {
                temporaryType = type.toUpperCase();
            }catch(e){
                e.printstack
                temporaryType = null;
            }
            
            addition = true;
            
            if(temporaryValue == null || temporaryValue == undefined){
                temporaryValue = getVariableDetails(id, sT.cur);
            }else{
                temporaryValue = Number(temporaryValue) + Number(getVariableDetails(id, sT.cur));
            }
        }
        analyzeId();
    }
    
    if(matchToken(analyzerCurrentToken, "OP_Assignment")){
        getNextAnalyzerToken();
        if(addition){
            if(matchToken(analyzerCurrentToken, "digit")){
                if(temporaryType == "int"){
                    if(analyzerLookAhead != "plus"){
                        if(temporaryValue == 0){
                            temporaryValue = Number(analyzerCurrentToken.value);
                        }else{
                            temporaryValue = Number(temporaryValue) + Number(analyzerCurrentToken.value);
                        }
                        setValue;
                        addition = false;
                        temporaryId = null;
                        temporaryType = null;
                        temporaryValue = null;
                    }else{
                        addition = false;
                        temporaryId = null;
                        temporaryType = null;
                        temporaryValue = null; 
                    }
                }else if(temporaryType == "boolean"){
                    if(Number(analyzerCurrentToken.value) > 0){
                        var boolean = true;
                    }else{
                        boolean = false;
                    }
                    setValue;
                    temporaryId = null;
                    temporaryType = null;
                    temporaryValue = null;
                }else{
                    numAnalyzerErrors++;
                    outputMessage("ERROR " + temporaryId + " was expecting type " + temporaryType + " and was given int");
                }
            }else if(matchToken(analyzerCurrentToken, "id")){
                var currentTokenType = getVariableDetails(analyzerCurrentToken.value, sT.cur);
                if(temporaryType.toLowerCase() != currentTokenType){
                    numAnalyzerErrors++;
                    outputMessage("ERROR type mismatch, id on line " + analyzerCurrentToken.currentLine + 
                                 " is defined as " + temporaryType + " and was assigned as " + currentTokenType);
                }
                if(temporaryValue == 0){
                    temporaryValue = getVariableDetails(analyzerCurrentToken.value, sT.cur);
                }else{
                    temporaryValue = Number(temporaryValue) + 
                        Number(getVariableDetails(analyzerCurrentToken, sT.cur));
                }
                setValue;
                temporaryId = null;
                temporaryType = null;
                temporaryValue = null;
            }else if(matchToken(analyzerCurrentToken, "boolean")){
                if(temporaryType == boolean){
                    var value;
                    if(matchToken(analyzerCurrentToken, "true")){
                        value = true;
                    }else if(matchToken(analyzerCurrentToken, "false")){
                        value = false;
                    }
                    setValue;
                    temporaryId = null;
                    temporaryType = null;
                    temporaryValue = null;
                }else{
                    numAnalyzerErrors++;
                    outputMessage("ERROR id " + temporaryId + " was expecting type " + 
                                  temporaryType + " but was given boolean");
                }
            }
        }
        analyzeExpr();
    }
    ast.endChildren();
}

function analyzeVarDecl(){
    outputMessage("Analyzing Var decl");
    ast.addNode("Var Decl", "branch");
    getNextAnalyzerToken();
    
    if(matchToken(analyzerCurrentToken, "id")){
        analyzeId();
    }
    ast.endChildren();
}

function analyzeWhileStatement(){
    outputMessage("Analyzing While Statement");
    ast.addNode("While Statement", "branch");
    
    getNextAnalyzerToken();
    
    if(matchToken(analyzerCurrentToken, "L_Paren") || matchToken(analyzerCurrentToken, "boolean")){
        analyzeBooleanExpr();
        getNextAnalyzerToken();
        analyzeBlock();
    }
    ast.endChildren();
}

function analyzeIfStatement(){
    outputMessage("Analyzing If Statement");
    ast.addNode("If Statement", "branch");
    getNextAnalyzerToken();
    
    if(matchToken(analyzerCurrentToken, "L_Paren") || matchToken(analyzerCurrentToken, "boolean")){
        analyzeBooleanExpr();
        getNextAnalyzerToken();
        analyzeBlock();
    }
    ast.endChildren();
}

function analyzeExpr(){
    outputMessage("Analyzing Expr");
    if(matchToken(analyzerCurrentToken, "digit")){
        analyzeIntExpr();
    }else if(matchToken(analyzerCurrentToken, '"')){
        analyzeStringExpr();
    }else if(matchToken(analyzerCurrentToken, "L_Paren") || 
             matchToken(analyzerCurrentToken, "boolean")){
        analyzeBooleanExpr();
    }else if(matchToken(analyzerCurrentToken, "id")){
        analyzeId();
    }
}

function analyzeIntExpr(){
    outputMessage("Analyzing Int Expr");
    
    if(matchToken(analyzerLookAhead, "+")){
        ast.addNode("Addition", "branch");
    }
    analyzeId();
    
    if(matchToken(analyzerCurrentToken, "+")){
        getNextAnalyzerToken();
        analyzeExpr();
        ast.endChildren();
    }
}

function analyzeStringExpr(){
    outputMessage("Analyzing String Expr");
    if(matchToken(analyzerCurrentToken, '"')){
        getNextAnalyzerToken();
    }
    
    var charList = analyzeCharList();
    
    ast.addNode(charList, "leaf");
    
    if(matchToken(analyzerCurrentToken, '"')){
        getNextAnalyzerToken();
    }
}

function analyzeId(){
    ast.addNode(analyzerCurrentToken.value, "leaf");
    getNextAnalyzerToken();
}

function analyzeCharList(){
    outputMessage("Analyzing Char List");
    if(matchToken(analyzerCurrentToken, '"')){
        return "";
    }
    
    var chars = analyzerCurrentToken.value;
    
    getNextAnalyzerToken();
    
    if(matchToken(analyzerCurrentToken, "char")){
        return (chars + analyzeCharList());
    }else {
        return chars;
    }
}

function analyzeBooleanExpr(){
    outputMessage("Analyzing Boolean Expr");
    
    if(matchToken(analyzerCurrentToken, "boolean")){
        analyzeId();
    }
    
    if(matchToken(analyzerCurrentToken, "L_Paren")){
        getNextAnalyzerToken();
        
        analyzeExpr();
        
        if(matchToken(analyzerCurrentToken, "OP_Equality") || 
           matchToken(analyzerCurrentToken, "Not_Equal")){
            getNextAnalyzerToken();
            analyzeExpr();
        }
    }
}

function checkIfVariableExists(amIAlive){
    for(var michael = 0; michael < st.cur.symbol.length; michael++){
        if(amIAlive == st.cur.symbol[michael].getKind()){
            return st.cur.symbol[michael].getLine();
        }
    }
}

function createSymbolTable(table = "", scopeLevel){
    if(scopeLevel.symbol.length > 0){
        for(var currentSymbol = 0; scopeLevel.symbol.length; currentSymbol++){
            table += scopeLevel.symbol[currentSymbol].getKind()  +
                     scopeLevel.symbol[currentSymbol].getType()  +
                     scopeLevel.symbol[currentSymbol].getScope() + 
                     scopeLevel.symbol[currentSymbol].getLine();
        }
    }
    return table;
}

function setUsed(declaredId, scopeLevel){
    if((scopeLevel.parent != undefined || scopeLevel.parent != null) && scopeLevel.symbol.length > 0){
       for(var i = 0; i < scopeLevel.symbol.length; i++){
            if(declaredId == scopeLevel.symbol[i].getKind()){
                scopeLevel.symbol[i].used = true;
            }
        }
    }
}

function getVariableDetails(declaredId, scopeLevel){
    if((scopeLevel.symbol != undefined || scopeLevel.symbol != null) && scopeLevel.symbol.length > 0){
        for(var i = 0; i < scopeLevel.symbol.length; i++){
            if(declaredId == scopeLevel.symbol[i].getKind()){
                return scopeLevel.symbol[i].type;
            }
        }
    }
    if(scopeLevel.parent != undefined || scopeLevel.parent != null){
        return getVariableDetails(declaredId, scopeLevel.parent);
    }
}