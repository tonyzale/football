///<reference path="../DefinitelyTyped/qunit/qunit.d.ts"/>
///<reference path="game.ts"/>
 
QUnit.module("generator.ts tests");
 
test("Player Debug Output", function () {
    // Arrange
    var thing = new Thing(new Vector.Vector(1,2,3),Things.Player, function(thing:Thing){});
 
    // Act
    var debug_str: String = thing + "";
 
    // Assert
    equal(debug_str, "Player: (1,2,3)");
});