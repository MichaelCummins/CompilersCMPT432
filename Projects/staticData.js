

function StaticData(){
    this.currentAddress = 0;
    this.offset = 0;
    this.variables = {};
};

StaticData.prototype.add = function (node, scope){
    var adjustedAddress = 'T' + this.currentAddress++;
    this.variables[this.getKey(node, scope)] = new IdentifierVariable(adjustedAddress, this.offset++);
    return adjustedAddress;
};

StaticData.prototype.get = function (node, scope){
    var identifier = this.variables[this.getKey(node, scope)];
    for (; !identifier;) {
        scope = this.pScope(node.parent, scope);
        identifier = this.variables[node.name + "@" + scope];
    }

    return identifier.address;
};

StaticData.prototype.getKey = function (node, scope){
    var key = node.name + "@" + scope;
    return key;
};

StaticData.prototype.length = function (){
    return this.currentAddress;
};

StaticData.prototype.pScope = function (node, scope){
    if (node.scope >= scope) {
        return this.pScope(node.parent, scope);
    } else {
        if (node.scope == undefined){
            numCodeGenErrors++;
            return node.scope;
        } else {
            return node.scope;
        }
    }
};


function IdentifierVariable(address, offset){
    this.address = address;
    this.offset = offset;
};