var numParseErrors;
var numParseWarnings;
var currentToken;
var ;

function parseProgram(){
    parseBlock();
    match(EOP);
}

function parseBlock(){
    match("(");
    parseStatementList();
    matchAndConsume(")");
}
