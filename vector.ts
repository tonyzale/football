module Vector {
    export class Vector {
        constructor(public x: number,
                    public y: number,
                    public z: number) {
        }
        static times(k: number, v: Vector) { return new Vector(k * v.x, k * v.y, k * v.z); }
        static minus(v1: Vector, v2: Vector) { return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z); }
        static plus(v1: Vector, v2: Vector) { return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z); }
        static dot(v1: Vector, v2: Vector) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z; }
        static mag(v: Vector) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); }
        static mag_sqrd(v: Vector) { return v.x * v.x + v.y * v.y + v.z * v.z; }
        static norm(v: Vector) {
            var mag = Vector.mag(v);
            var div = (mag === 0) ? Infinity : 1.0 / mag;
            return Vector.times(div, v);
        }
        static dist(v1: Vector, v2: Vector) { return this.mag(this.minus(v1, v2)); }
        static dist_sqrd(v1: Vector, v2: Vector) { return this.mag_sqrd(this.minus(v1, v2)); }
        static cross(v1: Vector, v2: Vector) {
            return new Vector(v1.y * v2.z - v1.z * v2.y,
                            v1.z * v2.x - v1.x * v2.z,
                            v1.x * v2.y - v1.y * v2.x);
        }
        static set(v1: Vector, v2: Vector) {
            v1.x = v2.x;
            v1.y = v2.y;
            v1.z = v2.z;
        }
        static rot2d(rads: number, v: Vector) {
            return new Vector(v.x * Math.cos(rads) - v.y * Math.sin(rads),
                              v.x * Math.sin(rads) + v.y * Math.cos(rads),
                              v.z);
        }
        toString(): String {
            return "(" + this.x.toFixed(1) + "," + this.y.toFixed(1) + "," + this.z.toFixed(1) + ")";
        }
    }
}