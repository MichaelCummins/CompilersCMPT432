//Declare global variables
var currentToken;
var tokens = [];
var numParseErrors = 0;
var programLevel = 0;
var programCounter = 1;
var braceCounter = 0;
var tree = new Tree();
tree.addNode("Root", "branch");

function initializeParser(){
    currentToken
    tokens = [];
    numParseErrors = 0;
    programLevel = 0;
    programCounter = 1;
    braceCounter = 0;
    tree = new Tree();
    tree.addNode("Root", "branch");
}

function getNextToken(){
    currentToken = tokens[0];
    tokens.shift();
}

function lookAhead(){
    return tokens[0];
}

function parseStart(userInput){
    initializeParser();
    tokens = userInput;
    parseProgram();
    
    if(numParseErrors != 0){
        outputMessage("Parser failed with " + numParseErrors + " errors");
    }
    return numParseErrors;
}

function parseProgram(){
    if(tokens.length == 0){
        outputMessage("Parsing over");
        return;
    }
    getNextToken();
    if(programLevel != programCounter){
        outputMessage("Parsing Program " + programCounter);
        programCounter++;
    }    
    outputMessage("parseProgram()");
    if(currentToken.kind == "L_Brace"){
        tree.addNode("Program", "branch");
        parseBlock();    
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseBlock(){
    outputMessage("parseBlock()");
    if(currentToken.kind == "L_Brace"){
        tree.addNode("block", "branch");
        braceCounter++;        
        getNextToken();
        parseStatementList();
    }else if(currentToken.kind == "R_Brace"){
        braceCounter--;        
        getNextToken();
        tree.endChildren();
        if(currentToken.kind == "EOF" && braceCounter == 0){
            programLevel++;
            tree.endChildren();
            parseProgram();
        }else{
            tree.endChildren();
            parseStatementList();
        }
        return;
    }else{
        numParseErrors++;
    }
    return;
}

function parseStatementList(){
    tree.addNode("Statement List", "branch");
    outputMessage("parseStatementList()");
    if(currentToken.kind == "R_Brace"){
        tree.endChildren();
        parseBlock();
    }else if(currentToken.kind == "print" || currentToken.kind == "Id"
        || currentToken.kind == "int" || currentToken.kind == "string"
        || currentToken.kind == "boolean" || currentToken.kind == "while"
        || currentToken.kind == "if" || currentToken.kind == "L_Brace"){
        parseStatement();
        while(currentToken.kind != "EOP"){
            getNextToken();
            parseStatementList();
        }
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseStatement(){
    outputMessage("parseStatement()");
    tree.addNode("Statement", "branch");
    //Since a statement can be many things in our grammar check what it starts with
    //If it starts with the token PRINT its a print statement
    if(currentToken.kind == "print"){
        //Go to print statement
        parsePrintStatement();
    //If its an id it goes to assignment 
    }else if(currentToken.kind == "id"){
        //Go to assignment statement
        parseAssignmentStatement();
    //If it starts with int string or boolean it is a variable declaration
    }else if(currentToken.kind == "int" || currentToken.kind == "string" || currentToken.kind == "boolean"){
        //Go to variable declaration
        parseVarDecl();
    //If it is while it is the start of a while statement
    }else if(currentToken.kind == "while"){
        //Go to while statement
        parseWhileStatement();
    //If it is if it is the start of an if statement
    }else if(currentToken.kind == "if"){
        //Go to if statement
        parseIfStatement();
    //If anything else, parse as a block statment
    }else if(currentToken.kind == "L_Brace" && braceCounter != 0 || currentToken.kind == "R_Brace"){
        tree.endChildren();
        //Go to block statement
        parseBlock();
    }else if(currentToken.kind == "L_Brace" && braceCounter == 0){
        numParseErrors++;
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    tree.endChildren();
    return;
}

function parsePrintStatement(){
    outputMessage("parsePrintStatement()");
    tree.addNode("Print Statement", "branch");
    getNextToken();
    if(currentToken.kind == "L_Paren"){
        parseExpr();
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseAssignmentStatement(){
    outputMessage("parseAssignementStatement()");
    tree.addNode("Assignment Statement", "branch");
    if(currentToken.kind == "id"){
        parseId();
        getNextToken();
        if(currentToken.kind == "OP_Assignment"){
            getNextToken();
            parseExpr();
        }else{
            numParseErrors++;
        }
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseVarDecl(){
    outputMessage("parseVarDecl()");
    tree.addToken("Variable Declaration", "branch");
    tree.addNode(currentToken.value, "leaf");
    getNextToken();
    if(currentToken.kind == "id"){
        tree.addNode(currentToken.value, "leaf");
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseWhileStatement(){
    outputMessage("parseWhileStatement()");
    tree.addNode("While Statement", "branch");
    tree.addNode(currentToken.value, "leaf");
    getNextToken();
    if(currentToken.kind == "L_Paren"){
        parseBooleanExpr();
        getNextToken();
        parseBlock();
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseIfStatement(){
    outputMessage("parseIfStatement");
    tree.addNode("If Statement", "branch");
    tree.addNode(currentToken.value, "leaf");
    getNextToken();
    if(currentToken.kind == "L_Paren"){
        parseBooleanExpr();
        getNextToken();
        parseBlock();
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseExpr(){
    outputMessage("parseExpr")
    tree.addNode("Expression", "branch");
    if(currentToken.kind == "digit"){
       parseIntExpr();
    }else if(currentToken.kind == '"'){
       parseStringExpr();
    }else if(currentToken.kind == "L_Paren" || currentToken.kind == "boolean"){
        parseBooleanExpr();
    }else if(currentToken.kind == "id"){
        parseId();
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseIntExpr(){
    outputMessage("parseIntExpr()");
    tree.addNode("Int expression", "branch");
    tree.addNode(currentToken.value, "leaf");
    if(lookAhead().kind == "intop"){
        getNextToken();
        tree.addNode(currentToken.value, "leaf");
        getNextToken();
        parseExpr();
        tree.endChildren();
        return;
    }else{
        tree.endChildren();
        return;
    }
}

function parseStringExpr(){
    outputMessage("parseStringExpr()");
    tree.addNode("String expression", "branch");
    tree.addNode(currentToken.value, "leaf");
    getNextToken();
    tree.addNode("Char List", "branch");
    parseCharlist();
    if(currentToken.kind == '"'){
        tree.endChildren();
        tree.addNode(currentToken.value, "leaf");
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseBooleanExpr(){
    outputMessage("parseBooleanExpr()");
    tree.addNode("Boolean Expression", "branch");
    if(currentToken.kind == "L_Paren"){
        tree.addNode(currentToken.kind, "leaf");
    }else{
        tree.addNode(currentToken.kind, "leaf");
    }
    tree.endChildren();
    return;
}

function parseId(){
    outputMessage("parseId()");
    tree.addNode("Id", "branch");
    tree.addNode(currentToken.value, "leaf");
    tree.endChildren();
    return;
}

function parseCharlist(){
    outputMessage("parseCharList()");
    tree.addNode("Char list", "branch");
    if(currentToken.kind == "char"){
        tree.addNode(currentToken.value, "leaf");
        getNextToken();
        parseCharlist();
    }else if(currentToken.kind == '"'){
        return;
    }else{
        numParseErrors++;
    }
    return;
}

function parseType(){
    outputMessage("parseType");
    tree.addNode("Type", "branch");
    if(currentToken.kind == "int"){
        matchAndConsume("int");
    }else if(currentToken.kind == "string"){
        matchAndConsume("string");
    }else{
        matchAndConsume("boolean");
    }
    endChildren();
}

function parseChar(){
    tree.addNode("Char", "branch");
    matchAndConsume();
    endChildren();
}

function parseSpace(){
    tree.addNode("Space", "branch");
    matchAndConsume(" ");
    endChildren();
}

function parseDigit(){
    tree.addNode("Digit", "branch");
    matchAndConsume();
    endChildren();
}

function parseBoolOP(){
    outputMessage("parseBoolOP()");
    tree.addNode("Boolean Operation", "branch");
    if(currentToken.kind == "="){
        matchAndConsume("=");
        matchAndConsume("=");
    }else{
        matchAndConsume("!");
        matchAndConsume("=")
    }
    endChildren();
}

function parseBoolVal(){
    outputMessage("parseBoolVal()");
    tree.addNode("Boolean Value", "branch");
    if(currentToken.kind == "false"){
        matchAndConsume("false");
    }else{
        matchAndConsume("true");
    }
    endChildren();
}

function parseIntOP(){
    outputMessage("parseIntOP()");
    tree.addNode("Int Operation");
    matchAndConsume("intop");
    endChildren();
}
    
    
function matchAndConsume(expectedToken){
    returnValue = false;
    if(currentToken.kind == expectedToken){
        returnValue = true;
    }
    return returnValue;
}