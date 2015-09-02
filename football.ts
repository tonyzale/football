/// <reference path="game.ts" />
/// <reference path="player.ts" />

// Draws a horizontally rendered field on HTMLCanvasElement with field's "Thing" locating its upper left.
class FieldDrawer implements DrawLogic {
    draw(thing: Thing, canvas: HTMLCanvasElement, pixels_per_inch: number) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        var yard_in_pixels = pixels_per_inch * 12 * 3;
        var ten_yards_in_pixels = 10 * yard_in_pixels;
        var bottom_field_y = thing.pos.y + 53.333 * yard_in_pixels;
        ctx.fillRect(thing.pos.x, thing.pos.y,
            120 * yard_in_pixels, 53.333 * yard_in_pixels);
        for (var i = 0; i < 11; i++) {
            if ((i == 0) || (i == 10)) {
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
            }
            ctx.beginPath();
            ctx.moveTo(thing.pos.x + (i+1)*ten_yards_in_pixels, thing.pos.y);
            ctx.lineTo(thing.pos.x + (i+1)*ten_yards_in_pixels, thing.pos.y + bottom_field_y);
            ctx.stroke();
        }
    }
}

// A +-+---------------+-+ C
//   |/|               |/|
//   |/|       M       |/|    M - middle of 50yd line
//   |/|               |/|
// B +-+---------------+-+ D
//
// POINT |   YARDS VEC   |   INCHES VEC
//   A   |   (0,0)       |    (0,0)
//   B   |   (0,53.33)   |    (0,1920)
//   C   |   (120,0)     |    (4320,0)
//   D   |   (120,53.33) |    (4320,1920)
//   M   |   (60, 26.67) |    (2160,960)    
function YardsToInches(yards: number): number {
    return yards * 36;
}

function YardsVecToInches(pos: Vector.Vector): Vector.Vector {
    pos.x *= 36;
    pos.y *= 36;
    return pos;
}

class Game {
    constructor(private canvas: HTMLCanvasElement){
        this.pixels_per_inch = canvas.width / (120 * 3 * 12);
        this.player_size = 18;
        this.scene.things.push(new Thing(new Vector.Vector(0,0,0), Things.Field,null,new FieldDrawer()));
        this.scene.things.push(new Thing(
            YardsVecToInches(new Vector.Vector(10,1,0)), Things.Player, this.player_size,
            new PlayerDrawer('red'), new RouteFollower(
                [new Vector.Vector(50, 1, 0), new Vector.Vector(50, 20, 0),
                    new Vector.Vector(10, 20, 0)].map(v=>{return YardsVecToInches(v);}),
                5)));
         var ball_carrier: Thing;
         this.scene.things.push(ball_carrier = new Thing(
            YardsVecToInches(new Vector.Vector(110,1,0)), Things.Player, this.player_size,
            new PlayerDrawer('blue'), new RouteFollower(
                [new Vector.Vector(70, 1, 0), new Vector.Vector(70, 20, 0), new Vector.Vector(110, 20, 0)].map(v=>{return YardsVecToInches(v);}),
                5)));    
         ball_carrier.possessions.push(new Thing(new Vector.Vector(0,0,0), Things.Ball))
        window.setInterval(this.update, this.update_interval);
    }
    update = () => { 
        this.scene.things.forEach(t => t.update(this.update_interval));
        this.scene.things.forEach(t => t.draw(this.canvas, this.pixels_per_inch));
    }
    scene:Scene = new Scene();
    newPlayer() {
        var x: number = (<HTMLInputElement>document.getElementById("xpos")).valueAsNumber;
        var y: number = (<HTMLInputElement>document.getElementById("ypos")).valueAsNumber;
        this.scene.things.push(new Thing(
            YardsVecToInches(new Vector.Vector(x,y,0)), Things.Player, this.player_size, new PlayerDrawer('red')));        
    }

    pixels_per_inch: number;
    player_size: number;
    update_interval: number = 16.6666;
}