///<reference path="../DefinitelyTyped/qunit/qunit.d.ts"/>
///<reference path="game.ts"/>
///<reference path="player.ts"/>
 
QUnit.module("scene and thing tests");

function MakeNewThing(updatable?:UpdateLogic) : Thing {
    return new Thing(new Vector.Vector(1,2,3), Things.Player, null, updatable);
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
    thing.update();
    deepEqual(thing.pos, new Vector.Vector(2,2,3));
    thing.update();
    deepEqual(thing.pos, new Vector.Vector(3,2,3));
})

test("RouteFollower", function() {
    var thing = MakeNewThing(new RouteFollower([new Vector.Vector(1,0,3), new Vector.Vector(1,0,2)], 1));
    deepEqual(thing.pos, new Vector.Vector(1,2,3));
    thing.update();
    deepEqual(thing.pos, new Vector.Vector(1,1,3));
    thing.update();
    deepEqual(thing.pos, new Vector.Vector(1,0,3));
    thing.update();
    deepEqual(thing.pos, new Vector.Vector(1,0,2));
})

test("SpeedOffsetRouteFollower", function() {
    var thing =  new Thing(new Vector.Vector(1,2,3), Things.Player,null,
        new RouteFollower([new Vector.Vector(1,0,3), new Vector.Vector(1,0,2)], 0.6));
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,2,3)) < 0.01);
    thing.update();
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,1.4,3)) < 0.01);
    thing.update();
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0.8,3)) < 0.01);
    thing.update();
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0.2,3)) < 0.01);
    thing.update();
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0,2.6)) < 0.01);
    thing.update();
    ok(Vector.Vector.dist(thing.pos, new Vector.Vector(1,0,2.0)) < 0.01);
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