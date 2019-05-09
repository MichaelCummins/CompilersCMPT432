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
    if(position.name == "root"){
        codeGenRoot(position.children, depth);
    }else if(position.name == "program"){
        codeGenProgram(position.cildren, depth);
    }else if(position.name == "block"){
        codeGenBlock(position, depth);
    }else if(position.name == "vardecl"){
        codeGenVarDecl(position, depth);
    }else if(position.name == "assignment"){
        codeGenAssignment(position, depth);
    }else if(position.name == "print"){
        codeGenPrint(position, depth);
    }else if(position.name == "if"){
        codeGenIf(position, depth);
    }else if(position.name == "while"){
        codeGenWhile(position. depth);
    }else if(position.name == "isEquals"){
        codeGenIsEquals(position, depth);
    }else if(position.name == "notEquals"){
        codeGenNotEquals(position, depth);
    }else if(position.name == "true" || position.name == "false"){
        codeGenBoolean(position, depth);
    }else if(position.kind == "charlist"){
        codeGenString(position, depth);
    }else if("abcdefghijklmnopqrstuvwxyz".includes(position.name)){
        codeGenId(position, depth);
    }else if("0123456789"){
        codeGenDigit(position, depth);
    }else if(position.name == "intop"){
        return codeGenAddition(position, depth);
    }else{
        for(var i = 0; i < position.children.length; i++){
            traverseTree(position.children[i], depth);
        }
    }
}

function codeGenRoot(position, depth){
    for(var i = 0; i < position.length; i++){
        traverseTree(position[i], depth);
    }
}

function codeGenProgram(position, depth){
    for(var i = 0; i < position.length; i++){
        traverseTree(position[i], depth);
    }
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
