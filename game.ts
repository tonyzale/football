/// <reference path="Vector.ts" />

enum Things {Player};

interface UpdateLogic {
    update(thing:Thing): void;
}

class Thing {
    constructor(public pos: Vector.Vector, public type: Things, private updatable?: UpdateLogic){}
    toString(): String {return Things[this.type] + ": " + this.pos;}
    update() {this.updatable && this.updatable.update(this);}
}

class Scene {
    things: Thing[] = [];
    toString(): String {return this.things.join('\n');}
}