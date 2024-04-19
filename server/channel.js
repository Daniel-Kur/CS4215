class Channel {
    constructor(bufferSize = 0) {
        this.buffer = [];
        this.bufferSize = bufferSize;
        this.waitingSenders = [];
        this.waitingReceivers = [];
    }

    send(value) {
        if (this.waitingReceivers.length > 0) {
            const receiver = this.waitingReceivers.shift();
            receiver(value);
        } else {
            if (this.buffer.length < this.bufferSize) {
                this.buffer.push(value);
            } else {
                return new Promise(resolve => {
                    this.waitingSenders.push(() => resolve(value));
                });
            }
        }
    }

    receive() {
        if (this.buffer.length > 0) {
            return Promise.resolve(this.buffer.shift());
        } else {
            if (this.waitingSenders.length > 0) {
                const sender = this.waitingSenders.shift();
                sender();
                return Promise.resolve(this.buffer.shift());
            } else {
                return new Promise(resolve => {
                    this.waitingReceivers.push(resolve);
                });
            }
        }
    }
}