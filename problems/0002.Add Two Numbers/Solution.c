/**
 * Definition for singly-linked list.
 * struct ListNode {

 *     int val;
 *     struct ListNode *next;
 * 
};
 */

struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {

    struct ListNode* dummy = (struct ListNode*) malloc(sizeof(struct ListNode));
    dummy->val = 0;
    dummy->next = NULL;
    struct ListNode* curr = dummy;
    int carry = 0;

    while (l1 != NULL || l2 != NULL || carry != 0) {
    
}

    struct ListNode* result = dummy->next;
    free(dummy);
    return result;

}
