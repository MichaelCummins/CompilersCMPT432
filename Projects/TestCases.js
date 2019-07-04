var invalidCharactersText = '{int b = @}$';

function fillTextArea(testCase){
    var text;
    switch(testCase){
        case "InvalidCharacters":
            text = invalidCharactersText;
    }
    
    document.getElementById("SourceCodeInput").value = text;
}