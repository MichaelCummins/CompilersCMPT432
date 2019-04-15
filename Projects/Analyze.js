var analyzerTokens = [];
var analyzerCurrentToken;
var numAnalyzerErrors = 0;
var numAnalyzerWarnings = 0;
var scope = -1;
var scopeLevel = -1;
var analyzerScopeArray = [];
var scopeCounter = 0;
var addition = false;
var temporaryId = null;
var temporaryValue = null;
var temporaryType = null;
var ast = new Tree();
ast.addNode("root", "branch");
var symbolTree = new symbolTree();

function analyzerInit(){
    analyzerTokens = [];
    analyzerCurrentToken;
    numAnalyzerErrors = 0;
    numAnalyzerWarnings = 0;
    scope = -1;
    scopeLevel = -1;
    analyzerScopeArray = [];
    scopeCounter = 0;
    addition = false;
    temporaryId = null;
    temporaryValue = null;
    temporaryType = null;
    ast = new Tree();
    ast.addNode("root", "branch");
   // symbolTree = new symbolTree();
}

function getNextAnalyzerToken(){
    analyzerCurrentToken = analyzerTokens[0];
    analyzerTokens.shift();
}

function analyzerLookAhead(){
    return analyzerTokens[0];
}

function checkIfExists(id){
    for(var i = 0; i < symbolTree.cur.symbols.length; i++){
        if(id == symbolTree.cur.symbols[i].getKind()){
            return symbolTree.cur.symbols[i].getLine();
        }
    }
}

function getVarValue(id, level){
    if((level.parent != undefined || level.parent != null) && level.symbols.length > 0){
        for(var i = 0; i < level.symbols.length; i++){
            if(id == level.symbols[i].getKind() && currentProgram == level.symbols[i].programNumber){
                return level.symbols[i].value;
            }
        }
    }
}

function setVarValue(id, value, level){
    if((level.parent!= undefined || level.parent != null) && level.symbols.length > 0){
        for(var i = 0; i < level.symbols.length; i++){
            if(id == level.symbols[i].getKind()){
                level.symbols[i].initialized = true;
                level.symbols[i].value = value;
                var localScope = level.symbols[i].scope;
            }
        }
    }
    if(level.parent != undefined || level.parent != null){
        setVarValue(id, value, level.parent);
    }
    for(var i = 0; i < allSymbols.length; i++){
        if((id == allSymbols[i].getKind()) && (localscope == allSymbols[i].scope)){
            allSymbols[i].initialized = true;
            allSymbols[i].value = value;
        }
    }
}

function setUsed(id, level){
    if((level.parent != undefined || level.parent != null) && level.symbols.length > 0){
        for(var i = 0; i < level.symbols.length; i++){
            if(id == level.symbols[i].getKind()){
                level.symbols[i].utilized = true;
            }
        }
    }
    if(level.parent != undefined || level.parent != null){
        setUsed(id, level.parent);
    }
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
    scopeCounter++;
    analyzerScopeArray.push(scope);
    scope = scopeCounter;
    
    ast.addNode("Block", "branch");
    symbolTree.addNode("Scope: " + scope, "branch", scope);
    if(matchToken(analyzerCurrentToken, "L_Brace")){
        getNextAnalyzerToken();
    }
    analyzeStatementList();
    if(matchToken(analyzerCurrentToken, "R_Brace")){
        getNextAnalyzerToken();
    }
    
    scopeLevel--;
    scope = analyzerScopeArray.pop();
    symbolTree.endChildren();
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
    outputMessage("Analyze print statement");
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
        analyzeId();
    }
    
    if(matchToken(analyzerCurrentToken, "OP_Assignment")){
        getNextAnalyzerToken();
        analyzeExpr();
    }
    ast.endChildren();
}

function analyzeVarDecl(){
    outputMessage("Analyzing Var decl");
    ast.addNode("Var Decl", "branch");
    var type = analyzerCurrentToken.kind.toLowerCase();
    getNextAnalyzerToken();
    if(matchToken(analyzerCurrentToken, "id")){
        if(line = checkIfExists(analyzerCurrentToken.value)){
            numAnalyzerErrors++;
            outputMessage("Bad");
        }else{
            var symbol = new Symbol(analyzerCurrentToken.value, type, analyzerCurrentToken.currentLine, 
                                    scope, scopeLevel, currentProgram, 
                                    false, false, false);
            symbolTree.cur.symbols.push(symbol);
        }
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
        if(addition){
            if(temporaryValue == 0){
                temporaryValue = Number(getVarValue(analyzerCurrentToken.value, symbolTree.cur));
            }else{
                temporaryValue = Number(temporaryValue) + Number(getVarValue(analyzerCurrentToken.value, symbolTree.cur));
            }
            setVarValue(temporaryId, temporaryValue, symbolTree.cur);
            addition = false;
            temporaryId = null;
            temporaryType = null;
            temporaryValue = null;
        }else{
            setUsed(analyzerCurrentToken.value, symbolTree.cur);
        }
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