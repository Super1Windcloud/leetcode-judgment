type Node struct {

	key, val   int
	prev, next *Node

}

type LRUCache struct {

	size, capacity int
	head, tail     *Node
	cache          map[int]*Node

}

func Constructor(capacity int) LRUCache {
    
}

func (this *LRUCache) Get(key int) int {
    
}

func (this *LRUCache) Put(key int, value int) {
    
}

func (this *LRUCache) removeNode(node *Node) {
    
}

func (this *LRUCache) addToHead(node *Node) {
    
}

/**
 * Your LRUCache object will be instantiated and called as such:
 * obj := Constructor(capacity);
 * param_1 := obj.Get(key);
 * obj.Put(key,value);
 */

/**
 * Your LRUCache object will be instantiated and called as such:
 * obj := Constructor(capacity);
 * param_1 := obj.Get(key);
 * obj.Put(key,value);
 */
