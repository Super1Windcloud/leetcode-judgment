use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

struct Node {

    key: i32,
    value: i32,
    prev: Option<Rc<RefCell<Node>>>,
    next: Option<Rc<RefCell<Node>>>,

}

impl Node {

    #[inline]
    fn new(key: i32, value: i32) -> Self {
    
}

}

struct LRUCache {

    capacity: usize,
    cache: HashMap<i32, Rc<RefCell<Node>>>,
    head: Option<Rc<RefCell<Node>>>,
    tail: Option<Rc<RefCell<Node>>>,

}

/**
 * `&self` means the method takes an immutable reference.
 * If you need a mutable reference, change it to `&mut self` instead.
 */
impl LRUCache {

    fn new(capacity: i32) -> Self {
    
}

    fn get(&mut self, key: i32) -> i32 {
    
}

    fn put(&mut self, key: i32, value: i32) {
    
}

    fn push_front(&mut self, node: &Rc<RefCell<Node>>) {
    
}

    fn remove(&mut self, node: &Rc<RefCell<Node>>) {
    
}

    fn pop_back(&mut self) -> Option<Rc<RefCell<Node>>> {
    
}

}
