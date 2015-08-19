/// <reference path="vector.ts" />

enum Things {Player, Field};

interface UpdateLogic {
    update(thing:Thing): void;
}

interface DrawLogic {
    draw(thing: Thing, canvas: HTMLCanvasElement): void;
}

class RouteFollower {
    current_dest: number = 0;
    constructor(private route: Vector.Vector[], private speed: number) { }
    update(thing: Thing) {
        var dist_to_travel: number = this.speed;
        while (dist_to_travel > 0 && (this.current_dest < this.route.length)) {
            var diff = Vector.Vector.minus(this.route[this.current_dest], thing.pos);
            var dist_to_next_waypoint = Vector.Vector.mag(diff);
            if (dist_to_next_waypoint > dist_to_travel) {
                var normalized = Vector.Vector.norm(diff);
                var delta = Vector.Vector.times(dist_to_travel, normalized);
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
    constructor(public pos: Vector.Vector, public type: Things, private updatable?: UpdateLogic, private draw_logic?: DrawLogic){}
    toString(): String {return Things[this.type] + ": " + this.pos;}
    update() {this.updatable && this.updatable.update(this);}
    draw(canvas: HTMLCanvasElement) { this.draw_logic && this.draw_logic.draw(this, canvas);}
}

class Scene {
    things: Thing[] = [];
    toString(): String {return this.things.join('\n');}
}

class FieldDrawer {
    draw(thing: Thing, canvas: HTMLCanvasElement) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(thing.pos.x, thing.pos.y, 720, 320);
        for (var i = 0; i < 11; i++) {
            if ((i == 0) || (i == 10)) {
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
            }
            ctx.beginPath();
            ctx.moveTo(60 + i*60,0);
            ctx.lineTo(60 + i*60, 320);
            ctx.stroke();
        }
    }
}

class Game {
    constructor(private canvas: HTMLCanvasElement){
        this.scene.things.push(new Thing(new Vector.Vector(0,0,0), Things.Field,null,new FieldDrawer()));
        window.setInterval(this.update, 16.666);
    }
    update = () => { 
        this.scene.things.forEach(t => t.update());
        this.scene.things.forEach(t => t.draw(this.canvas));
    }
    scene:Scene = new Scene();
}