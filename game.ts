/// <reference path="Vector.ts" />

enum Things {Player};

interface Thing {
    pos: Vector.Vector;
    type: Things;
    update(thing: Thing): void;
}

interface Scene {
    things: Thing[];
}