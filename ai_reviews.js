const aiReviews = {
    "Reverse a Singly Linked List": {
        emoji: "🔄",
        review: "The code implements finding the kth smallest element in a heap, not reversing a singly linked list as requested. The first function is correct but inefficient; the second attempts optimization but is flawed. The code demonstrates some understanding of heaps but misses the core problem statement. 🔍 The implementation needs to be completely revised to handle linked list reversal using proper pointer manipulation. ⚠️"
    },
    "Find the Kth Largest Element in an Array": {
        emoji: "🔍",
        review: "The code provides two functions to find the kth smallest element. The first function is correct but modifies the input heap. The second attempts an in-place solution but is incorrect and inefficient. Both lack error handling for non-heap input. 🎯 Consider using a more efficient approach like quickselect for better performance. ⚡"
    },
    "Implement LRU Cache": {
        emoji: "💾",
        review: "The code implements finding the kth smallest element in a heap, not an LRU cache as requested. The `find_kth_smallest` function is correct but inefficient. The `find_kth_smallest_optimized` attempts to improve efficiency but has flaws. 🔄 The implementation should be revised to use a combination of HashMap and Doubly Linked List for O(1) operations. 🚀"
    },
    "Serialize and Deserialize Binary Tree": {
        emoji: "🌳",
        review: "The code implements two functions to find the kth smallest element in a heap. The first function is simpler but modifies the input heap, while the second function is more complex but avoids modifying the original heap. Both functions have correctness issues and could be improved in terms of efficiency and style. 📝 The implementation should focus on tree traversal and serialization formats. 🌟"
    },
    "Median of a Data Stream": {
        emoji: "📊",
        review: "The code attempts to solve the kth smallest element problem, not the median-in-a-stream problem. The first function is inefficient, while the second, while attempting optimization, is incorrect and overly complex. 🔄 The solution should use two heaps (min and max) to maintain the median efficiently. ⚡"
    },
    "Implement Min Heap Insert Operation": {
        emoji: "📚",
        review: "The code attempts to solve the problem of finding the kth smallest element in a heap, but misses the core requirement of implementing a min-heap insert operation. The `find_kth_smallest` function is acceptable but inefficient. The `find_kth_smallest_optimized` function is flawed and doesn't correctly traverse a heap. 🔍 The implementation should focus on proper heap insertion with bubble-up operations. 🎯"
    },
    "Find Kth Smallest Element in a Min Heap": {
        emoji: "🎯",
        review: "The code correctly identifies the kth smallest element in a min-heap. The first approach is simpler and more efficient, while the second, though preserving the original heap, is unnecessarily complex. Style and security are good. ⭐ Consider using `heapq.nsmallest` for a more concise solution. 🚀"
    },
    "Implement Trie for Insert and Search": {
        emoji: "🔤",
        review: "The code implements finding the kth smallest element in a heap, not a Trie as requested in the problem statement. The implementations are functional but could be improved in terms of efficiency and style. 🔄 The solution should implement a proper Trie data structure with insert and search operations. 📝"
    },
    "Find Median in a Stream Using Heaps": {
        emoji: "📈",
        review: "The code attempts to solve the kth smallest element problem, not the median-in-a-stream problem. The first function is inefficient, while the second, while attempting optimization, is incorrect and overly complex. 🔄 The solution should use two heaps (min and max) to maintain the median efficiently. ⚡"
    },
    "Word Search II (Using Trie)": {
        emoji: "🔍",
        review: "The code implements two functions to find the kth smallest element in a heap, one modifying the original heap and the other not. The first function is straightforward but modifies the input, while the second attempts a more sophisticated approach but has flaws in its heap traversal and efficiency. 🔄 The implementation should focus on Trie-based word search with proper backtracking. 🎯"
    }
};

module.exports = aiReviews; 