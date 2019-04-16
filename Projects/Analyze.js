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
        if((id == allSymbols[i].getKind()) && (localScope == allSymbols[i].scope)){
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

function getVarType(id, level){
    if((level.symbols != undefined || level.symbols != null) && level.symbols.length > 0){
        for(var i = 0; i < level.symbols.length; i++){
            if(id == level.symbols[i].getKind()){
                return level.symbols[i].type;
            }
        }
    }
    
    if(level.parent != undefined || level.parent != null){
        return getVarType(id, level.parent);
    }
}


function isThere(id, level){
    if((level.parent != undefined || level.parent != null) && level.symbols.length > 0){
        for(var i = 0; i < level.symbols.length; i++){
            if(id == level.symbols[i].getKind()){
                return true;
            }
        }
    }
    
    if(level.parent != undefined || level.parent != null){
        return isThere(id, level.parent);
    }
    return false;
}

function checkFor(str, num){
    if(analyzerTokens[num].kind == str){
        return true;
    }else if(analyzerTokens[num].kind == "R_Paren"){
        return false;
    }else if(analyzerTokens[num].kind == "L_Paren"){
        return false;
    }else{
        return checkFor(str, (num+1));
    }
}

function resetTemporaryVariables(){
    addition = false;
    temporaryId = null;
    temporaryType = null;
    temporaryValue = null;
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
        var id = analyzerCurrentToken.value;
        var type = getVarType(id, symbolTree.cur);
        if(type == undefined){
            numAnalyzerErrors++;
            outputMessage("Error, id " + id + " was not declared in scope " + scope);
        }
        if(!addition){
            temporaryId = id;
            try{
                temporaryType = type.toUpperCase();
            }catch(e){
                e.printstack;
                temporaryType = null;
            }
            addition = true;
            if(temporaryType == null || temporaryValue == undefined){
                temporaryValue = getVarValue(id, symbolTree.cur);
            }else{
                temporaryValue = Number(temporaryValue) + Number(getVarValue(id, symbolTree.cur));
            }
        }
        analyzeId();
    }
    if(matchToken(analyzerCurrentToken, "OP_Assignment")){
        getNextAnalyzerToken();
        if(addition){
            if(matchToken(analyzerCurrentToken, "digit")){
                if(temporaryType == "INT"){
                    if(analyzerLookAhead().kind != "intop"){
                        if(temporaryValue == 0){
                            temporaryValue = Number(analyzerCurrentToken.value);
                        }else{
                            temporaryValue = Number(temporaryValue) + Number(analyzerCurrentToken.value);
                        }
                        setVarValue(temporaryId, temporaryValue, symbolTree.cur);
                        resetTemporaryVariables()
                    }else{
                        resetTemporaryVariables()
                    }
                }else if(temporaryType == "BOOLEAN"){
                    if(Number(analyzerCurrentToken.value) > 0){
                        var t = true;
                    }else{
                        var t = false;
                    }
                    setVarValue(temporaryId, t, symbolTree.cur);
                    resetTemporaryVariables()
                }else{
                    numAnalyzerErrors++;
                    outputMessage("ERROR id " + temporaryId + " was given " + temporaryType + " but got int");
                }
            }else if(matchToken(analyzerCurrentToken, "id")){
                var cvType = getVarType(analyzerCurrentToken.value, symbolTree.cur);
                if(temporaryType.toLowerCase() != cvType){
                    numAnalyzerErrors++;
                    outputMessage("ERROR mismatched types " + id + " is defined as " + temporaryType + " was given  " + cvType);
                }
                
                if(temporaryValue == 0){
                    temporaryValue = getVarValue(analyzerCurrentToken.value, symbolTree.cur);
                }else{
                    temporaryValue = Number(temporaryValue) + Number(getVarValue(analyzerCurrentToken.value, symbolTree.cur));
                }
                setVarValue(temporaryId, temporaryValue, symbolTree.cur);
                resetTemporaryVariables()
            }else if(matchToken(analyzerCurrentToken, "boolean")){
                if(temporaryType == "BOOLEAN"){
                    var val;
                    if(analyzerCurrentToken.value == "true"){
                        val = true;
                    }else if(analyzerCurrentToken.value == "false"){
                        val = false;
                    }
                    setVarValue(temporaryId, val, symbolTree.cur);
                    resetTemporaryVariables()
                }else{
                    numAnalyzerErrors++;
                    outputMessage("ERROR id " + temporaryId + " was expting type " + temporaryType + " but was given boolean");
                }
            }
        }
        analyzeExpr();
    }
    ast.endChildren();
}

function analyzeVarDecl(){
    outputMessage("Analyze Var decl");
    ast.addNode("Var Decl", "branch");
    var type = analyzerCurrentToken.kind.toLowerCase();
    getNextAnalyzerToken();
    if(matchToken(analyzerCurrentToken, "id")){
        if(line = checkIfExists(analyzerCurrentToken.value)){
            numAnalyzerErrors++;
            outputMessage("ERROR id " + analyzerCurrentToken.value + " was previously declared" );
        }else{
            var symbol = new Symbol(analyzerCurrentToken.value, type, analyzerCurrentToken.currentLine, 
                                    scope, scopeLevel, currentProgram, 
                                    false, false, false);
            symbolTree.cur.symbols.push(symbol);
            allSymbols.push(symbol);
        }
        analyzeId();
    }
    ast.endChildren();
}

function analyzeWhileStatement(){
    outputMessage("Analyze While Statement");
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
    outputMessage("Analyze If Statement");
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
    outputMessage("Analyze Expr");
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
            resetTemporaryVariables()
        }else{
            setUsed(analyzerCurrentToken.value, symbolTree.cur);
        }
        analyzeId();
    }
}

function analyzeIntExpr(){
    outputMessage("Analyze Int Expr");
    
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
    outputMessage("Analyze String Expr");
    if(matchToken(analyzerCurrentToken, '"')){
        getNextAnalyzerToken();
    }
    
    var charList = analyzeCharList();
    
    ast.addNode(charList, "leaf");
    
    if(matchToken(analyzerCurrentToken, '"')){
        if(addition){
            if(temporaryType == "STRING"){
                setVarValue(temporaryId, charList, symbolTree.cur);
                resetTemporaryVariables()
            }else if(temporaryType == "BOOLEAN"){
                if(charList.length > 0){
                    var t = true;
                }else{
                    var t = false;
                }
                
                setVarValue(temporaryId, t, symbolTree.cur);
                resetTemporaryVariables()
            }else{
                numAnalyzerErrors++;
                outputMessage("ERROR id " + temporaryId + " was expecting " + temporaryType + " but was given String");
            }
        }
        getNextAnalyzerToken();
    }
}

function analyzeId(){
    if(matchToken(analyzerCurrentToken, "id")){
        if(!isThere(analyzerCurrentToken, symbolTree.cur)){
            numAnalyzerErrors++;
            outputMessage("ERROR id " + analyzerCurrentToken.value + " was used before it was declared");
        }
    }
    ast.addNode(analyzerCurrentToken.value, "leaf", analyzerCurrentToken.currentLine, scope, analyzerCurrentToken.kind);
    getNextAnalyzerToken();
}

function analyzeCharList(){
    outputMessage("Analyze Char List");
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
    outputMessage("Analyze Boolean Expr");
    
    if(matchToken(analyzerCurrentToken, "boolean")){
        analyzeId();
    }
    
    if(matchToken(analyzerCurrentToken, "L_Paren")){
        getNextAnalyzerToken();
        var closeOut = false;
        if(checkFor("OP_Equality", 0)){
            ast.addNode("Equality", "branch");
            closeOut = true;
        }else if(checkFor("Not_Equal", 0)){
            ast.addNode("Not_Equal", "branch");
            closeOut = true;
        }
        analyzeExpr();
        
        if(matchToken(analyzerCurrentToken, "OP_Equality") || 
           matchToken(analyzerCurrentToken, "Not_Equal")){
            getNextAnalyzerToken();
            analyzeExpr();
        }
        
        if(ast.cur.children.length >= 2){
            for(var i = 0; i <(ast.cur.children.length - 1); i++){
                if(ast.cur.children[i].kind == "id"){
                    var typeOne = getVarType(ast.cur.children[i].name, symbolTree.cur);
                    if(typeOne == "boolean"){
                        typeOne = "BOOL";
                    }else if(typeOne == "int"){
                        typeOne = "DIGIT";
                    }else if(typeOne == "string"){
                        typeOne = "CHARLIST";
                    }
                }else{
                    var typeOne = ast.cur.children[i].type;
                }
                
                if(ast.cur.children[i + 1].kind == "id"){
                    var typeTwo = getVarType(ast.cur.children[i + 1].name, symbolTree.cur);
                    if(typeTwo == "boolean"){
                        typeTwo = "BOOLEAN";
                    }else if(typeTwo == "int"){
                        typeTwo = "DIGIT";
                    }else if(typeTwo == "string"){
                        typeTwo = "CHARLIST";
                    }
                }else{
                    var typeTwo = ast.cur.children[i+1].type;
                }
                if(ast.cur.children[i].type == "id" && ast.cur.children[i + 1].type == "id"){
                    if(getVarType(ast.cur.children[i].name, symbolTree.cur) != getVarType(ast.cur.children[i+1].name, symbolTree.cur)){
                        numAnalyzerErrors++;
                        outputMessage("ERROR, can not compare id " + ast.cur.children[i].name + " to type " + getVarType(ast.cur.children[i+1].name));
                    }
                }
                if(ast.cur.children[i+1].type != "OP_Equality" && ast.cur.children[i+1] != "Not_Equal"){
                    if(typeOne != typeTwo){
                        numAnalyzerErrors++;
                        outputMessage("ERROR, id " + ast.cur.children[i].name + " can not be compared with " + typeTwo);
                    }
                }
            }
        }
        if(matchToken(analyzerCurrentToken, "R_Paren")){
            getNextAnalyzerToken();
        }
        
        if(closeOut){
            ast.endChildren();
        }
    }
}