import { Random } from "../../util/Random.js";

export default class RandomizedQueue<Item> implements Iterable<Item> {

    private queue: Item[] = [];
    private n = 0;

    public constructor(iterable?: Iterable<Item>) {
        if (!iterable) return
        for (const item of iterable)
            this.enqueue(item)
    }

    // add the item
    public enqueue(item: Item): void {
        // if (item == null) throw new IllegalArgumentException();

        // if (n == queue.length) resize(queue.length * 2);
        this.queue[this.n++] = item;
    }

    // remove and return a random item
    public dequeue(): Item | null {
        // if (isEmpty()) throw new NoSuchElementException();
        const randIndex = this.randomAvailableIndex();
        const item = this.queue[randIndex];
        this.queue[randIndex] = this.queue[this.n - 1];
        this.queue.pop()
        // if (this.n > 1 && this.n == queue.length / 4) resize(queue.length / 2);
        this.n--;
        return item;
    }

    // return a random item (but do not remove it)
    public sample(): Item | null {
        // if (isEmpty()) throw new NoSuchElementException();
        return (this.isEmpty()) ? null : this.queue[this.randomAvailableIndex()]
    }

    // is the randomized queue empty?
    public isEmpty(): boolean { 
        return this.n == 0; 
    }

    // return the number of items on the randomized queue
    public size(): number { 
        return this.n; 
    }

    // return an independent iterator over items in random order
    [Symbol.iterator](): Iterator<Item> {
        return new RandomizedQueueIterator(this.queue)
    }

    private randomAvailableIndex(): number { 
        return Random.uniformInt(this.n);
    }
}

class RandomizedQueueIterator<Item> implements Iterator<Item> {

    private queue: Item[]
    private currentIndex = 0

    public constructor(queue: Item[]) {
        this.queue = [...queue]
        Random.shuffle(this.queue as object[])
    }

    public next(): IteratorResult<Item> {
        const done = this.currentIndex >= this.queue.length
        const value = this.queue[this.currentIndex++]
        return { value, done } as IteratorResult<Item>
    }
}

// let rq = new RandomizedQueue<number>()
// rq.enqueue(1)
// rq.enqueue(2)
// rq.enqueue(3)
// for (let n of rq) 
//     console.log(n)
// rq.dequeue()
// for (let n of rq) 
//     console.log(n)
// node dist/lib/APIs/data_structures/RandomizedQueue.js