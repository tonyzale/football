/// <reference path="vector.ts" />
/// <reference path="circular_buffer.ts" />

enum Things {Player, Field, Ball, Area, Manager};

interface UpdateLogic {
    update(thing:Thing, delta: number): void;
}

class DoNothingLogic implements UpdateLogic {
    update(thing: Thing, delta: number) {}
}

class UpdateStack implements UpdateLogic {
    update(thing: Thing, delta: number) {
        this.logics[this.logics.length - 1].update(thing, delta);
    }
    
    logics: UpdateLogic[] = [new DoNothingLogic()]; 
}

class ExpiringUpdateLogic {
    constructor(public logic: UpdateLogic, public length: number, private stack: UpdateStack) {}
    update(thing: Thing, delta: number) {
        this.logic.update(thing, delta);
        this.length -= delta;
        if (this.length < 0) {
            this.stack.logics.pop();
        }
    }
}

interface DrawLogic {
    draw(thing: Thing, canvas: HTMLCanvasElement, pixels_per_inch: number): void;
}

class Thing {
    constructor(public pos: Vector.Vector, public type: Things, public radius?: number, private draw_logic?: DrawLogic, update_logic?: UpdateLogic){
        this.pos_history.push(pos);
        if (update_logic) this.updatable.logics.push(update_logic);
    }
    toString(): String {return Things[this.type] + ": " + this.pos;}
    update(delta: number) {
        this.updatable.update(this, delta);
        this.pos_history.push(this.pos);
    }
    draw(canvas: HTMLCanvasElement, pixels_per_inch: number) { this.draw_logic && this.draw_logic.draw(this, canvas, pixels_per_inch);}
    possessions: Thing[] = [];
    isColliding(other: Thing): boolean { return false; }
    pos_history: CircularBuffer<Vector.Vector> = new CircularBuffer<Vector.Vector>(10);
    updatable: UpdateStack = new UpdateStack();
}

class Collision {
    constructor(public thing1: Thing, public thing2: Thing){
        if (thing1 == thing2) throw "self collision error";
    }
    is_between_things(t1: Thing, t2: Thing): boolean {
        return ((this.thing1 == t1 || this.thing1 == t2) && (this.thing2 == t1 || this.thing2 == t2));
    }
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

