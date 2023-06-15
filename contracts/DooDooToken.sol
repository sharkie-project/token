// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DooDooToken is ERC20 {
    constructor() ERC20("Doo Doo", "DooDoo") {
        _mint(msg.sender, uint256(1_000_000_000) * uint256(10) ** decimals());
    }
}
