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
    if(currentToken == "print"){
        parsePrintStatement():
    }else if(currentToken == "Assignment"){
        parseAssignmentStatement();
    }else if(currentToken == "VarDecl"){
        parseVarDecl();
    }else if(currentToken == "while"){
        parseWhileStatement();
    }else if(currentToken == "if"){
        parseIfStatement();
    }else{
        parseBlock();
    }
}

function parsePrintStatement(){
    matchAndConsume("print");
    matchAndConsume("(");
    parseExpr();
    matchAndConsume(")");
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
    matchAndConsume("if");
    parseBooleanExpr;
    parseBlock;
}

function parseExpr(){
    if(currentToken == digit???){
       parseIntExpr();
    }else if(currentToken == '"'){
       parseStringExpr();
    }else if(currentToken == "("){
        parseBooleanExpr();
    }else{
        parseId();
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
    matchAndConsume("(");
    parseExpr();
    parseBoolOP();
    parseExpr();
    matchAndConsume(")");
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
    if(matchAndConsume("int") || matchAndConsume("string") || matchAndConsume("boolean")){
        return true;
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
    matchAndConsume("+");
}
    
    
function matchAndConsume(expectedToken){
    returnValue = false;
    if(currentToken == expectedToken){
        returnValue = true;
    }
    return returnValue;
}