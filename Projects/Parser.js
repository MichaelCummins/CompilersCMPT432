//Declare global variables
var currentToken;
var tokens = [];
var numParseErrors = 0;
var tree = new Tree();
tree.addNode("Root", "Branch");

function initializeParse(){
    currentToken;
    tokens = [];
    numParseErrors = 0;
    tree = new Tree();
    tree.addNode("Root", "Branch");
}

function parseStart(userInput){
    tokens = userInput;
    parseProgram();
}

function parseProgram(){
    if(programLevel != programCounter){
        outputMessage("Parsing Program " + program);
        programCounter++;
    }
    if(currentToken == "L_Brace"){
        addNode("program", "branch");
        parseBlock();    
    }else{
        numParseErrors++;
    }
    matchAndConsume(EOF);
}

function parseBlock(){
    outputMessage("parseBlock()");
    addNode("block", "branch");
    matchAndConsume("{");
    parseStatementList();
    matchAndConsume("}");
    endChildren();
}

function parseStatementList(){
    outputMessage("parseStatementList()");
    addNode("Statement List", "branch");
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
    addNode("Statement", "branch");
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
    addNode("Print Statement", "branch");
    matchAndConsume("print");
    matchAndConsume("L_Paren");
    parseExpr();
    matchAndConsume("R_Paren");
    endChildren();
}

function parseAssignmentStatement(){
    outputMessage("parseAssignementStatement()");
    addNode("Assignment Statement", "branch");
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
    addNode("While Statement", "branch");
    matchAndConsume("while");
    parseBooleanExpr();
    parseBlock();
    endChildren();
}

function parseIfStatement(){
    outputMessage("parseIfStatement");
    addNode("If Statement", "branch");
    matchAndConsume("if");
    parseBooleanExpr;
    parseBlock;
    endChildren();
}

function parseExpr(){
    outputMessage("parseExpr")
    addNode("Expression", "branch");
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
    addNode("Int expression", "branch");
    parseDigit();
    parseIntOP();
    parseExpr();
    endChildren();
}

function parseStringExpr(){
    outputMessage("parseStringExpr()");
    addNode("String expression", "branch");
    matchAndConsume('"');
    parseCharlist();
    matchAndConsume('"');
    endChildren();
}

function parseBooleanExpr(){
    outputMessage("parseBooleanExpr()");
    addNode("Boolean Expression", "branch");
    matchAndConsume("L_Paren");
    parseExpr();
    parseBoolOP();
    parseExpr();
    matchAndConsume("R_Paren");
    endChildren();
}

function parseId(){
    outputMessage("parseId()");
    addNode("Id", "branch");
    parseChar();
    endChildren();
}

function parseCharlist(){
    outputMessage("parseCharList()");
    addNode("Char list", "branch");
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
    addNode("Type", "branch");
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
    addNode("Char", "branch");
    matchAndConsume();
    endChildren();
}

function parseSpace(){
    addNode("Space", "branch");
    matchAndConsume(" ");
    endChildren();
}

function parseDigit(){
    addNode("Digit", "branch");
    matchAndConsume();
    endChildren();
}

function parseBoolOP(){
    outputMessage("parseBoolOP()");
    addNode("Boolean Operation", "branch");
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
    addNode("Boolean Value", "branch");
    if(currentToken == "false"){
        matchAndConsume("false");
    }else{
        matchAndConsume("true");
    }
    endChildren();
}

function parseIntOP(){
    outputMessage("parseIntOP()");
    addNode("Int Operation");
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