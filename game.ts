/// <reference path="vector.ts" />

enum Things {Player, Field, Ball};

interface UpdateLogic {
    update(thing:Thing): void;
}

interface DrawLogic {
    draw(thing: Thing, canvas: HTMLCanvasElement): void;
}

class Thing {
    constructor(public pos: Vector.Vector, public type: Things, private updatable?: UpdateLogic, private draw_logic?: DrawLogic){}
    toString(): String {return Things[this.type] + ": " + this.pos;}
    update() {this.updatable && this.updatable.update(this);}
    draw(canvas: HTMLCanvasElement) { this.draw_logic && this.draw_logic.draw(this, canvas);}
    possessions: Thing[] = [];
}

class Scene {
    things: Thing[] = [];
    toString(): String {return this.things.join('\n');}
}

