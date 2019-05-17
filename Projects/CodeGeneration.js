var generatedCode = [];
var numCodeGenErrors;
var tree;
var temporaryAddressOne = "X1";
var temporaryAddressTwo = "X2";
var heap = [];
var truePlaceholder;
var falsePlaceholder;
var staticData = new StaticData();
var jumpTable = new jump();
var generatedCodeString = "";
var strings = new stringTable();
var heapAddress = 256;

function generate(theTree){
    generatedCode = [];
    numCodeGenErrors = 0;
    tree = theTree;
    staticData = new StaticData();
    jumpTable = new jump();
    strings = new stringTable();
    heapAddress = 256;
    heap = [];
    codeGenStart();
    
    generatedCodeString = generatedCode.join(' ');
    return generatedCodeString;
}

function numToHex(value){
    return pad(toHexidecimal(parseInt(value)), 2, '0').toUpperCase();
}

function toHexidecimal(string){
    return string.toString(16);
}

function pad(word, size, padder){
    var paddedWord = "" + word;
    while(paddedWord.length < size){
        paddedWord = padder + paddedWord;
    }
    return paddedWord;
}

function charsToHex(value){
    return pad(toHexidecimal(value.charCodeAt(0)), 2, "0").toUpperCase();
}

function codeGenStart(){
    outputMessage("Code Gen Program " + currentProgram);
    truePlaceholder = addToHeap('true');
    falsePlaceholder = addToHeap('false');
    traverseTree(ast.root, 0);
    
    
    
    var newAddressOne = numToHex(generatedCode.length + staticData.length());
    if(generatedCode.includes(temporaryAddressOne)){
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == temporaryAddressOne){
                generatedCode[i] = newAddressOne;
            }
        }
    }
    
    var newAddressTwo = numToHex(generatedCode.length + staticData.length() + 1);
    if(generatedCode.includes(temporaryAddressTwo)){
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == temporaryAddressTwo){
                generatedCode[i] = newAddressTwo;
            }
        }
    }
    
    for(var key in staticData.variables){
        var newAddress = numToHex(generatedCode.length + staticData.variables[key].offset);
        var temporaryAddress = staticData.variables[key].address;
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == temporaryAddress){
                generatedCode[i] = newAddress;
            }
        }
    }
    
    for(var key in jumpTable.variables){
        var start = jumpTable.variables[key].initialAddress;
        var end = jumpTable.variables[key].endingAddress;
        
        var move = numToHex(end - start - 2);
        
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == key){
                generatedCode[i] = move;
            }
        }
    }

    
    if(generatedCode.includes("XX")){
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == "XX"){
                generatedCode[i] = "00";
            }
        }
    }
    
    
    for(var i = generatedCode.length; i < 256 - heap.length; i++){
        generatedCode.push("00");
    }
    
    for(var i = 0; i < heap.length; i++){
        generatedCode.push(heap[i]);
    }
    
    
    if(generatedCode.length > 256){
        numCodeGenErrors++;
        outputMessage("ERROR memory exceeded " + generatedCode.length + " 256");
    }
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
    }else if(position.name == "Assignment Statement"){
        codeGenAssignment(position, depth);
    }else if(position.name == "Print Statement"){
        codeGenPrint(position, depth);
    }else if(position.name == "If Statement"){
        codeGenIf(position, depth);
    }else if(position.name == "While Statement"){
        codeGenWhile(position, depth);
    }else if(position.name == "Equality"){
        codeGenIsEquals(position, depth);
    }else if(position.name == "Not_Equal"){
        codeGenNotEquals(position, depth);
    }else if(position.name == "true" || position.name == "false"){
        codeGenBoolean(position, depth);
    }else if(position.type == "Charlist"){
        codeGenString(position, depth);
    }else if("abcdefghijklmnopqrstuvwxyz".includes(position.name)){
        codeGenId(position, depth);
    }else if("0123456789"){
        codeGenDigit(position, depth);
    }else if(position.name == "Addition"){
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
    traverseTree(position.children, depth);
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddressOne);
    addHex("XX");
    addHex(loadTheAccumulatorWithConstant);
    
    addHex(addWithCarry);
    addHex(temporaryAddressOne);
    addHex("XX");
}

function codeGenVarDecl(position, depth){
    addHex(loadTheAccumulatorWithConstant);
    addHex("00");
    var temporaryAddress = staticData.add(position.children[0], position.scope);
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddress);
    addHex("XX");
}

function codeGenAssignment(position, depth){
    traverseTree(position.children[1], depth);
    var temporaryAddress = staticData.get(position.children[0], position.scope);
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddress);
    addHex("XX");
}


function getTypeFromSThelper(id, scope, start = st.cur) {
    //if the scopes mataches return 
    if (scope == start.scope) {
        return start;
    }
    //If lower level, search there
    if (start.children.length != 0) {
        //calls a search in the higher levels
        for (var i = 0; i < start.children.length; i++) {
            var t = getTypeFromSThelper(id, scope, start.children[i]);
            if (t != undefined) {
                return t;
            }
        }
    }
}

function getTypeFromST(id, scope, start = getTypeFromSThelper(id, scope)) {
    //if the current level has symbols
    for (var i = 0; i < start.symbols.length; i++) {
        //when the correct ID is found
        if (id == start.symbols[i].getKind() && scope == start.symbols[i].scope) {
            //returns the type
            return start.symbols[i].type;
        } else if (id == start.symbols[i].getKind() && scope >= start.symbols[i].scope) {
            //returns the type
            return start.symbols[i].type;
        }
    }
    //If higher level, search there
    if (start.parent != undefined || start.parent != null) {
        return getTypeFromST(id, scope, start.parent);
    }
}


function codeGenPrint(position, depth) {
    //id values
    if (position.children[0].type == "id") {
        //gets the temp address
        var address = staticData.get(position.children[0], depth);
        //gets the id type
        var varType = getTypeFromST(position.children[0].name, position.children[0].scope);

        //ID ints
        if (varType == "int") {
            //int print op codes
            //loads from memory
            addHex(loadTheYRegisterFromMemory);
            addHex(address);
            addHex("XX");
            //loads the print int op
            addHex(loadTheXRegisterWithConstant);
            addHex(printIntegerInYRegister);
            //break
            addHex(systemCall);
            //ID strings
        } else if (varType == "string") {
            //string print op codes
            //loads from memory
            addHex(loadTheYRegisterFromMemory);
            addHex(address);
            addHex("XX");
            //loads the print string op
            addHex(loadTheXRegisterWithConstant);
            addHex(printStringInYAddress);
            //break
            addHex(systemCall);
            //ID booleans
        } else if (varType == "boolean") {
            //bool print op codes
            //loads x with 1
            addHex(loadTheXRegisterWithConstant);
            addHex(printIntegerInYRegister);
            //loads from memory
            addHex(compareByteInMemoryToXRegister);
            addHex(address);
            addHex("XX");
            //loads y with false
            addHex(loadTheYRegisterWithConstant);
            addHex(falseAddress);
            //jump 2
            addHex(branchNBytesIfZFlagIsZero);
            addHex("02");
            //load y with true
            addHex(loadTheYRegisterWithConstant);
            addHex(trueAddress);
            //loads the print string op
            addHex(loadTheXRegisterWithConstant);
            addHex(printStringInYAddress);
            //break
            addHex(systemCall);

        }
        //raw strings
    } else if (position.children[0].type == "Charlist") {
        //adds the string to heap
        var address = addToHeap(position.children[0].name);
        //string print op codes
        //loads memory
        addHex(loadTheAccumlatorFromMemory);
        addHex(address);
        addHex("XX");
        //loads the y
        addHex(loadTheYRegisterWithConstant);
        addHex(address);
        //store in temp
        addHex(storeTheAccumulatorInMemory);
        addHex(temporaryAddressOne);
        addHex('XX');
        //loads the print str op code
        addHex(loadTheXRegisterWithConstant);
        addHex(printStringInYAddress);
        //break
        addHex(systemCall);
        //booleans and Ints
    } else {
        //processes booleans and Ints
        traverseTree(position.children[0], depth);
        //raw boolean print codes
        if (position.children[0].type == "boolean" || position.children[0].type == "Equality" || position.children[0].type == "Not_Equal") {
            //boolean print op codes
            //loads 1 into x
            addHex(loadTheXRegisterWithConstant);
            addHex(printIntegerInYRegister);
            //loads the false location into y
            addHex(loadTheYRegisterWithConstant);
            addHex(falseAddress);
            //jumps if 
            addHex(branchNBytesIfZFlagIsZero);
            addHex("02");
            //loads the true location into y
            addHex(loadTheYRegisterWithConstant);
            addHex(trueAddress);
            //loads the print str op into x
            addHex(loadTheXRegisterWithConstant);
            addHex(printStringInYAddress);
            //Break
            addHex(systemCall);
            //raw int print codes
        } else {
            //int print op codes
            //loads print int code
            addHex(loadTheXRegisterWithConstant);
            addHex(printIntegerInYRegister);
            //stores to the temp address
            addHex(storeTheAccumulatorInMemory);
            addHex(temporaryAddressOne);
            addHex('XX');
            //loads the temp in y
            addHex(loadTheYRegisterFromMemory);
            addHex(temporaryAddressOne);
            addHex('XX');
            //Break
            addHex(systemCall);
        }
    }
}

function codeGenWhile(position, depth){
    var init = generatedCode.length;
    traverseTree(position.children[0], depth);
    var temporaryAddress = jumpTable.add(generatedCode.length);
    addHex(branchNBytesIfZFlagIsZero);
    addHex(temporaryAddress);
    traverseTree(position.children[1], depth);
    addHex(loadTheAccumulatorWithConstant);
    addHex("00");
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddressOne);
    addHex("XX");
    addHex(loadTheXRegisterWithConstant);
    addHex("01");
    addHex(compareByteInMemoryToXRegister);
    addHex(temporaryAddressOne);
    addHex("XX");
    var jump = numToHex(256 - generatedCode.length + init - 2);
    addHex(branchNBytesIfZFlagIsZero);
    addHex(jump);
    
    jumpTable.get(temporaryAddress).endingAddress = generatedCode.length;
}

function codeGenIf(position, depth){
    traverseTree(position.children[0], depth);
    var temporaryAddress = jumpTable.add(generatedCode.length);
    addHex(branchNBytesIfZFlagIsZero);
    addHex(temporaryAddress);
    traverseTree(position.children[1], depth);
    jumpTable.get(temporaryAddress).endingAddress = generatedCode.length;
}

function codeGenNotEquals(position, depth){
    position.type = "Equality";
    codeGenIsEquals(position, depth);
    addHex(loadTheAccumulatorWithConstant);
    addHex("00");
    addHex(branchNBytesIfZFlagIsZero);
    addHex("02");
    addHex(loadTheAccumulatorWithConstant);
    addHex("01");
    addHex(loadTheAccumulatorWithConstant);
    addHex("00");
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddressOne);
    addHex("XX");
    addHex(compareByteInMemoryToXRegister);
    addHex(temporaryAddressOne);
    addHex("XX");
}

function codeGenIsEquals(position, depth){
    if(position.children[0].name == "Equality" || position.children[0].name == "Not_Equal" ||
       position.children[1].name == "Equality" || position.children[1].name == "Not_Equal"){
        addHex(storeTheAccumulatorInMemory);
        addHex(temporaryAddressOne);
        addHex("XX");
        addHex(compareByteInMemoryToXRegister);
        addHex(temporaryAddressOne);
        addHex("XX");
    }else if(position.children[0].name == "intop" || position.children[1].name == "intop"){
        numCodeGenErrors++;
    }else if(position.children[0].type == "charlist" || position.children[1].type == "charlist"){
        if(position.children[0].name == position.children[1].name){
            addHex(loadTheAccumulatorWithConstant);
            addHex("01");
            addHex(loadTheXRegisterWithConstant);
            addHex("01");
        }else{
            addHex(loadTheAccumulatorWithConstant);
            addHex("01");
            addHex(loadTheXRegisterWithConstant);
            addHex("00");
        }
        addHex(storeTheAccumulatorInMemory);
        addHex(temporaryAddressOne);
        addHex("XX");
        addHex(compareByteInMemoryToXRegister);
        addHex(temporaryAddressOne);
        addHex("XX");
    }else{
        traverseTree(position.children[0], depth);
        addHex(storeTheAccumulatorInMemory);
        addHex(temporaryAddressTwo);
        addHex("XX");
        traverseTree(position.children[1], depth);
        addHex(storeTheAccumulatorInMemory);
        addHex(temporaryAddressOne);
        addHex("XX");
        addHex(loadTheXRegisterFromMemory);
        addHex(temporaryAddressTwo);
        addHex("XX");
        addHex(compareByteInMemoryToXRegister);
        addHex(temporaryAddressOne);
        addHex("XX");
        addHex(loadTheAccumulatorWithConstant);
        addHex("00");
        addHex(branchNBytesIfZFlagIsZero);
        addHex("02");
        addHex(loadTheAccumulatorWithConstant);
        addHex("01");
    }
}

function codeGenId(position, depth){
    var temporaryAddress = staticData.get(position, position.scope);
    addHex(loadTheAccumlatorFromMemory);
    addHex(temporaryAddress);
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
    var temporaryValue = addToHeap(position.name, position.line);
    addHex(loadTheAccumulatorWithConstant);
    addHex(temporaryValue);
}

function addHex(val){
    generatedCode.push(val);
}

function addToHeap(string, line = 0){
    if(returningHeap = strings.get(string)){
        return returningHeap;
    }
    
    if(string.length == 0){
        return 'FF';
    }
    
    heap.unshift("00");
    heapAddress--;
    
    for(var i = string.length - 1; i >= 0; i--){
        heap.unshift(charsToHex(string.charAt(i)));
        heapAddress--;
    }
    strings.add(numToHex(heapAddress), string);
    
    return numToHex(heapAddress);
}
