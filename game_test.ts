///<reference path="../DefinitelyTyped/qunit/qunit.d.ts"/>
///<reference path="game.ts"/>
 
QUnit.module("generator.ts tests");

function MakeNewThing() : Thing {
    return new Thing(new Vector.Vector(1,2,3), Things.Player, function(thing:Thing){});
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