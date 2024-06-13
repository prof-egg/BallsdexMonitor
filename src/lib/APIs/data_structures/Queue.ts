export default class Queue<Item> implements Iterable<Item> {

    private first: QueueNode<Item> | null = null
    private last: QueueNode<Item> | null = null
    private n = 0

    public constructor(iterable?: Iterable<Item>) {
        if (!iterable) return
        for (const item of iterable)
            this.enqueue(item)
    }

    // add the item to the back
    public enqueue(item: Item): void {

        const newLast = new QueueNode<Item>(item)
        
        if (this.last) 
            this.last.next = newLast
        if (!this.first)
            this.first = newLast

        this.last = newLast
        this.n++
    }

    // remove and return the item from the front
    public dequeue(): Item | null {
        const oldFirst = this.first
        if (!oldFirst) return null
        this.first = oldFirst.next 
        this.n--
        return oldFirst.item
    }

    public peek(): Item | null {
        return this.first?.item ?? null
    }

    // is the deque empty?
    public isEmpty(): boolean { 
        return this.n == 0
    }

    // return the number of items on the deque
    public size(): number { 
        return this.n
    }

    [Symbol.iterator](): Iterator<Item> {
        return new LinkedQueueIterator(this.first)
    }
}

class QueueNode<Item> {
    public item: Item
    public next: QueueNode<Item> | null = null
    public constructor(item: Item, next?: QueueNode<Item> | null | undefined) { 
        this.item = item 
        this.next = next ?? null
    }
}

class LinkedQueueIterator<Item> implements Iterator<Item> {

    private current: QueueNode<Item> | null

    public constructor(node: QueueNode<Item> | null) {
        this.current = node
    }

    public next(): IteratorResult<Item> {
        if (!this.current) return { value: undefined, done: true }
        const done = this.current == null
        const result: IteratorResult<Item> = { value: this.current.item, done }
        this.current = this.current.next
        return result
    }
}

// let q = new Queue<number>()
// console.log(q.peek())
// console.log(q.isEmpty())
// q.enqueue(1)
// q.enqueue(2)
// q.enqueue(3)
// q.enqueue(4)
// console.log(q.peek())
// console.log(q.size())
// console.log(q.isEmpty())
// for (let n of q) 
//     console.log(n)
// q.dequeue()
// q.dequeue()
// console.log(q.peek())
// console.log(q.size())
// console.log(q.isEmpty())
// for (let n of q) 
//     console.log(n)
// q.dequeue()
// q.dequeue()
// for (let n of q) 
//     console.log(n)
// console.log(q.peek())
// console.log(q.size())
// console.log(q.isEmpty())
// node dist/lib/APIs/data_structures/Queue.js