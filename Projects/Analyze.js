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
    
}

function analyzeBlock(){
    
}

function analyzeStatementList(){
    
}

function analyzeStatement(){
    
}

function analyzePrintStatement(){
    
}

function analyzeAssignmentStatement(){
    
}

function analyzeVarDecl(){
    
}

function analyzeWhileStatement(){
    
}

function analyzeIfStatement(){
    
}

function analyzeExpr(){
    
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

