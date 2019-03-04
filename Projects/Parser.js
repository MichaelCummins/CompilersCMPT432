//Declare global variables
var currentToken;
var tokens = [];
var numParseErrors = 0;
var programLevel = 0;
var programCounter = 0;
var tree = new Tree();
tree.addNode("Root", "branch");

function initializeParser(){
    currentToken;
    tokens = [];
    numParseErrors = 0;
    var programLevel = 0;
    var programCounter = 0;
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
    outputMessage(tokens);
    getNextToken();
    outputMessage(tokens);
    outputMessage("parseProgram()");
    if(programLevel != programCounter){
        outputMessage("Parsing Program " + program);
        programCounter++;
    }    
    if(currentToken.kind == "L_Brace"){
        tree.addNode("Program", "branch");
        //parseBlock();    
    }else{
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseBlock(){
    outputMessage("parseBlock()");
    tree.addNode("block", "branch");
    matchAndConsume("{");
    parseStatementList();
    matchAndConsume("}");
    endChildren();
}

function parseStatementList(){
    outputMessage("parseStatementList()");
    tree.addNode("Statement List", "branch");
    if(currentToken.kind == "R_Brace"){
        tree.endChildren();
        parseBlock();
    }else if(currentToken.kind == "print" || currentToken.kind == "Id"
        || currentToken.kind == "int" || currentToken.kind == "string"
        || currentToken.kind == "boolean" || currentToken.kind == "while"
        || currentToken.kind == "if" || currentToken.kind == "L_Brace"){
        parseStatement();
        while(currentToken.kind != "EOP"){
            //getToken();
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
    if(currentToken == "print"){
        //Go to print statement
        parsePrintStatement();
    //If its an id it goes to assignment 
    }else if(currentToken == "id"){
        //Go to assignment statement
        parseAssignmentStatement();
    //If it starts with int string or boolean it is a variable declaration
    }else if(currentToken == "int" || currentToken == "string" || currentToken == "boolean"){
        //Go to variable declaration
        parseVarDecl();
    //If it is while it is the start of a while statement
    }else if(currentToken == "while"){
        //Go to while statement
        parseWhileStatement();
    //If it is if it is the start of an if statement
    }else if(currentToken == "if"){
        //Go to if statement
        parseIfStatement();
    //If anything else, parse as a block statment
    }else{
        //Go to block statement
        parseBlock();
    }
    endChildren();
}

function parsePrintStatement(){
    outputMessage("parsePrintStatement()");
    tree.addNode("Print Statement", "branch");
    matchAndConsume("print");
    matchAndConsume("L_Paren");
    parseExpr();
    matchAndConsume("R_Paren");
    endChildren();
}

function parseAssignmentStatement(){
    outputMessage("parseAssignementStatement()");
    tree.addNode("Assignment Statement", "branch");
    parseId();
    matchAndConsume("=");
    parseExpr();
    endChildren();
}

function parseVarDecl(){
    outputMessage("parseVarDecl()");
    addToken("Variable Declaration", "branch");
    parseType();
    parseId();
    endChildren();
}

function parseWhileStatement(){
    outputMessage("parseWhileStatement()");
    tree.addNode("While Statement", "branch");
    matchAndConsume("while");
    parseBooleanExpr();
    parseBlock();
    endChildren();
}

function parseIfStatement(){
    outputMessage("parseIfStatement");
    tree.addNode("If Statement", "branch");
    matchAndConsume("if");
    parseBooleanExpr;
    parseBlock;
    endChildren();
}

function parseExpr(){
    outputMessage("parseExpr")
    tree.addNode("Expression", "branch");
    if(currentToken == "digit"){
       parseIntExpr();
    }else if(currentToken == '"'){
       parseStringExpr();
    }else if(currentToken == "R_Paren" || currentToken == "boolean"){
        parseBooleanExpr();
    }else if(currentToken == "id"){
        parseId();
    }else{
        numParseErrors++;
    }
    endChildren();
}

function parseIntExpr(){
    outputMessage("parseIntExpr()");
    tree.addNode("Int expression", "branch");
    parseDigit();
    parseIntOP();
    parseExpr();
    endChildren();
}

function parseStringExpr(){
    outputMessage("parseStringExpr()");
    tree.addNode("String expression", "branch");
    matchAndConsume('"');
    parseCharlist();
    matchAndConsume('"');
    endChildren();
}

function parseBooleanExpr(){
    outputMessage("parseBooleanExpr()");
    tree.addNode("Boolean Expression", "branch");
    matchAndConsume("L_Paren");
    parseExpr();
    parseBoolOP();
    parseExpr();
    matchAndConsume("R_Paren");
    endChildren();
}

function parseId(){
    outputMessage("parseId()");
    tree.addNode("Id", "branch");
    parseChar();
    endChildren();
}

function parseCharlist(){
    outputMessage("parseCharList()");
    tree.addNode("Char list", "branch");
    if(parsechar() && parseCharList()){
        return true;
    }else if(parseSpace() && parseCharlist){
        return true;
    }else{
        
    }
    endChildren();
}

function parseType(){
    outputMessage("parseType");
    tree.addNode("Type", "branch");
    if(currentToken == "int"){
        matchAndConsume("int");
    }else if(currentToken == "string"){
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
    if(currentToken == "="){
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
    if(currentToken == "false"){
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
    if(currentToken == expectedToken){
        returnValue = true;
    }
    return returnValue;
}