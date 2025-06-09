class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        # Your implementation here
        pass

    def search(self, word: str) -> bool:
        # Your implementation here
        pass

    def startsWith(self, prefix: str) -> bool:
        # Your implementation here
        pass 