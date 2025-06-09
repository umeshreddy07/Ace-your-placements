def permute(nums: list[int]) -> list[list[int]]:
    result = []
    def backtrack(current_permutation, remaining_nums):
        if not remaining_nums:
            result.append(list(current_permutation))
            return

        for i in range(len(remaining_nums)):
            num = remaining_nums[i]
            current_permutation.append(num)
            new_remaining = remaining_nums[:i] + remaining_nums[i+1:]
            backtrack(current_permutation, new_remaining)
            current_permutation.pop()

    backtrack([], nums)
    return result 