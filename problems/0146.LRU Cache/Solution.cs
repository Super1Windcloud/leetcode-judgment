public class LRUCache {

    private int size;
    private int capacity;
    private Dictionary<int, Node> cache = new Dictionary<int, Node>();
    private Node head = new Node();
    private Node tail = new Node();

    public LRUCache(int capacity) {
    
}

    public int Get(int key) {
    
}

    public void Put(int key, int value) {
    
}

    private void RemoveNode(Node node) {
    
}

    private void AddToHead(Node node) {
    
}

    // Node class to represent each entry in the cache.
    private class Node {

        public int Key;
        public int Val;
        public Node Prev;
        public Node Next;

        public Node() {
    
}

        public Node(int key, int val) {
    
}
    
}

}

/**
 * Your LRUCache object will be instantiated and called as such:
 * LRUCache obj = new LRUCache(capacity);
 * int param_1 = obj.Get(key);
 * obj.Put(key,value);
 */
