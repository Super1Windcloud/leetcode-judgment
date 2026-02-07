class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        pass
        def dfs(i: int, j: int, k: int) -> bool:
            pass
        m, n = len(board), len(board[0])
        return any(dfs(i, j, 0) for i in range(m) for j in range(n))
