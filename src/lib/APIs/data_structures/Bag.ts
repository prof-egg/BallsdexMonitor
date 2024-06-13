/******************************************************************************
 *  A generic bag or multiset, implemented using a singly linked list.
 *
 ******************************************************************************/

/**
 *  The `Bag` class represents a bag (or multiset) of
 *  generic items. It supports insertion and iterating over the
 *  items in arbitrary order.
 *  @param Item the generic type of each item in this bag
 *  @example
 *  // Prints: there! Hello Oh!
 *  const bag = new Bag<string>()
 *  bag.add("Oh!")
 *  bag.add("Hello")
 *  bag.add("there!")
 *  for (let s of bag) 
 *      console.log(s)
 */

export default class Bag<Item> implements Iterable<Item> {

    private head: BagNode<Item> | null = null
    private n = 0
    
    public constructor(iterable?: Iterable<Item>) {
        if (!iterable) return
        for (const item of iterable)
            this.add(item)
    }

    public add(item: Item): void {
        const newNode = new BagNode<Item>(item, this.head)
        this.head = newNode
        this.n++
    }

    public isEmpty(): boolean {
        return this.n == 0
    }

    public get size(): number {
        return this.n;
    }

    [Symbol.iterator](): Iterator<Item> {
        return new LinkedBagIterator(this.head)
    }
}

class BagNode<Item> {
    public item: Item
    public next: BagNode<Item> | null = null
    public constructor(item: Item, next: BagNode<Item> | null) { 
        this.item = item 
        this.next = next ?? null
    }
}

class LinkedBagIterator<Item> implements Iterator<Item> {

    private current: BagNode<Item> | null

    public constructor(node: BagNode<Item> | null) {
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

// let bag = new Bag(["1"])
// node dist/lib/APIs/data_structures/Bag.js