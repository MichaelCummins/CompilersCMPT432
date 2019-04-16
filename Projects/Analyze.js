//Array for tokens
var analyzerTokens = [];
//Keep track of which token
var analyzerCurrentToken;
//Number of errors
var numAnalyzerErrors = 0;
//Number of warnigns
var numAnalyzerWarnings = 0;
//Which scope an ID is in
var scope = -1;
//Which level were in
var scopeLevel = -1;
var analyzerScopeArray = [];
//How deep the max is
var scopeCounter = 0;
//Whether were adding to something or not
var addition = false;
//All temporary values for adding
var temporaryId = null;
var temporaryValue = null;
var temporaryType = null;
//Declare Abstract Syntax Tree and Symbol Tree
var ast = new Tree();
ast.addNode("root", "branch");
var symbolTree = new symbolTree();

//Reset global variables at start of analyzing
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

//Same as parsing, just get next token
function getNextAnalyzerToken(){
    analyzerCurrentToken = analyzerTokens[0];
    analyzerTokens.shift();
}

//Same as parsing, look ahead for addition
function analyzerLookAhead(){
    return analyzerTokens[0];
}

//See if an id exists within the symbol Tree already
function checkIfExists(id){
    for(var i = 0; i < symbolTree.cur.symbols.length; i++){
        if(id == symbolTree.cur.symbols[i].getKind()){
            return symbolTree.cur.symbols[i].getLine();
        }
    }
}

//Get the value of an id from the symbol tree
function getVarValue(id, level){
    if((level.parent != undefined || level.parent != null) && level.symbols.length > 0){
        for(var i = 0; i < level.symbols.length; i++){
            if(id == level.symbols[i].getKind() && currentProgram == level.symbols[i].programNumber){
                return level.symbols[i].value;
            }
        }
    }
}

//Set the value of an id when adding
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

//Set that an id was used 
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

//Get the type of an id
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


//Check if an id is in the tree
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

//Reset all null values
function resetTemporaryVariables(){
    addition = false;
    temporaryId = null;
    temporaryType = null;
    temporaryValue = null;
}

//Start analying
function analyzerStart(userInput){
    analyzerInit();
    analyzerTokens = userInput;
    
    //Start at program
    analyzeProgram();
    
    //If any errors notify user
    if(numAnalyzerErrors != 0){
        outputMessage("Analyzer failed with " + numAnalyzerErrors + " errors");
    }
    
    //Return errors
    return numAnalyzerErrors;
}


function analyzeProgram(){
    //Add program to ast
    ast.addNode("Program", "branch");
    outputMessage("Analyze program");
    //Get next token
    getNextAnalyzerToken();
    //Can only go to block
    analyzeBlock();
    
    //If we get to a $ just go to the next
    if(analyzerCurrentToken.kind == "EOF"){
        getNextAnalyzerToken();
    }
    //Climb the tree
    ast.endChildren();
}

function analyzeBlock(){
    //Output where we are in the tree
    outputMessage("Analyze Block");
    //Increment scope
    scopeLevel++;
    scopeCounter++;
    analyzerScopeArray.push(scope);
    scope = scopeCounter;
    
    //Add block to the ast and symbolTree
    ast.addNode("Block", "branch");
    symbolTree.addNode("Scope: " + scope, "branch", scope);
    //Check if we got {
    if(matchToken(analyzerCurrentToken, "L_Brace")){
        getNextAnalyzerToken();
    }
    //Go to statement List
    analyzeStatementList();
    //Check if were at end of block
    if(matchToken(analyzerCurrentToken, "R_Brace")){
        getNextAnalyzerToken();
    }
    
    //Reduce current scope
    scopeLevel--;
    scope = analyzerScopeArray.pop();
    //Climb both trees
    symbolTree.endChildren();
    ast.endChildren();
}

function analyzeStatementList(){
    //Out where we are
    outputMessage("Analyze Statement List");
    
    //Epsilon product we are done
    if(matchToken(analyzerCurrentToken, "R_Brace")){
        //Epsilon
    }else if(matchToken(analyzerCurrentToken, "print") || matchToken(analyzerCurrentToken, "id")
        || matchToken(analyzerCurrentToken, "int") || matchToken(analyzerCurrentToken, "string")
        || matchToken(analyzerCurrentToken, "boolean") || matchToken(analyzerCurrentToken, "while")
        || matchToken(analyzerCurrentToken, "if") || matchToken(analyzerCurrentToken, "L_Brace")){
        //If anything else user did good
        analyzeStatement();
        analyzeStatementList();
    }
}

function analyzeStatement(){
    //Output where we are
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
    //Output where we are and add print to ast
    outputMessage("Analyze print statement");
    ast.addNode("Print", "Branch");
    //Get next token
    getNextAnalyzerToken();
    
    //Check if we got what we ned
    if(matchToken(analyzerCurrentToken, "L_Paren")){
        getNextAnalyzerToken();
    }
    
    //Go to expr
    analyzeExpr();
    
    //Check if at end of statement
    if(matchToken(analyzerCurrentToken, "R_Paren")){
        getNextAnalyzerToken();
    }
    
    //Climb tree
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
    //Output where we are and add vardecl to ast
    outputMessage("Analyze Var decl");
    ast.addNode("Var Decl", "branch");
    //Create variable to get what class a var is 
    var type = analyzerCurrentToken.kind.toLowerCase();
    //Grab next token
    getNextAnalyzerToken();
    //Did we get an id?
    if(matchToken(analyzerCurrentToken, "id")){
        //See if a variable of the same name is already in the symbol tree
        if(line = checkIfExists(analyzerCurrentToken.value)){
            //Increment error count and output error
            numAnalyzerErrors++;
            outputMessage("ERROR id " + analyzerCurrentToken.value + " was previously declared" );
        }else{
            //Create new symbol and push 
            var symbol = new Symbol(analyzerCurrentToken.value, type, analyzerCurrentToken.currentLine, 
                                    scope, scopeLevel, currentProgram, 
                                    false, false, false);
            symbolTree.cur.symbols.push(symbol);
            allSymbols.push(symbol);
        }
        //Go to ID
        analyzeId();
    }
    //Climb the tree
    ast.endChildren();
}

function analyzeWhileStatement(){
    //Output where we are and add to ast
    outputMessage("Analyze While Statement");
    ast.addNode("While Statement", "branch");
    
    //Grab next token
    getNextAnalyzerToken();
    
    //Same as Parser zzz
    if(matchToken(analyzerCurrentToken, "L_Paren") || matchToken(analyzerCurrentToken, "boolean")){
        analyzeBooleanExpr();
        getNextAnalyzerToken();
        analyzeBlock();
    }
    //Climb the tree
    ast.endChildren();
}

function analyzeIfStatement(){
    //Out where we are and at to ast
    outputMessage("Analyze If Statement");
    ast.addNode("If Statement", "branch");
    //Grab next token
    getNextAnalyzerToken();
    
    //
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