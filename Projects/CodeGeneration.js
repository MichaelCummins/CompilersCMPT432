//Store code as an array
var generatedCode = [];
//Track errors
var numCodeGenErrors;
var tree;
//Temporary addresses
var temporaryAddressOne = "X1";
var temporaryAddressTwo = "X2";
//Store heap as an array
var heap = [];
//Placeholder for booleans
var truePlaceholder;
var falsePlaceholder;
//define static data
var staticData = new StaticData();
//Define jumps for ifs and whiles
var jumpTable = new jump();
//Convert array to string
var generatedCodeString = "";
//Define string table
var strings = new stringTable();
//Start of heap
var heapAddress = 256;

function generate(theTree){
    //Reset values
    generatedCode = [];
    numCodeGenErrors = 0;
    tree = theTree;
    staticData = new StaticData();
    jumpTable = new jump();
    strings = new stringTable();
    heapAddress = 256;
    heap = [];
    codeGenStart();
    
    //Convert from array to string 
    generatedCodeString = generatedCode.join(' ');
    return generatedCodeString;
}

function numToHex(value){
    //Convert a number into a hexidecimal value
    return pad(toHexidecimal(parseInt(value)), 2, '0').toUpperCase();
}

function toHexidecimal(string){
    //Convert a string to a hexidecimal value
    return string.toString(16);
}

function pad(word, size, padder){
    //Pad values
    var paddedWord = "" + word;
    while(paddedWord.length < size){
        paddedWord = padder + paddedWord;
    }
    return paddedWord;
}

//Convert chars to hexidecimal values
function charsToHex(value){
    return pad(toHexidecimal(value.charCodeAt(0)), 2, "0").toUpperCase();
}


//Start generating code
function codeGenStart(){
    //Output where we are and add placeholders
    outputMessage("Code Gen Program " + currentProgram);
    truePlaceholder = addToHeap('true');
    falsePlaceholder = addToHeap('false');
    //Traverse the Tree!!!!
    traverseTree(ast.root, 0);
    
    //Starting replacing crap
    outputMessage("Backtracking");
    //Get new address
    var newAddressOne = numToHex(generatedCode.length + staticData.length() + 1);
    outputMessage("Replacing " + temporaryAddressOne + " with " + newAddressOne);
    //If we see a Temp address, replace it with a perma one
    if(generatedCode.includes(temporaryAddressOne)){
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == temporaryAddressOne){
                generatedCode[i] = newAddressOne;
            }
        }
    }
    //Get new address
    var newAddressTwo = numToHex(generatedCode.length + staticData.length() + 2);
    outputMessage("Replacing " + temporaryAddressTwo + " with " + newAddressTwo);
    //Same thing as previous statement
    if(generatedCode.includes(temporaryAddressTwo)){
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == temporaryAddressTwo){
                generatedCode[i] = newAddressTwo;
            }
        }
    }
    
    //Go through staticData and add new locations
    for(var key in staticData.variables){
        //Get new address
        var newAddress = numToHex(generatedCode.length + staticData.variables[key].offset);
        //Get current address
        var temporaryAddress = staticData.variables[key].address;
        outputMessage("Replacing " + temporaryAddress + " with " + newAddress);
        //Loop through
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == temporaryAddress){
                generatedCode[i] = newAddress;
            }
        }
    }
    //Go through jumpTable and add new locations
    for(var key in jumpTable.variables){
        //Where the block starts
        var start = jumpTable.variables[key].initialAddress;
        //Where the block ends
        var end = jumpTable.variables[key].endingAddress;
        //Where to go
        var move = numToHex(end - start - 2);
        outputMessage("Replacing " + key + " with " + move);
        for(var i = 0; i < generatedCode.length; i++){
            //If found temp jump key replace it
            if(generatedCode[i] == key){
                generatedCode[i] = move;
            }
        }
    }

    outputMessage("Replacing XX with 00");
    //Replace XX for new address
    if(generatedCode.includes("XX")){
        for(var i = 0; i < generatedCode.length; i++){
            if(generatedCode[i] == "XX"){
                generatedCode[i] = "00";
            }
        }
    }
    
    //Cover the heap in Zeroes
    for(var i = generatedCode.length; i < 256 - heap.length; i++){
        generatedCode.push("00");
    }
    //Push heap onto the code
    for(var i = 0; i < heap.length; i++){
        generatedCode.push(heap[i]);
    }
    
    //Check memory
    if(generatedCode.length > 256){
        numCodeGenErrors++;
        outputMessage("ERROR memory exceeded " + generatedCode.length + " 256");
    }
}

//When you find your name go to your specified function
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
    }else if("0123456789".includes(position.name)){
        codeGenDigit(position, depth);
    }else if(position.name == "Addition"){
        return codeGenAddition(position, depth);
    }else{
        for(var i = 0; i < position.children.length; i++){
            traverseTree(position.children[i], depth);
        }
    }
}

//Go through this level
function codeGenRoot(position, depth){
    for(var i = 0; i < position.length; i++){
        traverseTree(position[i], depth);
    }
}

//Go through this level
function codeGenProgram(position, depth){
    for(var i = 0; i < position.length; i++){
        traverseTree(position[i], depth);
    }
}

//Go through this lvel
function codeGenBlock(position, depth){
    for(var i = 0; i < position.children.length; i++){
        traverseTree(position.children[i], depth + 1);
    }
}

function codeGenAddition(position, depth){
    outputMessage("Starting Addition");
    traverseTree(position.children[1], depth);
    //Store temp address
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddressOne);
    addHex("XX");
    //Load with constant
    addHex(loadTheAccumulatorWithConstant);
    addHex(numToHex(position.children[0].name));
    //Add with new address
    addHex(addWithCarry);
    addHex(temporaryAddressOne);
    addHex("XX");
}

function codeGenVarDecl(position, depth){
    outputMessage("Variable Declaration");
    //Load with constant
    addHex(loadTheAccumulatorWithConstant);
    addHex("00");
    //Get temp address
    var temporaryAddress = staticData.add(position.children[0], position.scope);
    //Store temp address in Memory
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddress);
    addHex("XX");
    outputMessage("Declaration Done")
}

function codeGenAssignment(position, depth){
    outputMessage("Assignment Statement")
    traverseTree(position.children[1], depth);
    var temporaryAddress = staticData.get(position.children[0], position.scope);
    addHex(storeTheAccumulatorInMemory);
    addHex(temporaryAddress);
    addHex("XX");
    outputMessage("Assignment Done");
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
    outputMessage("Starting Print");
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
    outputMessage("Ending Print");
}

function codeGenWhile(position, depth){
    outputMessage("Starting While");
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
    outputMessage("Ending While");
}

function codeGenIf(position, depth){
    outputMessage("Starting If");
    traverseTree(position.children[0], depth);
    var temporaryAddress = jumpTable.add(generatedCode.length);
    addHex(branchNBytesIfZFlagIsZero);
    addHex(temporaryAddress);
    traverseTree(position.children[1], depth);
    jumpTable.get(temporaryAddress).endingAddress = generatedCode.length;
    outputMessage("Ending If");
}

function codeGenNotEquals(position, depth){
    outputMessage("Starting NotEquals");
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
    outputMessage("Ending NotEquals");
}

function codeGenIsEquals(position, depth){
    outputMessage("Starting IsEquals");
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
    outputMessage("Ending IsEquals");
}

function codeGenId(position, depth){
    outputMessage("Starting Id");
    var temporaryAddress = staticData.get(position, position.scope);
    addHex(loadTheAccumlatorFromMemory);
    addHex(temporaryAddress);
    addHex("XX");
}

function codeGenDigit(position, depth){
    outputMessage("Starting Digit");
    addHex(loadTheAccumulatorWithConstant);
    addHex(numToHex(position.name));
    outputMessage("Ending Id");
}

function codeGenBoolean(position, depth){
    outputMessage("Starting Boolean");
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
    outputMessage("Ending Boolean");
}

function codeGenString(position, depth){
    outputMessage("Starting String");
    var temporaryValue = addToHeap(position.name, position.line);
    addHex(loadTheAccumulatorWithConstant);
    addHex(temporaryValue);
    outputMessage("Ending String");
}

function addHex(val){
    outputMessage("Pushing " + val);
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
