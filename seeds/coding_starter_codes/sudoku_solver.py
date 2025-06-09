def solveSudoku(board: list[list[str]]) -> None:
    def find_empty(board):
        for r in range(9):
            for c in range(9):
                if board[r][c] == ".":
                    return (r, c)
        return None

    def is_valid(board, num, pos):
        # Check row
        for c in range(9):
            if board[pos[0]][c] == num and pos[1] != c:
                return False
        # Check column
        for r in range(9):
            if board[r][pos[1]] == num and pos[0] != r:
                return False
        # Check 3x3 box
        box_x = pos[1] // 3
        box_y = pos[0] // 3
        for r in range(box_y * 3, box_y * 3 + 3):
            for c in range(box_x * 3, box_x * 3 + 3):
                if board[r][c] == num and (r, c) != pos:
                    return False
        return True

    def solve():
        find = find_empty(board)
        if not find:
            return True
        else:
            row, col = find

        for i in range(1, 10):
            if is_valid(board, str(i), (row, col)):
                board[row][col] = str(i)

                if solve():
                    return True

                board[row][col] = "." # backtrack
        return False
    solve() 