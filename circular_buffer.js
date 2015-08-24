var CircularBuffer = (function () {
    function CircularBuffer(size) {
        this.size = size;
        this.buffer = [];
    }
    CircularBuffer.prototype.push = function (el) {
        this.buffer.push(el);
        if (this.buffer.length > this.size) {
            this.buffer.shift();
        }
        return this.buffer.length;
    };
    CircularBuffer.prototype.pop = function () {
        return this.buffer.pop();
    };
    return CircularBuffer;
})();
