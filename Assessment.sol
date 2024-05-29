// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address public owner;
    uint256 public balance;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    constructor(uint256 initBalance) {
        owner = msg.sender;
        balance = initBalance;
    }

    function getBalance() external view returns(uint256) {
        return balance;
    }

    function deposit() external payable {
        uint256 _previousBalance = balance;

        // Perform transaction
        balance += msg.value;

        // Emit the event
        emit Deposit(msg.sender, msg.value);

        // Assert transaction completed successfully
        assert(balance == _previousBalance + msg.value);
    }

    // Custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) external onlyOwner {
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // Withdraw the given amount
        balance -= _withdrawAmount;

        // Emit the event
        emit Withdraw(msg.sender, _withdrawAmount);

        // Assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));
    }
}
