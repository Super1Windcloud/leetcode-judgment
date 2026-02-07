use std::collections::VecDeque;

struct MyStack {

    /// There could only be two status at all time
    /// 1. One contains N elements, the other is empty
    /// 2. One contains N - 1 elements, the other contains exactly 1 element
    q_1: VecDeque<i32>,
    q_2: VecDeque<i32>,
    // Either 1 or 2, originally begins from 1
    index: i32,

}

impl MyStack {

    fn new() -> Self {
    
}

    fn move_data(&mut self) {
    
}

    fn push(&mut self, x: i32) {
    
}

    fn pop(&mut self) -> i32 {
    
}

    fn top(&mut self) -> i32 {
    
}

    fn empty(&self) -> bool {
    
}

}
