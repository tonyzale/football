/// <reference path="vector.ts" />

enum Things {Player, Field, Ball};

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
    possessions: Thing[] = [];
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

class PlayerDrawer {
    constructor(public color: string){}
    draw(thing: Thing, canvas: HTMLCanvasElement) {
        var context = canvas.getContext("2d");
        context.beginPath();
        context.arc(thing.pos.x, thing.pos.y, 4, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        if (thing.possessions.some(t=>{return (t.type==Things.Ball);})) {
            context.lineWidth = 2;
            context.strokeStyle = 'brown';
            context.stroke();
        }
    }
}

class Game {
    constructor(private canvas: HTMLCanvasElement){
        this.scene.things.push(new Thing(new Vector.Vector(0,0,0), Things.Field,null,new FieldDrawer()));
        this.scene.things.push(new Thing(
            new Vector.Vector(60,6,0), Things.Player,
            new RouteFollower(
                [new Vector.Vector(300, 6, 0), new Vector.Vector(300, 240, 0), new Vector.Vector(60, 240, 0)],
                0.8), new PlayerDrawer('red')));
         var ball_carrier: Thing;
         this.scene.things.push(ball_carrier = new Thing(
            new Vector.Vector(660,6,0), Things.Player,
            new RouteFollower(
                [new Vector.Vector(420, 6, 0), new Vector.Vector(420, 240, 0), new Vector.Vector(660, 240, 0)],
                0.8), new PlayerDrawer('blue')));    
         ball_carrier.possessions.push(new Thing(new Vector.Vector(0,0,0), Things.Ball))
        window.setInterval(this.update, 16.666);
    }
    update = () => { 
        this.scene.things.forEach(t => t.update());
        this.scene.things.forEach(t => t.draw(this.canvas));
    }
    scene:Scene = new Scene();
}