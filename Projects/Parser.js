//Declare global variables
var currentToken;
var Tokens = [];
var numParseErrors;
var tree = new Tree();

tree.addNode("Root","Branch");


function parseStart(userInput){
    tokens = userInput;
    parseProgram();
}

function parseProgram(){
    parseBlock();
    matchAndConsume(EOF);
}

function parseBlock(){
    matchAndConsume("{");
    parseStatementList();
    matchAndConsume("}");
}

function parseStatementList(){
    if(parseStatement() && parseStatementList()){
        return true;
    }
    return false;
}

function parseStatement(){
    
    //Since a statement can be many things in our grammar check what it starts with
    //If it starts with the token PRINT its a print statement
    if(currentToken == "print"){
        //Go to print statement
        parsePrintStatement():
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
}

function parsePrintStatement(){
    matchAndConsume("print");
    matchAndConsume("L_Paren);
    parseExpr();
    matchAndConsume("R_Paren");
}

function parseAssignmentStatement(){
    parseId();
    matchAndConsume("=");
    parseExpr();
}

function parseVarDecl(){
    parseType();
    parseId();
}

function parseWhileStatement(){
    matchAndConsume("while");
    parseBooleanExpr();
    parseBlock();
}

function parseIfStatement(){
    matchAndConsume("iff");
    parseBooleanExpr;
    parseBlock;
}

function parseExpr(){
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
}

function parseIntExpr(){
    parseDigit();
    parseIntOP();
    parseExpr();
}

function parseStringExpr(){
    matchAndConsume('"');
    parseCharlist();
    matchAndConsume('"');
}

function parseBooleanExpr(){
    matchAndConsume("L_Paren");
    parseExpr();
    parseBoolOP();
    parseExpr();
    matchAndConsume("R_Paren");
}

function parseId(){
    parseChar();
}

function parseCharlist(){
    if(parsechar() && parseCharList()){
        return true;
    }else if(parseSpace() && parseCharlist{
        return true;
    }else{
        
    }
}

function parseType(){
    if(currentToken == "int"){
        matchAndConsume("int");
    }else if(currentToken == "string"){
        matchAndConsume("string");
    }else{
        matchAndConsume("boolean");
    }
}

function parseChar(){
    matchAndConsume();
}

function parseSpace(){
    matchAndConsume(" ");
}

function parseDigit(){
    matchAndConsume();
}

function parseBoolOP(){
    if(currentToken == "="){
        matchAndConsume("=");
        matchAndConsume("=");
    }else{
        matchAndConsume("!");
        matchAndConsume("=")
    }
}

function parseBoolVal(){
    if(currentToken == "false"){
        matchAndConsume("false");
    }else{
        matchAndConsume("true");
    }
}

function parseIntOP(){
    matchAndConsume("intop");
}
    
    
function matchAndConsume(expectedToken){
    returnValue = false;
    if(currentToken == expectedToken){
        returnValue = true;
    }
    return returnValue;
}