function jump(){
    this.address = 0;
    this.variables = {};
}

jump.prototype.add = function (initialAddress){
    var temporaryAddress = "J" + this.address++;
    this.variables[temporaryAddress] = new jumpVariable(initialAddress);
    return temporaryAddress;
}

jump.prototype.get = function(address){
    return this.variables[address];
}

function jumpVariable(initialAddress){
    this.initialAddress = initialAddress;
    this.endingAddress = null;
}