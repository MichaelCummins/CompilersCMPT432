var analyzerTokens = [];
var analyzerCurrentToken;
var numAnalyzerErrors = 0;
var numAnalyzerWarnings = 0;
var ast = new Tree();
ast.addNode("root", "branch");

function analyzerInit(){
    analyzerTokens = [];
    analyzerCurrentToken;
    numAnalyzerErrors = 0;
    numAnalyzerWarnings = 0;
    ast = new Tree();
    ast.addNode("root", "branch");
}

function getNextAnalyzerToken(){
    analyzerCurrentToken = analyzerTokens[0];
    analyzerTokens.shift();
}

function analyzerStart(userInput){
    analyzerInit();
    analyzerTokens = userInput;
    analyzeProgram();
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
    ast.addNode("Block", "branch");
    
    if(matchToken(analyzerCurrentToken, "L_Brace")){
        getNextAnalyzerToken();
    }
    
    analyzeStatementList();
    
    if(matchToken(analyzerCurrentToken, "R_Brace")){
        getNextAnalyzerToken();
    }
    
    ast.endChildren();
}

function analyzeStatementList(){
    outputMessage("Analyze Statement List");
    
    if(matchToken(analyzerCurrentToken, "R_Brace")){
        //Epsilon
    }else if(matchToken(currentToken, "print") || matchToken(currentToken, "id")
        || matchToken(currentToken, "int") || matchToken(currentToken, "string")
        || matchToken(currentToken, "boolean") || matchToken(currentToken, "while")
        || matchToken(currentToken, "if") || matchToken(currentToken, "L_Brace")){
        analyzeStatement();
        analyzeStatementList();
    }
}

function analyzeStatement(){
    outputMessage("Analyze Statement");
        //Since a statement can be many things in our grammar check what it starts with
        //If it starts with the token PRINT its a print statement
    if(matchToken(currentToken, "print")){
        //Go to print statement
    //    analyzePrintStatement();
        //If its an id it goes to assignment 
    }else if(matchToken(currentToken, "id")){
        //Go to assignment statement
   //     analyzeAssignmentStatement();
        //If it starts with int string or boolean it is a variable declaration
    }else if(matchToken(currentToken, "int") || matchToken(currentToken, "string") || 
             matchToken(currentToken, "boolean")){
        //Go to variable declaration
  //      analyzeVarDecl();
        //If it is while it is the start of a while statement
    }else if(matchToken(currentToken, "while")){
        //Go to while statement
     //   analyzeWhileStatement();
        //If it is if it is the start of an if statement
    }else if(matchToken(currentToken, "if")){
        //Go to if statement
  //      analyzeIfStatement();
        //If anything else, parse as a block statment
    }else if(matchToken(currentToken, "L_Brace")){
        analyzeBlock();
    }
}

function analyzePrintStatement(){
    outputMessage("Analyzing print statement");
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
    if(matchToken(analyzerCurrentToken, "id")){
        
    }
}

function analyzeVarDecl(){
    outputMessage("Analyzing Var decl");
    getNextAnalyzerToken();
    
    ast.endChildren();
}

function analyzeWhileStatement(){
    outputMessage("Analyzing While Statement");
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
        analyzeId();
    }
}

function analyzeIntExpr(){
    outputMessage("Analyzing Int Expr");
    
    if(matchToken(LookAheadAnalyzerTokens, "+")){
        //Add branch for addition
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
}

function analyzeId(){
    if(matchToken(analyzerCurrentToken, "id")){
        //if (checkIfDefined)
        // error++
    }
    
    getNextAnalyzerToken();
}

function analyzeCharList(){
    outputMessage("Analyzing Char List");
    if(matchToken(analyzerCurrentToken, '"')){
        return "";
    }
    
    var charList = analyzerCurrentToken.value;
    
    getNextAnalyzerToken();
    
    if(matchToken(analyzerCurrentTokenm, "char")){
        return (charList + analyzeCharList());
    }else {
        return charList;
    }
}

function analyzeBooleanExpr(){
    outputMessage("Analyzing Boolean Expr");
    
    if(matchToken(analyzerCurrentToken, "boolean")){
        analyzeId();
    }
}