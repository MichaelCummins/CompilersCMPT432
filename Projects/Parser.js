//Declare global variables
var currentToken;
var tokens = [];
var numParseErrors = 0;
var programLevel = 0;
var programCounter = 1;
var braceCounter = 0;
var tree = new Tree();
tree.addNode("Root", "branch");
var booleanStatement = false;
var printStatement = false;

//Reset variables for each program
function initializeParser(){
    currentToken
    tokens = [];
    numParseErrors = 0;
    programLevel = 0;
    programCounter = 1;
    braceCounter = 0;
    tree = new Tree();
    tree.addNode("Root", "branch");
    booleanStatement = false;
    printStatement = false;
}

//Get the next token in the array
function getNextToken(){
    currentToken = tokens[0];
    tokens.shift();
}

//Look at the next Token
function lookAhead(){
    return tokens[0];
}

//Get what to parse from parameter and beging parsing
function parseStart(userInput){
    initializeParser();
    tokens = userInput;
    parseProgram();
    
    if(numParseErrors != 0){
        outputMessage("Parser failed with " + numParseErrors + " errors");
    }
    return numParseErrors;
}

//Parse program method
function parseProgram(){
    //If no tokens left, were done parsing
    if(tokens.length == 0){
        outputMessage("Parsing over");
        return;
    }
    //Get the next token
    getNextToken();
    //If the current program doesnt match the counter, output its a new program
    if(programLevel != programCounter){
        outputMessage("Parsing Program " + currentProgram);
        programCounter++;
    }
    //Output parser dialogue
    outputMessage("parseProgram()");
    //If we get what is expected 
    if(currentToken.kind == "L_Brace"){
        //Add program to the cst tree
        tree.addNode("Program", "branch");
        //Go to parse block
        parseBlock();    
    }else{
        //Else we got an error and alert the user
        parseErrorMessage("{");
        //Increment error count
        numParseErrors++;
    }
    //Climb back up the tree
    tree.endChildren();
    return;
}

function parseBlock(){
    //Output parsing path
    outputMessage("parseBlock()");
    
    //If we got a { they did good
    if(currentToken.kind == "L_Brace"){
        //Add block to the cst 
        tree.addNode("Block", "branch");
        //Increment brace counter
        braceCounter++;
        //Add leaf node for the bracket
        tree.addNode(currentToken.value, "leaf");
        //Get next token
        getNextToken();
        //Go to StatementList
        parseStatementList();
        //If we got a } its okay
    }else if(currentToken.kind == "R_Brace"){
        //Decrement?(sp) brace counter
        braceCounter--;
        //Add leaf node for }
        tree.addNode(currentToken.value, "leaf");
        //Get the next token
        getNextToken();
        //Climb the tree
        tree.endChildren();
        //If the token is an EOP and the braces are balanced
        //Its the end of the program
        if(currentToken.value == "$"  && (braceCounter == 0)){
            //Add leaf node for the EOP
            tree.addNode(currentToken.value, "leaf");
            //Increment to the next program
            programLevel++;
            //Climb up the tree
            tree.endChildren();
            //Go to start parsing the next program
            parseProgram();
        }else{
            //Climb up the tree
            tree.endChildren();
            //Go to statement list
            parseStatementList();
        }
        return;
    }else{
        //We got a uh-oh 
        //Alert user of error
        parseErrorMessage("}");
        //Increment error count
        numParseErrors++;
    }
    return;
}

function parseStatementList(){
    //Add branch node for statement list to cst
    tree.addNode("Statement List", "branch");
    //Output parser progress
    outputMessage("parseStatementList()");
    
    //Check if were exiting a block or going to a statement
    if(currentToken.kind == "R_Brace"){
        //Go back up if we got a brace
        tree.endChildren();
        //Go to block
        parseBlock();
        
        //Check if we got a statement starter
        //If we did, go to parse statement
    }else if(currentToken.kind == "print" || currentToken.kind == "id"
        || currentToken.kind == "int" || currentToken.kind == "string"
        || currentToken.kind == "boolean" || currentToken.kind == "while"
        || currentToken.kind == "if" || currentToken.kind == "L_Brace"){
        parseStatement();
        //Continue going through the token array
        while(currentToken.kind != "EOF"){
            getNextToken();
            parseStatementList();
        }
    }else{
        //Alert what we shouldve gotten
        //Increment number of parse errors
        parseErrorMessage("}, print, id, int, string, boolean, while, if, or {");
        numParseErrors++;
    }
    //Climb the tree
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
        parseErrorMessage("{");
        numParseErrors++;
    }else{
        parseErrorMessage("either print, id, int, string, boolean, while, if");
        numParseErrors++;
    }
    //tree.endChildren();
    tree.endChildren();
    return;
}

function parsePrintStatement(){
    outputMessage("parsePrintStatement()");
    tree.addNode("Print Statement", "branch");
    tree.addNode(currentToken.value, "leaf");
    getNextToken();
    printStatement = true;
    if(currentToken.kind == "L_Paren"){
        tree.addNode(currentToken.value, "leaf");
        paren();
    }else{
        parseErrorMessage("(");
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseAssignmentStatement(){
    outputMessage("parseAssignmentStatement()");
    tree.addNode("Assignment_Statement", "branch");
    if(currentToken.kind == "id"){
        parseId();
        getNextToken();
        if(currentToken.kind == "OP_Assignment"){
            getNextToken();
            parseExpr();
        }else{
            parseErrorMessage("OP_Assignment");
            numParseErrors++;
        }
    }else{
        parseErrorMessage("id");
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseVarDecl(){
    outputMessage("parseVarDecl()");
    tree.addNode("Variable_Declaration", "branch");
    tree.addNode(currentToken.value, "leaf");
    getNextToken();
    if(currentToken.kind == "id"){
        tree.addNode(currentToken.value, "leaf");
    }else{
        parseErrorMessage("id");
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
        parseErrorMessage("L_Paren");
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
        parseErrorMessage("L_Paren");
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseExpr(){
    outputMessage("parseExpr()");
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
        parseErrorMessage("either a digit, double quote, Left parenthesis, or an id");
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
        parseErrorMessage('"');
        numParseErrors++;
    }
    tree.endChildren();
    return;
}

function parseBooleanExpr(){
    outputMessage("parseBooleanExpr()");
    tree.addNode("Boolean Expression", "branch");
    if(currentToken.kind == "L_Paren"){
        booleanStatement = true;
        paren();
    }else{
        tree.addNode(currentToken.kind, "leaf");
    }
    tree.endChildren();
    return;
}

function parseId(){
    outputMessage("parseId()");
    tree.addNode("id", "branch");
    tree.addNode(currentToken.value, "leaf");
    tree.endChildren();
    return;
}

function parseCharlist(){
    outputMessage("parseCharList()");
    if(currentToken.kind == "char"){
        tree.addNode(currentToken.value, "leaf");
        getNextToken();
        parseCharlist();
    }else if(currentToken.kind == '"'){
        return;
    }else{
        parseErrorMessage();
        numParseErrors++;
    }
    return;
}

function paren(){
    if(booleanStatement){
        getNextToken();
        parseExpr();
        getNextToken();
        if(currentToken.kind == "OP_Equality" || currentToken.kind == "Not_Equal"){
            tree.addNode(currentToken.value, "leaf");
            getNextToken();
            parseExpr();
        }else{
            parseErrorMessage("Expected =");
            numParseErrors++;
        }
    }else if(printStatement){
        getNextToken();
        parseExpr();
    }
    if(numParseErrors){
        return;
    }
    getNextToken();
    if(currentToken.kind == "R_Paren"){
        if(booleanStatement){
            booleanStatement = false;
        }else if(printStatement){
            printStatement = false;
        }
        tree.addNode(currentToken.value, "leaf");
        return;
    }else{
        parseErrorMessage("R_Paren");
        numParseErrors++;
    }
    return;
}

function parseErrorMessage(convictedToken = ""){
    outputMessage("ERROR Unexpected Token: " + currentToken.value + " at line " + currentToken.currentLine);
    outputMessage("Expected " + convictedToken);

}