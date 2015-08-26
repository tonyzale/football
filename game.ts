/// <reference path="vector.ts" />
/// <reference path="circular_buffer.ts" />

enum Things {Player, Field, Ball};

interface UpdateLogic {
    update(thing:Thing): void;
}

interface DrawLogic {
    draw(thing: Thing, canvas: HTMLCanvasElement, pixels_per_inch: number): void;
}

class Thing {
    constructor(public pos: Vector.Vector, public type: Things, public radius?: number, private updatable?: UpdateLogic, private draw_logic?: DrawLogic){
        this.pos_history.push(pos);
    }
    toString(): String {return Things[this.type] + ": " + this.pos;}
    update() {
        this.updatable && this.updatable.update(this);
        this.pos_history.push(this.pos);
    }
    draw(canvas: HTMLCanvasElement, pixels_per_inch: number) { this.draw_logic && this.draw_logic.draw(this, canvas, pixels_per_inch);}
    possessions: Thing[] = [];
    isColliding(other: Thing): boolean { return false; }
    pos_history: CircularBuffer<Vector.Vector> = new CircularBuffer<Vector.Vector>(10);
}

class Collision {
    constructor(public thing1: Thing, public thing2: Thing){}
}

class Scene {
    things: Thing[] = [];
    toString(): String {return this.things.join('\n');}
    getCollisionPairs(): Collision[] {
        var collisions: Collision[] = [];
        var collidables = this.things.filter(t=>{return t.radius != null;});
        for (var i = 0; i < collidables.length; i++) {
            var thing1 = collidables[i];
            for (var j = i+1; j < collidables.length; j++) {
                var thing2 = collidables[j];
                var coll_dist_sqrd = (thing1.radius + thing2.radius) * (thing1.radius + thing2.radius); 
                if (Vector.Vector.dist_sqrd(thing1.pos, thing2.pos) < coll_dist_sqrd) {
                    collisions.push(new Collision(thing1, thing2));
                }
            }
        }
        return collisions;
    }
}

