// Class to isolate Wait Groups Instances
class WaitGroup {
    constructor() {
        this.counter = 0;
        this.promiseResolvers = [];
    }

    add(count = 1) {
        this.counter += count;
    }

    done() {
        this.counter -= 1;
        if (this.counter === 0) {
            this.promiseResolvers.forEach(resolve => resolve());
            this.promiseResolvers = [];
        }
    }

    async wait() {
        if (this.counter > 0) {
            await new Promise(resolve => this.promiseResolvers.push(resolve));
        }
    }
}