///<reference path="../DefinitelyTyped/qunit/qunit.d.ts"/>
///<reference path="game.ts"/>
///<reference path="player.ts"/>
 
QUnit.module("scene and thing tests");

function MakeNewThing(updatable?:UpdateLogic) : Thing {
    var thing = new Thing(new Vector.Vector(1,2,3), Things.Player, null);
    if (updatable) thing.updatable.logics.push(updatable);
    return thing;
}
 
test("Player Debug Output", function () {
    var thing = MakeNewThing();
    equal(thing + "", "Player: (1,2,3)");
});

test("Scene", function() {
   var scene = new Scene();
   scene.things.push(MakeNewThing());
   scene.things.push(MakeNewThing());
   
   equal(scene + "", "Player: (1,2,3)\nPlayer: (1,2,3)")
});

class TestUpdatable implements UpdateLogic {
    update(thing:Thing) {
        if (thing.pos.x < 3) {
            thing.pos.x += 1;
        }
    }
}

test("UpdateLogic", function() {
    var thing = MakeNewThing(new TestUpdatable());
    deepEqual(thing.pos, new Vector.Vector(1,2,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(2,2,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(3,2,3));
})

test("UpdateStack", function() {
    var thing = MakeNewThing(new TestUpdatable());
    deepEqual(thing.pos, new Vector.Vector(1,2,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(2,2,3));
    thing.updatable.logics.push(new DoNothingLogic());
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(2,2,3));
    thing.updatable.logics.pop();
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(3,2,3));
})

test("ExpiringUpdate", function() {
    var thing = MakeNewThing();
    deepEqual(thing.pos, new Vector.Vector(1,2,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(1,2,3));
    thing.updatable.logics.push(new ExpiringUpdateLogic(new TestUpdatable(), 2, thing.updatable));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(2,2,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(3,2,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(3,2,3));
})

test("RouteFollower", function() {
    var thing = MakeNewThing(new RouteFollower([new Vector.Vector(1,0,3), new Vector.Vector(1,0,2)], 1));
    deepEqual(thing.pos, new Vector.Vector(1,2,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(1,1,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(1,0,3));
    thing.update(1);
    deepEqual(thing.pos, new Vector.Vector(1,0,2));
})

test("SpeedOffsetRouteFollower", function() {
    var thing =  new Thing(new Vector.Vector(1,2,3), Things.Player);
    thing.updatable.logics.push(
        new RouteFollower([new Vector.Vector(1,0,3), new Vector.Vector(1,0,2)], 0.6));
    var history: Vector.Vector[] = [];
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,2,3)) < 0.01);
    history.push(thing.pos);
    thing.update(1);
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,1.4,3)) < 0.01);
    history.push(thing.pos);
    thing.update(1);
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0.8,3)) < 0.01);
    history.push(thing.pos);
    thing.update(1);
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0.2,3)) < 0.01);
    history.push(thing.pos);
    thing.update(1);
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0,2.6)) < 0.01);
    history.push(thing.pos);
    thing.update(1);
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0,2.0)) < 0.01);
    history.push(thing.pos);
    equal(thing.pos_history.buffer.length, 6);
    for (var i = 0; i < 6; i++) {
        deepEqual(thing.pos_history.buffer[i], history[i]);
    }
})

test("Collisions", function() {
    var scene = new Scene();
    var thing1 = new Thing(new Vector.Vector(1,1,1), Things.Player, 2);
    scene.things.push(thing1);
    var thing2 = new Thing(new Vector.Vector(4,1,1), Things.Player, 1);
    scene.things.push(thing2);
    var thing3 = new Thing(new Vector.Vector(2.5,1,1), Things.Player, 1);
    scene.things.push(thing3);
    var collisions = scene.getCollisionPairs();
    equal(collisions.length, 2);
    equal(collisions.filter(c => {return (c.thing1 == thing1 && c.thing2 == thing3);}).length, 1);
    equal(collisions.filter(c => {return (c.thing1 == thing2 && c.thing2 == thing3);}).length, 1);
})

test("rotate", function() {
    var v = new Vector.Vector(1,0,0);
    var v2 = Vector.Vector.rot2d(Math.PI, v);
    ok(Vector.Vector.dist(v2, new Vector.Vector(-1,0,0)) < 0.01);
    var v3 = Vector.Vector.rot2d(-Math.PI, v);
    ok(Vector.Vector.dist(v3, new Vector.Vector(-1,0,0)) < 0.01);
    var v4 = Vector.Vector.rot2d(Math.PI * 0.5, v);
    ok(Vector.Vector.dist(v4, new Vector.Vector(0,1,0)) < 0.01);
    var v5 = Vector.Vector.rot2d(-Math.PI * 0.5, v);
    ok(Vector.Vector.dist(v5, new Vector.Vector(0,-1,0)) < 0.01);
    var v6 = Vector.Vector.rot2d(Math.PI * 0.25, v);
    ok(Vector.Vector.dist(v6, new Vector.Vector(0.707,0.707,0)) < 0.01);
})