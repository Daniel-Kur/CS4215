class Mutex {
    constructor() {
        this.locked = false;
        this.waiting = [];
    }

    lock() {
        if (this.locked) {
            return new Promise(resolve => {
                this.waiting.push(resolve);
            });
        } else {
            this.locked = true;
            return Promise.resolve();
        }
    }

    unlock() {
        if (this.waiting.length > 0) {
            const next = this.waiting.shift();
            next();
        } else {
            this.locked = false;
        }
    }
}