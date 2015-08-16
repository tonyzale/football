/// <reference path="Vector.ts" />

enum Things {Player};

class Thing {
    constructor(public pos: Vector.Vector, public type: Things, public update: (thing:Thing)=>void){}
    toString(): String {return Things[this.type] + ": " + this.pos;}
}

interface Scene {
    things: Thing[];
}