export default class Stack<Item> implements Iterable<Item> {

    private first: StackNode<Item> | null = null
    private n = 0

    public constructor(iterable?: Iterable<Item>) {
        if (!iterable) return
        for (const item of iterable)
            this.push(item)
    }

    // add the item to the front
    public push(item: Item): void {
        const newFirst = new StackNode<Item>(item, this.first)
        this.first = newFirst
        this.n++
    }

    // remove and return the item from the front
    public pop(): Item | null {
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
        return new LinkedStackIterator(this.first)
    }
}

class StackNode<Item> {
    public item: Item
    public next: StackNode<Item> | null = null
    public constructor(item: Item, next?: StackNode<Item> | null | undefined) { 
        this.item = item 
        this.next = next ?? null
    }
}

class LinkedStackIterator<Item> implements Iterator<Item> {

    private current: StackNode<Item> | null

    public constructor(node: StackNode<Item> | null) {
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

// let s = new Stack<number>()
// console.log(s.peek())
// console.log(s.isEmpty())
// s.push(1)
// s.push(2)
// s.push(3)
// s.push(4)
// console.log(s.peek())
// console.log(s.size())
// console.log(s.isEmpty())
// for (let n of s) 
//     console.log(n)
// s.pop()
// s.pop()
// console.log(s.peek())
// console.log(s.size())
// console.log(s.isEmpty())
// for (let n of s) 
//     console.log(n)
// s.pop()
// s.pop()
// for (let n of s) 
//     console.log(n)
// console.log(s.peek())
// console.log(s.size())
// console.log(s.isEmpty())
// node dist/lib/APIs/data_structures/Stack.js