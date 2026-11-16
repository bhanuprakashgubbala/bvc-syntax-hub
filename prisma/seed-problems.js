const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const problems = [
    {
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n**Example:**\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
      points: 10
    },
    {
      title: "Reverse a Linked List",
      difficulty: "Medium",
      description: "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\n**Example:**\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
      points: 20
    },
    {
      title: "Merge K Sorted Lists",
      difficulty: "Hard",
      description: "You are given an array of `k` linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
      points: 40
    }
  ];

  console.log("Seeding problems...");
  for (const prob of problems) {
    await prisma.problem.create({
      data: prob
    });
    console.log(`Created problem: ${prob.title}`);
  }
  console.log("Finished seeding problems!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
