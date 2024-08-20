// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WBNB is ERC20, Ownable {
    constructor() ERC20("Wrapped BNB", "WBNB") public {}
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}