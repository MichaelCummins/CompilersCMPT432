var generatedCode = [];
var numCodeGenErrors;
var tree;
var temporaryAddressOne = "T1";
var temporaryAddressOne = "T2";

function generate(theTree){
    generatedCode = [];
    numCodeGenErrors = 0;
    tree = theTree;
    
    codeGenStart();
    
}


function codeGenStart(){
    outputMessage("Code Gen Program " + currentProgram);
    traverseTree(ast.root, 0);
    
    document.getElementById("CodeGenOutput").value += generatedCode + "\n";
}

function traverseTree(position, depth){
    if(position.name == "root"){
        codeGenRoot(position.children, depth);
    }else if(position.name == "Program"){
        codeGenProgram(position.children, depth);
    }else if(position.name == "Block"){
        codeGenBlock(position, depth);
    }else if(position.name == "Var Decl"){
        codeGenVarDecl(position, depth);
    }else if(position.name == "Assignment Statment"){
        codeGenAssignment(position, depth);
    }else if(position.name == "Print Statement"){
        codeGenPrint(position, depth);
    }else if(position.name == "If Statement"){
        codeGenIf(position, depth);
    }else if(position.name == "While Statement"){
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
    for(var i = 0; i < position.children.length; i++){
        traverseTree(position.children[i], depth + 1);
    }
}

function codeGenAddition(position, depth){
    
}

function codeGenVarDecl(position, depth){
    addHex(loadTheAccumulatorWithConstant);
    addHex("00");
  //  var address = StaticData.add(position.children[0], position.scope);
    
    addHex(storeTheAccumulatorInMemory);
//    addHex(address);
    addHex("XX");
}

function codeGenAssignment(position, depth){
    traverseTree(position.children[i], depth);
   // var temporaryAddress = staticData.get(position.children[0], position.scope);
    addHex(storeTheAccumulatorInMemory);
  //  addHex(temporaryAddress);
    addHex("XX");
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
   // var temporaryAddress = staticData.get(position, position.scope);
    addHex(loadTheAccumlatorFromMemory);
  //  addHex(temporaryAddress);
    addHex("XX");
}

function codeGenDigit(position, depth){
    addHex(loadTheAccumulatorWithConstant);
}

function codeGenBoolean(position, depth){
    if(position.name == "true"){
        addHex(loadTheAccumulatorWithConstant);
        addHex("1");
    }else{
        addHex(loadTheAccumulatorWithConstant);
        addHex("0");
    }
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddressOne);
    addHex("XX");
    addHex(loadTheXRegisterWithConstant);
    addHex(printIntegerInYRegister);
    addHex(compareByteInMemoryToXRegister);
    addHex(temporaryAddressOne);
    addHex("XX");
}

function codeGenString(position, depth){
    addHex(loadTheAccumulatorWithConstant);
}

function addHex(val){
    generatedCode.push(val);
}
