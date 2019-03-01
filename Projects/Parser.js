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
    addNode("block", "branch");
    matchAndConsume("{");
    parseStatementList();
    matchAndConsume("}");
    endChildren();
}

function parseStatementList(){
    addNode("Statement List", "branch");
    if(parseStatement() && parseStatementList()){
        return true;
    }
    return false;
    endChildren();
}

function parseStatement(){
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
    addNode("Print Statement", "branch");
    matchAndConsume("print");
    matchAndConsume("L_Paren");
    parseExpr();
    matchAndConsume("R_Paren");
    endChildren();
}

function parseAssignmentStatement(){
    addNode("Assignment Statement", "branch");
    parseId();
    matchAndConsume("=");
    parseExpr();
    endChildren();
}

function parseVarDecl(){
    addToken("Variable Declaration", "branch");
    parseType();
    parseId();
    endChildren();
}

function parseWhileStatement(){
    addNode("While Statement", "branch");
    matchAndConsume("while");
    parseBooleanExpr();
    parseBlock();
    endChildren();
}

function parseIfStatement(){
    addNode("If Statement", "branch");
    matchAndConsume("if");
    parseBooleanExpr;
    parseBlock;
    endChildren();
}

function parseExpr(){
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
    addNode("Int expression", "branch");
    parseDigit();
    parseIntOP();
    parseExpr();
    endChildren();
}

function parseStringExpr(){
    addNode("String expression", "branch");
    matchAndConsume('"');
    parseCharlist();
    matchAndConsume('"');
    endChildren();
}

function parseBooleanExpr(){
    addNode("Boolean Expression", "branch");
    matchAndConsume("L_Paren");
    parseExpr();
    parseBoolOP();
    parseExpr();
    matchAndConsume("R_Paren");
    endChildren();
}

function parseId(){
    addNode("Id", "branch");
    parseChar();
    endChildren();
}

function parseCharlist(){
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
    addNode("Boolean Value", "branch");
    if(currentToken == "false"){
        matchAndConsume("false");
    }else{
        matchAndConsume("true");
    }
    endChildren();
}

function parseIntOP(){
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