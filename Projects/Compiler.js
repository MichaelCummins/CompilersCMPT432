//Declare global variables
var currentProgram = 1;


function compile(){
    //Initialize variables
    init();
    //Get however many programs were compiling
    var programs = compileUserInput();
    //Tracks which program is being compiled
    currentProgram = 1;
    
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
            outputMessage("Program " + currentProgram + " passed \n");
            //Parse each program if lex was successful
            compilerParser();
            //Check if we got any errors during parse
            if(numParseErrors == 0){
                outputMessage("\nConcrete Syntax Tree for program "+ currentProgram + "\n" + tree);   
            }else{
                outputMessage("\nConcrete Syntax Tree skipped due to Parser error");
            }
        }
        //Go to the next program
        currentProgram++;
    }
}

function compileUserInput(){
	//Gets the input
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