var ast = new Tree();
ast.addNode("Root", "Branch");
var symbolTree = new symbolTree();
var currentScope = 0;
var currentAnalyzerToken;
var analyzerTokens = [];
var numAnalyzerErrors = 0;
var numAnalyzerWarnings = 0;

function initializeAnalyzer(){
    ast = new Tree();
    ast.addNode("Root", "Branch");
    symbolTree = new symbolTree();
    currentScope = 0;
    currentAnalyzerToken;
    analyzerTokens = [];
}

function getNextAnalyzerToken(){
    currentAnalyzerToken = analyzerTokens[0];
    analyzerTokens.shift():
}

function checkNextAnalyzerToken(){
    return analyzerTokens[0];
}

function analyzerStart(userInput){
    initializeAnalyzer();
    analyzerTokens = userInput;
    analyzeProgram();
    
    if(numAnalyzerErrors){
        outputMessage("Semantic analysis failed with " + numAnalyzerErrors + " errors and " +
                      numAnalyzerWarnings + " warnings");
    }else{
        outputMessage("Semantic analysis passed");
    }
    
    return numAnalyzerErrors;
}

function analyzeProgram(){
    ast.addNode("Program", "branch");
    outputMessage("Analyzing program");
    getNextAnalyzerToken();
    analyzeBlock();
    if(matchToken(currentAnalyzerToken, "EOF")){
        getNextAnalyzerToken();
    }
    
    ast.endChildren();
}

function analyzeBlock(){
    currentScope++;
    outputMessage("Analyzing block");
    
    analyzeStatementList();
    
    if(matchToken(currentAnalyzerToken, "R_Brace")){
        getNextAnalyzerToken();
    }
    currentScope--;
    ast.endChildren();
}

function analyzeStatementList(){
    outputMessage("Analyzing Statement List");
    
    if(matchToken(currentAnalyzerToken, "R_Brace")){
        
    }else if(matchToken(currentAnalyzerToken, "PRINT") || matchToken(currentAnalyzerToken, "ID")
        || matchToken(currentAnalyzerToken, "INT")|| matchToken(currentAnalyzerToken, "STRING")
        || matchToken(currentAnalyzerToken, "Boolean")|| matchToken(currentAnalyzerToken, "WHILE")
        || matchToken(currentAnalyzerToken, "IF") || matchToken(currentAnalyzerToken, "L_Brace")){
        analyzeStatement();
        analyzeStatementList();
    }
}

function analyzeStatement(){
    if(matchToken(currentAnalyzerToken, "PRINT")){
        analyzePrintStatement();
    }else if(matchToken(currentAnalyzerToken, "ID")){
        analyzeAssignmentStatement();
    }else if(matchToken(currentAnalyzerToken, "INT") || matchToken(currentAnalyzerToken, "STRING")
            || matchToken(currentAnalyzerToken, "Boolean")){
        analyzeVarDecl();
    }else if(matchToken(currentAnalyzerToken, "WHILE")){
        analyzeWhileStatement();
    }else if(matchToken(currentAnalyzerToken, "IF")){
        analyzeIfStatement();
    }else if(matchToken(currentAnalyzerToken, "L_Brace")){
        analyzeBlock();
    }
}

function analyzePrintStatement(){
    outputMessage("Analyzing print statement");
    getNextAnalyzerToken();
    
    if(matchToken(currentAnalyzerToken, "L_Paren")){
        getNextAnalyzerToken();
    }
    analyzeExpr();
    
    if(matchToken(currentAnalyzerToken, "R_Paren")){
        getNextAnalyzerToken();
    }
    
    ast.endChildren();
}

function analyzeAssignmentStatement(){
    
}

function analyzeVarDecl(){
    
}

function analyzeWhileStatement(){
    
}

function analyzeIfStatement(){
    outputMessage("Analyzing if statement");
    getNextAnalyzerToken();
    if(matchToken(currentAnalyzerToken, "L_Paren") || matchToken(currentAnalyzerToken, "Boolean")){
        analyzeBooleanExpr();
        getNextAnalyzerToken();
        analyzeBlock();
    }
    ast.endChildren();
}

function analyzeExpr(){
    outputMessage("Analyzing expression");
    
    if(matchToken(currentAnalyzerToken, "DIGIT")){
        analyzeIntExpr();
    }else if(matchToken(currentAnalyzerToken, "Quote")){
        analyzeStringExpr();
    }else if(matchToken(currentAnalyzerToken, "L_Paren") || matchToken(currentAnalyzerToken, "Boolean")){
        analyzeBooleanExpr();
    }else if(matchToken(currentAnalyzerToken, "ID")){
        
    }
}

function analyzeIntExpr(){
    
}

function analyzeStringExpr(){
    
}

function analyzeBooleanExpr(){
    
}

function analyzeId(){
    
}

function analyzeCharList(){
    
}

