class Node {

    key: number;
    val: number;
    prev: Node | null;
    next: Node | null;

    constructor(key: number, val: number) {
    
}

}

class LRUCache {

    private size: number;
    private capacity: number;
    private head: Node;
    private tail: Node;
    private cache: Map<number, Node>;

    constructor(capacity: number) {
    
}

    get(key: number): number {
    
}

    put(key: number, value: number): void {
    
}

    private removeNode(node: Node): void {
    
}

    private addToHead(node: Node): void {
    
}

}

/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
