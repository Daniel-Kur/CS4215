// Class to isolate Channel
class Channel {
    constructor(capacity = 1) {
        this.capacity = capacity;
        this.queue = [];
        this.waitingReceivers = [];
        this.mutex = new Mutex();  // Assume Mutex is implemented similar to earlier example
    }

    async send(value) {
        await this.mutex.lock();

        if (this.queue.length < this.capacity) {
            this.queue.push(value);
            if (this.waitingReceivers.length > 0) {
                const receiver = this.waitingReceivers.shift();
                receiver(value);
            }
            this.mutex.unlock();
        } else {
            // If the channel is full, we need to wait until a receiver has taken an item
            await new Promise(resolve => {
                const sender = () => {
                    this.queue.push(value);
                    this.mutex.unlock();
                    resolve();
                };
                this.waitingReceivers.push(sender);
            });
        }
    }

    async receive() {
        await this.mutex.lock();

        if (this.queue.length > 0) {
            const value = this.queue.shift();
            this.mutex.unlock();
            return value;
        } else {
            // If the channel is empty, wait for a value to be sent
            return new Promise(resolve => {
                this.waitingReceivers.push(resolve);
                this.mutex.unlock();
            });
        }
    }
}