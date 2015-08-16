/// <reference path="Vector.ts" />

enum Things {Player};

interface UpdateLogic {
    update(thing:Thing): void;
}

class RouteFollower {
    current_dest: number = 0;
    constructor(private route: Vector.Vector[]) { }
    update(thing: Thing) {
        var dist_to_travel: number = thing.speed;
        while (dist_to_travel > 0 && (this.current_dest < this.route.length)) {
            var diff = Vector.Vector.minus(this.route[this.current_dest], thing.pos);
            var dist_to_next_waypoint = Vector.Vector.mag(diff);
            if (dist_to_next_waypoint > dist_to_travel) {
                var normalized = Vector.Vector.norm(diff);
                var delta = Vector.Vector.times(thing.speed, normalized);
                thing.pos = Vector.Vector.plus(thing.pos, delta);
                break;
            } else {
                thing.pos = this.route[this.current_dest];
                this.current_dest += 1;
                dist_to_travel -= dist_to_next_waypoint;
            }
        }
    }
}

class Thing {
    constructor(public pos: Vector.Vector, public type: Things, private updatable?: UpdateLogic, public speed?: number){}
    toString(): String {return Things[this.type] + ": " + this.pos;}
    update() {this.updatable && this.updatable.update(this);}
}

class Scene {
    things: Thing[] = [];
    toString(): String {return this.things.join('\n');}
}