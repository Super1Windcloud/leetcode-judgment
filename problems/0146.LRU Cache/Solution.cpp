class LRUCache {

private:
    struct Node {

        int key, val;
        Node* prev;
        Node* next;
        Node(int key, int val)
            : key(key)
            , val(val)
            , prev(nullptr)
            , next(nullptr) {
    
}
    
};

    int size;
    int capacity;
    Node* head;
    Node* tail;
    unordered_map<int, Node*> cache;

    void removeNode(Node* node) {
    
}

    void addToHead(Node* node) {
    
}

public:
    LRUCache(int capacity)
        : size(0)
        , capacity(capacity) {
    
}

    int get(int key) {
    
}

    void put(int key, int value) {
    
}

};

/**
 * Your LRUCache object will be instantiated and called as such:
 * LRUCache* obj = new LRUCache(capacity);
 * int param_1 = obj->get(key);
 * obj->put(key,value);
 */
