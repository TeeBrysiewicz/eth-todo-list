pragma solidity ^0.5.0;

contract TodoList {
  address public minter;
  uint public taskCount = 0;

  struct Task {
    uint id;
    string content;
    bool completed;
  }

  mapping(uint => Task) public tasks;

  event TaskCreated(
    uint id,
    string content,
    bool completed
  );

  constructor() public {
    createTask("Check out DappUniversity.com");
  }

  function createTask(string memory _content) public {
    console.log("Hello World");
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, false);
    emit TaskCreated(taskCount, _content, false);
  }

}