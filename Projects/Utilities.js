        //Declare global variables
        var tokens = [];
        var numErrors = 0;
        var EOF; //End of program operator
        var currentProgram = 1;
        var completedPrograms = 0;
        var numWarnings = 0;
        
        function init(){
            //clear all values
            document.getElementById("CompiledCodeOutput").value = "";
            tokens = [];
            numErrors = 0;
            EOF = "$";
            currentProgram = 1;
            completedPrograms = 0;
            numWarnings = 0;
        }
            
        function clickTheButton(){
            //Clear all values
            init();
            //Call function to lex user input
            lex(getSourceCode());
        }
        
        function trim(str){
            return str.replace(/\s/g, "");
        }
        
        
        function getSourceCode(){
            var sourceCode = document.getElementById("SourceCodeInput").value;
            return sourceCode;
        }
        //Function that outputs results to the output text area
        //From javascript template for project 0 on labouseur.com
        function outputMessage(message){
            document.getElementById("CompiledCodeOutput").value += message + "\n";
        }