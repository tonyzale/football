/// <reference path="game.ts" />

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