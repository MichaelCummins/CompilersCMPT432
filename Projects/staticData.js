/** 
 * A class that contains data associated with variables
 * Modified from svegliator.
 */

function StaticData(){
    this.currentAddress = 0;
    this.offset = 0;
    this.variables = {};
};

// Adds a variable to the static data table
StaticData.prototype.add = function (node, scope){
    var adjustedAddress = 'T' + this.currentAddress++;
    this.variables[this.getKey(node, scope)] = new IdentifierVariable(adjustedAddress, this.offset++);
    return adjustedAddress;
};

// Gets a variable from the static data table
StaticData.prototype.get = function (node, scope){
    var identifier = this.variables[this.getKey(node, scope)];
    for (; !identifier;) {
        scope = this.pScope(node.parent, scope);
        identifier = this.variables[node.name + "@" + scope];
    }

    return identifier.address;
};

// Generates the key for a given variable
StaticData.prototype.getKey = function (node, scope){
    var key = node.name + "@" + scope;
    return key;
};

// Generates the number of variables
StaticData.prototype.length = function (){
    return this.currentAddress;
};

// gets the parent scope
StaticData.prototype.pScope = function (node, scope){
    //if they are equal
    if (node.scope >= scope) {
        //goes further
        return this.pScope(node.parent, scope);
        //otherwise
    } else {
        //if no scope
        if (node.scope == undefined){
            //erors
            numCodeGenErrors++;
            return node.scope;
            //otherwise
        } else {
            //return scope
            return node.scope;
        }
    }
};

/** 
 * A class that contains data associated with an identifier
 */

function IdentifierVariable(address, offset){
    this.address = address;
    this.offset = offset;
};