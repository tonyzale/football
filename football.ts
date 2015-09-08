/// <reference path="game.ts" />
/// <reference path="player.ts" />
/// <reference path="rand.ts" />

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

class AreaDrawLogic implements DrawLogic {
    draw(thing: Thing, canvas: HTMLCanvasElement, pixels_per_inch: number): void {
        var context = canvas.getContext("2d");
        context.beginPath();
        context.arc(thing.pos.x * pixels_per_inch, thing.pos.y * pixels_per_inch, thing.radius * pixels_per_inch, 0, 2 * Math.PI, false);
        context.fillStyle = "rgba(255,165,0,0.7)";
        context.fill();       
    }
}

class BlockDrillLogic implements UpdateLogic {
    constructor(private game: Game) {
        this.blocker = game.addPlayer(YardsVecToInches(new Vector.Vector(50,26,0)), "blue");
        this.blocker.behavior = "block";
        this.defender = game.addPlayer(YardsVecToInches(new Vector.Vector(53, 26, 0)), "red");
        this.defender.behavior = "defend";
        this.goal = new Thing(YardsVecToInches(new Vector.Vector(48, 25, 0)), Things.Area, 12, new AreaDrawLogic());
        game.scene.things.push(this.goal);
        this.defender.updatable.logics.push(new ChaseLogic(this.goal, 1));
        this.blocker.updatable.logics.push(new ChaseDynamicLogic((): Vector.Vector => {
            if (Vector.Vector.dist_sqrd(this.blocker.pos, this.goal.pos) < Vector.Vector.dist_sqrd(this.blocker.pos, this.defender.pos))
                return Vector.Vector.times(0.5, Vector.Vector.plus(this.goal.pos, this.defender.pos));
            return this.blocker.pos;
        }, 0.5));
        game.collison_resolvers.push((c: Collision) : boolean => {
            if (!c.isBetweenThings(this.defender, this.goal)) { return false; }
            if (c.continuous_time > 0.5) {
                this.resetDrill();
            }
            return true;
        });
        game.collison_resolvers.push((c: Collision) : boolean => {
            if (!c.isBetweenBehaviors("block", "defend")) { return false; }
                if (c.thing1.behavior == "defend") {
                    var defender = c.thing1;
                    var blocker = c.thing2;
                } else {
                    var defender = c.thing2;
                    var blocker = c.thing1;
                }
                if (c.continuous_time < 0.3) {
                    c.thing1.updatable.logics.push(new ExpiringUpdateLogic(new DoNothingLogic(), game.update_interval, c.thing1.updatable));
                    c.thing2.updatable.logics.push(new ExpiringUpdateLogic(new DoNothingLogic(), game.update_interval, c.thing2.updatable));
                } else {
                    var roll = Math.random();
                    if (roll < 0.1) {
                        var push_dir = Vector.Vector.norm(Vector.Vector.minus(defender.pos, blocker.pos));
                        var push_pos = Vector.Vector.plus(defender.pos, Vector.Vector.times(36, push_dir));
                        var speed_randomization = Math.random() * 0.2;
                        defender.updatable.logics.push(new ExpireOnArrivalLogic(new RouteFollower([push_pos], 1 + speed_randomization), defender.updatable));
                        push_pos = Vector.Vector.plus(blocker.pos, Vector.Vector.times(10, push_dir));
                        blocker.updatable.logics.push(new ExpireOnArrivalLogic(new RouteFollower([push_pos], 0.7 + speed_randomization), blocker.updatable));
                    } else if (roll < 0.2) {
                        var push_dir = Vector.Vector.norm(Vector.Vector.minus(blocker.pos, defender.pos));
                        var push_pos = Vector.Vector.plus(blocker.pos, Vector.Vector.times(36, push_dir));
                        var speed_randomization = Math.random() * 0.2;
                        blocker.updatable.logics.push(new ExpireOnArrivalLogic(new RouteFollower([push_pos], 1 + speed_randomization), blocker.updatable));  
                        push_pos = Vector.Vector.plus(defender.pos, Vector.Vector.times(10, push_dir));
                        defender.updatable.logics.push(new ExpireOnArrivalLogic(new RouteFollower([push_pos], 0.7 + speed_randomization), defender.updatable));                      
                    } else {
                        c.thing1.updatable.logics.push(new ExpiringUpdateLogic(new DoNothingLogic(), game.update_interval, c.thing1.updatable));
                        c.thing2.updatable.logics.push(new ExpiringUpdateLogic(new DoNothingLogic(), game.update_interval, c.thing2.updatable));                        
                    }
                }
                return true;
        });
    }
    resetDrill() {
        this.blocker.pos = YardsVecToInches(new Vector.Vector(normal_random(50),normal_random(26),0));
        this.blocker.updatable.reset();
        this.defender.pos = YardsVecToInches(new Vector.Vector(normal_random(53), normal_random(26), 0));
        this.defender.updatable.reset();
        this.defender.updatable.logics.push(new ChaseLogic(this.goal, 1));
        this.blocker.updatable.logics.push(new ChaseDynamicLogic((): Vector.Vector => {
            if (Vector.Vector.dist_sqrd(this.blocker.pos, this.goal.pos) < Vector.Vector.dist_sqrd(this.blocker.pos, this.defender.pos))
                return Vector.Vector.times(0.5, Vector.Vector.plus(this.goal.pos, this.defender.pos));
            return this.blocker.pos;
        }, 0.5));
        // do nothing for 1s before start
        this.blocker.updatable.logics.push(new ExpiringUpdateLogic(new DoNothingLogic(), 1, this.blocker.updatable));
        this.defender.updatable.logics.push(new ExpiringUpdateLogic(new DoNothingLogic(), 1, this.defender.updatable));
    }
    update(thing: Thing, delta: number) {}
    blocker: Thing;
    defender: Thing;
    goal: Thing;
}

class Game {
    constructor(private canvas: HTMLCanvasElement){
        this.pixels_per_inch = canvas.width / (120 * 3 * 12);
        this.player_size = 18;
        this.scene.things.push(new Thing(new Vector.Vector(0,0,0), Things.Field,null,new FieldDrawer()));
        this.scene.things.push(new Thing(new Vector.Vector(0,0,0), Things.Manager, null, null, new BlockDrillLogic(this)));
        window.setInterval(this.update, this.update_interval);
    }
    update = () => { 
        this.scene.things.forEach(t => t.update(this.update_interval));
        this.updateCollisions();
        this.scene.things.forEach(t => t.draw(this.canvas, this.pixels_per_inch));
    }
    updateCollisions() {
        var old_collisions = this.latest_collisions;
        this.latest_collisions = this.scene.getCollisionPairs();
        this.latest_collisions.forEach(c=>{
           var old_matches = old_collisions.filter(old_c=>{return old_c.isSameCollision(c);});
           if (old_matches.length > 1) throw "duplicate collisions!";
           if (old_matches.length == 1) {
               c.continuous_time = old_matches[0].continuous_time + this.update_interval;
           }
           this.resolveCollision(c);
        });
           
    }
    resolveCollision(c: Collision) {
        for (var i = 0; i < this.collison_resolvers.length; ++i) {
            if (this.collison_resolvers[i](c)) { return; }
        }
    }
    scene:Scene = new Scene();
    newPlayer() {
        var x: number = (<HTMLInputElement>document.getElementById("xpos")).valueAsNumber;
        var y: number = (<HTMLInputElement>document.getElementById("ypos")).valueAsNumber;
        this.scene.things.push(new Thing(
            YardsVecToInches(new Vector.Vector(x,y,0)), Things.Player, this.player_size, new PlayerDrawer('red')));        
    }
    addPlayer(pos: Vector.Vector, color: string) {
        var player = new Thing(pos, Things.Player, this.player_size, new PlayerDrawer(color));
        this.scene.things.push(player);
        return player;
    }
    players() {
        return this.scene.things.filter(t => {return t.type == Things.Player;})
    }
    pixels_per_inch: number;
    player_size: number;
    update_interval: number = 0.0166666;
    latest_collisions: Collision[] = [];
    collison_resolvers: {(c: Collision): boolean}[] = [];
}