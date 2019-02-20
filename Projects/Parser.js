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
    
}

function parsePrintStatement(){
    
}

function parseAssignmentStatement(){
    
}

function parseVarDecl(){
    
}

function parseWhileStatement(){
    
}

function parseIfStatement(){
    
}

function parseExpr(){
    
}

function parseIntExpr(){
    
}

function parseStringExpr(){
    
}

function parseBooleanExpr(){
    
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
    
}

function parseSpace(){
    
}

function parseDigit(){
    
}

function parseBoolOP(){
    
}

function parseBoolVal(){
    
}

function parseIntOP(){
    
}
    
    
function matchAndConsume(){
    
}