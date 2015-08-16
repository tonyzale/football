///<reference path="../DefinitelyTyped/qunit/qunit.d.ts"/>
///<reference path="game.ts"/>
 
QUnit.module("generator.ts tests");

function MakeNewThing(updatable?:UpdateLogic) : Thing {
    return new Thing(new Vector.Vector(1,2,3), Things.Player, updatable);
}
 
test("Player Debug Output", function () {
    // Arrange
    var thing = MakeNewThing();
 
    // Assert
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
    equal(thing + "", "Player: (1,2,3)");
    thing.update();
    equal(thing + "", "Player: (2,2,3)");
    thing.update();
    equal(thing + "", "Player: (3,2,3)");
})