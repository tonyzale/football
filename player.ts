/// <reference path="game.ts" />

class RouteFollower implements UpdateLogic {
    current_dest: number = 0;
    constructor(public route: Vector.Vector[], private speed: number) { }
    update(thing: Thing, delta: number) {
        var dist_to_travel: number = this.speed;
        while (dist_to_travel > 0 && (this.current_dest < this.route.length)) {
            var diff = Vector.Vector.minus(this.route[this.current_dest], thing.pos);
            var dist_to_next_waypoint = Vector.Vector.mag(diff);
            if (dist_to_next_waypoint > dist_to_travel) {
                var normalized = Vector.Vector.norm(diff);
                var dist = Vector.Vector.times(dist_to_travel, normalized);
                thing.pos = Vector.Vector.plus(thing.pos, dist);
                break;
            } else {
                thing.pos = this.route[this.current_dest];
                this.current_dest += 1;
                dist_to_travel -= dist_to_next_waypoint;
            }
        }
    }
    toString(): string { return "RouteFollowerLogic"; }
}

class ExpireOnArrivalLogic implements UpdateLogic {
    constructor(public logic: RouteFollower, private stack: UpdateStack) {}
    update(thing: Thing, delta: number) {
        this.logic.update(thing, delta);
        if (this.logic.current_dest == this.logic.route.length) {
            this.stack.logics.pop();
        }
    }
    toString(): string { return "ExpireOnArrivalLogic " + this.logic.route; }
}

class ChaseLogic implements UpdateLogic {
    constructor(private target: Thing, private speed: number) {}
    update(thing: Thing, delta: number) {
        var diff = Vector.Vector.minus(this.target.pos, thing.pos);
        var dist_to_target = Vector.Vector.mag(diff);
        if (dist_to_target < this.speed) {
            Vector.Vector.set(thing.pos, this.target.pos);
            return;
        }
        var normalized = Vector.Vector.norm(diff);
        var dist = Vector.Vector.times(this.speed, normalized);
        thing.pos = Vector.Vector.plus(thing.pos, dist);
    }
    toString(): string { return "ChaseLogic"; }
}

class ChaseDynamicLogic implements UpdateLogic {
    constructor(private target: ()=>Vector.Vector, private speed: number) {}
    update(thing: Thing, delta: number) {
        var target = this.target();
        var diff = Vector.Vector.minus(target, thing.pos);
        var dist_to_target = Vector.Vector.mag(diff);
        if (dist_to_target < this.speed) {
            Vector.Vector.set(thing.pos, target);
            return;
        }
        var normalized = Vector.Vector.norm(diff);
        var dist = Vector.Vector.times(this.speed, normalized);
        thing.pos = Vector.Vector.plus(thing.pos, dist);        
    }
    toString(): string { return "ChaseDynamicLogic"; }
}

class PlayerDrawer implements DrawLogic {
    constructor(public color: string){}
    draw(thing: Thing, canvas: HTMLCanvasElement, pixels_per_inch: number) {
        var context = canvas.getContext("2d");
        context.beginPath();
        context.arc(thing.pos.x * pixels_per_inch, thing.pos.y * pixels_per_inch, thing.radius * pixels_per_inch, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        if (thing.possessions.some(t=>{return (t.type==Things.Ball);})) {
            context.lineWidth = 2;
            context.strokeStyle = 'brown';
            context.stroke();
        }
    }
}