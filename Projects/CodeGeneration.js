var generatedCode = [];
var numCodeGenErrors;
var tree;
var temporaryAddressOne = "T1";
var temporaryAddressOne = "T2";

function generate(ast){
    generatedCode = [];
    numCodeGenErrors = 0;
    tree = ast;
    
    codeGenStart();
    
}


function codeGenStart(){
    outputMessage("Code Gen Program " + currentProgram);
    traverseTree(ast.root, 0);
}

function traverseTree(position, depth){
    
}

function codeGenRoot(){
    
}

function codeGenProgram(){
    
}

function codeGenBlock(position, depth){
    
}

function codeGenAddition(position, depth){
    
}

function codeGenVarDecl(position, depth){
    
}

function codeGenAssignment(position, depth){
    
}

function codeGenPrint(position, depth){
    
}

function codeGenWhile(position, depth){
    
}

function codeGenIf(position, depth){
    
}

function codeGenNotEquals(position, depth){
    
}

function codeGenIsEquals(position, depth){
    
}

function codeGenId(position, depth){
    
}

function codeGenDigit(position, depth){
    
}

function codeGenBoolean(position, depth){
    
}

function codeGenString(position, depth){
    
}
