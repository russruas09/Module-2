// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Assessment is Ownable {
    IERC20 public token;

    event ItemBought(address indexed buyer, uint256 itemId, string itemName);
    event Deposit(address indexed depositor, uint256 amount);
    event Withdrawal(address indexed withdrawer, uint256 amount);

    struct ShopItem {
        uint256 id;
        string name;
        uint256 price;
    }

    mapping(uint256 => ShopItem) public shopItems;
    uint256 public itemCount;
    uint256 public constant minDepositAmount = 3;
    uint256 public constant minWithdrawalAmount = 3;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        itemCount = 0;
    }

    modifier checkMinDepositAmount(uint256 _amount) {
        require(_amount >= minDepositAmount, "Deposit amount is below minimum");
        _;
    }

    modifier checkMinWithdrawalAmount(uint256 _amount) {
        require(_amount >= minWithdrawalAmount, "Withdrawal amount is below minimum");
        _;
    }

    function addItemToShop(string memory _name, uint256 _price) external onlyOwner {
        itemCount++;
        shopItems[itemCount] = ShopItem(itemCount, _name, _price);
    }

    function removeItemFromShop(uint256 _itemId) external onlyOwner {
        require(_itemId <= itemCount, "Item does not exist");
        delete shopItems[_itemId];
    }

    function buyItemFromShop(uint256 _itemId) external {
        require(_itemId <= itemCount, "Item does not exist");
        ShopItem memory item = shopItems[_itemId];
        require(token.balanceOf(msg.sender) >= item.price, "Insufficient balance");

        token.transferFrom(msg.sender, address(this), item.price);
        emit ItemBought(msg.sender, item.id, item.name);
    }

    function checkItemOwnership(uint256 _itemId, address _owner) external view returns (bool) {
        require(_itemId <= itemCount, "Item does not exist");
        ShopItem memory item = shopItems[_itemId];
        return token.balanceOf(_owner) >= item.price;
    }

    function getShopItems() external view returns (ShopItem[] memory) {
        ShopItem[] memory items = new ShopItem[](itemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            items[i - 1] = shopItems[i];
        }
        return items;
    }

    function deposit(uint256 _amount) external checkMinDepositAmount(_amount) {
        token.transferFrom(msg.sender, address(this), _amount);
        emit Deposit(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external checkMinWithdrawalAmount(_amount) {
        token.transfer(msg.sender, _amount);
        emit Withdrawal(msg.sender, _amount);
    }
}
