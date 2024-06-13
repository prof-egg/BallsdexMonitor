export default class Deque<Item> implements Iterable<Item> {

    protected first: DequeNode<Item> | null = null
    protected last: DequeNode<Item> | null = null
    protected n = 0

    public constructor(iterable?: Iterable<Item>, addToFront?: boolean) {
        if (!iterable) return
        if (!addToFront) addToFront = false
        
        for (const item of iterable)
            if (addToFront)
                this.addFirst(item)
            else
                this.addLast(item)
    }
    
    // add the item to the front
    public addFirst(item: Item): void {

        const oldFirst = this.first
        this.first = new DequeNode<Item>(item, oldFirst)
        
        // Set the 
        if (oldFirst) oldFirst.previous = this.first
        if (this.isEmpty()) this.last = this.first

        this.n++
    }

    // add the item to the back
    public addLast(item: Item): void {

        const oldLast = this.last
        this.last = new DequeNode<Item>(item, null, oldLast)

        // Set the 
        if (oldLast) oldLast.next = this.last
        if (this.isEmpty()) this.first = this.last

        this.n++
    }

    // remove and return the item from the front
    public removeFirst(): Item | null {

        // if (this.isEmpty()) throw new NoSuchElementException();

        const oldFirst = this.first
        this.first = this.first?.next ?? null
        if (this.first != null) this.first.previous = null
        if (this.n == 1) this.last = null
        this.n--
        return oldFirst?.item ?? null
    }

    // remove and return the item from the back
    public removeLast(): Item | null {

        // if (this.isEmpty()) throw new NoSuchElementException();

        const oldLast = this.last
        this.last = this.last?.previous ?? null
        if (this.last != null) this.last.next = null
        if (this.n == 1) this.first = null
        this.n--
        return oldLast?.item ?? null
    }

    public peekFirst(): Item | null {
        return this.first?.item ?? null
    }

    public peekLast(): Item | null {
        return this.last?.item ?? null
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
        return new LinkedDequeIterator(this.first)
    }
}

class DequeNode<Item> {
    public item: Item
    public next: DequeNode<Item> | null = null
    public previous: DequeNode<Item> | null = null
    public constructor(item: Item, next?: DequeNode<Item> | null | undefined, previous?: DequeNode<Item> | null) { 
        this.item = item 
        this.next = next ?? null
        this.previous = previous ?? null
    }
}

class LinkedDequeIterator<Item> implements Iterator<Item> {

    private current: DequeNode<Item> | null

    public constructor(node: DequeNode<Item> | null) {
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

// let d = new Deque<number>()
// console.log("PEEKING:")
// console.log(d.peekFirst())
// console.log(d.peekLast())
// console.log()
// d.addFirst(2)
// console.log("PEEKING:")
// console.log(d.peekFirst())
// console.log(d.peekLast())
// console.log()
// d.addLast(3)
// d.addFirst(1)
// d.addLast(4)
// console.log("PEEKING:")
// console.log(d.peekFirst())
// console.log(d.peekLast())
// console.log()
// for (let n of d)
//     console.log(n)

// node dist/lib/APIs/data_structures/Deque.js