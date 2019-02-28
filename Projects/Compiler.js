var programTokens = [];
var currentProgram = 1;
var lexerFailed = 0;
var parserFailed = 0;


function compile(){
    init();
    var programs = getInput();
    programTokens = [];
    lexerFailed = 0;
    parserFailed =  0;
    currentProgram = 1;
    
    for (var i = 0; i < programs.length; i++){
        if(i > 0){
            outputMessage("\nProgram " + currentProgram);
        }
        var input = programs[i];
        
        if(lex(input)){
            for(var j = 0; j < tokens.length; j++){
                programTokens.push(tokens[j]);
            }
            outputMessage("Program " + currentProgram + " passed \n");
     //       if(parse() == 0){
                
    //        }
        }else{
            lexerFailed++;
        }
        currentProgram++;
    }
}
function getInput(){
	//Gets the input
	var input = getSourceCode();
	//checks if theres a $ at the end
	if (input.trim(input).slice(-1) != EOF){
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
/*
function compilerLexer(userInput){
    if(tokensLexed = lex(userInput)){
        outputMessage("Lexer passed");
    }else{
        outputMessage("Lexer failed wsssith " + numErrors + " ersssrors");
    }
    return tokensLexed;
}*/