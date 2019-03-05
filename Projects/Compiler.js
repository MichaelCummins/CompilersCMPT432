var programTokens = [];
var currentProgram = 1;
var lexerFailed = 0;
var parserFailed = 0;


function compile(){
    init();
    var programs = compileInput();
    programTokens = [];
    lexerFailed = 0;
    parserFailed =  0;
    currentProgram = 1;
    
    for (var i = 0; i < programs.length; i++){
        if(i > 0){
            outputMessage("\nProgram " + currentProgram);
        }
        var input = programs[i];
        
        if(compilerLexer(input)){
            for(var j = 0; j < tokens.length; j++){
                programTokens.push(tokens[j]);
            }
            outputMessage("Program " + currentProgram + " passed \n");
            //Parse each program if lex was successful
            compilerParser();
        }else{
            lexerFailed++;
        }
        currentProgram++;
    }
}

function compileInput() {
	//Gets the input
	var input = getSourceCode();
	//checks if theres a $ at the end
	if (input.trim().slice(-1) != "$") {
		//if so
		var doNotAddToLast = true;
	}
	//splits the input up by program
	var programs = input.split("$");

	//if there was a $ there is now extra space
	if (!doNotAddToLast) {
		//remove it
		programs.pop();
	}

	//goes through and adds if its supposed too
	for (var i = 0; i < programs.length; i++) {
		if (!((programs.length == (i + 1)) && doNotAddToLast)) {
			programs[i] += "$";
		}
	}
	//returns programs
	return programs;
}

function compilerLexer(userInput){
    if(tokensLexed = lex(userInput)){
        outputMessage("Lexer passed with 0 errors and " + numWarnings + " warnings");
    }else{
        outputMessage("Lexer failed with " + numErrors + " errors " + numWarnings + " warnings");
    }
    return tokensLexed;
}

function compilerParser(){
    if(!parseStart(tokens)){
        outputMessage("Parser successful");
    }
}