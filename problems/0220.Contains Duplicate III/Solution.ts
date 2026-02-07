function containsNearbyAlmostDuplicate(
    nums: number[],
    indexDiff: number,
    valueDiff: number,
): boolean {
    
}

type Compare<T> = (lhs: T, rhs: T) => number;

class RBTreeNode<T = number> {

    data: T;
    count: number;
    left: RBTreeNode<T> | null;
    right: RBTreeNode<T> | null;
    parent: RBTreeNode<T> | null;
    color: number;
    constructor(data: T) {
    
}

    sibling(): RBTreeNode<T> | null {
    
}

    isOnLeft(): boolean {
    
}

    hasRedChild(): boolean {
    
}

}

class RBTree<T> {

    root: RBTreeNode<T> | null;
    lt: (l: T, r: T) => boolean;
    constructor(compare: Compare<T> = (l: T, r: T) => (l < r ? -1 : l > r ? 1 : 0)) {
    
}

    rotateLeft(pt: RBTreeNode<T>): void {
    
}

    rotateRight(pt: RBTreeNode<T>): void {
    
}

    swapColor(p1: RBTreeNode<T>, p2: RBTreeNode<T>): void {
    
}

    swapData(p1: RBTreeNode<T>, p2: RBTreeNode<T>): void {
    
}

    fixAfterInsert(pt: RBTreeNode<T>): void {
    
}

    delete(val: T): boolean {
    
}

    deleteAll(val: T): boolean {
    
}

    deleteNode(v: RBTreeNode<T>): void {
    
}

    fixDoubleBlack(x: RBTreeNode<T>): void {
    
}

    insert(data: T): boolean {
    
}

    find(data: T): RBTreeNode<T> | null {
    
}

    *inOrder(root: RBTreeNode<T> = this.root!): Generator<T, undefined, void> {
    
}

    *reverseInOrder(root: RBTreeNode<T> = this.root!): Generator<T, undefined, void> {
    
}

}

class TreeSet<T = number> {

    _size: number;
    tree: RBTree<T>;
    compare: Compare<T>;
    constructor(
        collection: T[] | Compare<T> = [],
        compare: Compare<T> = (l: T, r: T) => (l < r ? -1 : l > r ? 1 : 0),
    ) {
    
}

    size(): number {
    
}

    has(val: T): boolean {
    
}

    add(val: T): boolean {
    
}

    delete(val: T): boolean {
    
}

    ceil(val: T): T | undefined {
    
}

    floor(val: T): T | undefined {
    
}

    higher(val: T): T | undefined {
    
}

    lower(val: T): T | undefined {
    
}

    first(): T | undefined {
    
}

    last(): T | undefined {
    
}

    shift(): T | undefined {
    
}

    pop(): T | undefined {
    
}

    *[Symbol.iterator](): Generator<T, void, void> {
    
}

    *keys(): Generator<T, void, void> {
    
}

    *values(): Generator<T, undefined, void> {
    
}

    /**
     * Return a generator for reverse order traversing the set
     */
    *rvalues(): Generator<T, undefined, void> {
    
}

}

class TreeMultiSet<T = number> {

    _size: number;
    tree: RBTree<T>;
    compare: Compare<T>;
    constructor(
        collection: T[] | Compare<T> = [],
        compare: Compare<T> = (l: T, r: T) => (l < r ? -1 : l > r ? 1 : 0),
    ) {
    
}

    size(): number {
    
}

    has(val: T): boolean {
    
}

    add(val: T): boolean {
    
}

    delete(val: T): boolean {
    
}

    count(val: T): number {
    
}

    ceil(val: T): T | undefined {
    
}

    floor(val: T): T | undefined {
    
}

    higher(val: T): T | undefined {
    
}

    lower(val: T): T | undefined {
    
}

    first(): T | undefined {
    
}

    last(): T | undefined {
    
}

    shift(): T | undefined {
    
}

    pop(): T | undefined {
    
}

    *[Symbol.iterator](): Generator<T, void, void> {
    
}

    *keys(): Generator<T, void, void> {
    
}

    *values(): Generator<T, undefined, void> {
    
}

    /**
     * Return a generator for reverse order traversing the multi-set
     */
    *rvalues(): Generator<T, undefined, void> {
    
}

}
