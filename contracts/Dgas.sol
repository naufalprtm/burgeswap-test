// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dgas is ERC20, Ownable {
    constructor() ERC20("Dgas Token", "DGAS") public {}
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}