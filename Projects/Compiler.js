//Declare global variables
var currentProgram = 1;
var analyzerTokens = [];

function compile(){
    //Initialize variables
    init();
    //Get however many programs were compiling
    var programs = compileUserInput();
    //Tracks which program is being compiled
    currentProgram = 1;
    analyzerTokens = [];
    
    //Go through each program
    for (var i = 0; i < programs.length; i++){
        //Output whenever we start a new program
        if(i => 0){
            outputMessage("\nProgram " + currentProgram);
        }
        //Get input per each program
        var input = programs[i];
        
        //Check if the lexer was successful
        if(compilerLexer(input)){
            for(var alan = 0; alan < tokens.length; alan++){
                analyzerTokens.push(tokens[i]);
            }
            //Parse each program if lex was successful
            if(compilerParser() == 0){
                compilerAnalyze();
            }
        }
        //Go to the next program
        currentProgram++;
    }
}

function compileUserInput(){
	//Get user's input
	var userInput = getSourceCode();
	//check if userInput contains an EOP operator at the end
	if (userInput.trim().slice(-1) != "$") {
		//If it does dont add an EOP to it
		var dontAddEOP = true;
	}
	//split input by EOP operator
	var programs = userInput.split("$");

	//Get rid of the extra program that was created
	if (!dontAddEOP) {
		//remove it
		programs.pop();
	}

	//Add EOP marker to unmarked programs
	for (var i = 0; i < programs.length; i++) {
		if (!((programs.length == (i + 1)) && dontAddEOP)) {
			programs[i] += "$";
		}
	}
	//returns programs
	return programs;
}

function compilerLexer(userInput){
    if(tokensLexed = lex(userInput)){
        outputMessage("Lexer passed with 0 errors and " + numWarnings + " warnings\n");
    }else{
        outputMessage("Lexer failed with " + numErrors + " errors " + numWarnings + " warnings");
    }
    return tokensLexed;
}

function compilerParser(){
    if(!parseStart(tokens)){
        outputMessage("Parser successful");
        outputMessage("\nCST for program " + currentProgram + "\n" + cst);
    }else{
        outputMessage("\nCST skipped due to parser errors");
    }
    return numParseErrors;
}

function compilerAnalyze(){
    if(analyzerStart(analyzerTokens) == 0){
        outputMessage("Analyzer successful");
        outputMessage("\nAST for program " + currentProgram + "\n" + ast);
    }else{
        outputMessage("\nAST skipped due to analyzer errors");
    }
    return numAnalyzerErrors;
}