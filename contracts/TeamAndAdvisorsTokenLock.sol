// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 */
contract TeamAndAdvisorsTokenLock {
    using SafeERC20 for IERC20;

    string public name = "TeamAndAdvisors Round Token Lock";

    uint256 totalSupply = 1_000_000_000;
    uint256 percentShare = 1410;

    uint256 public percentTge = 0;
    uint256 public monthsCliff = 10;
    // total Month release token After TGE
    uint256 public months = uint256(20);

    // total lock token
    uint256 public totalAllocation =
        uint256(((totalSupply * percentShare) / 10000) * 10 ** 18);

    // ERC20 basic token contract being held
    IERC20 public immutable token;
    // TGE timestamp
    uint256 public immutable tge;

    // beneficiary of tokens after they are released
    address public beneficiary;
    uint256 public totalWithdrawn;

    /**
     * @param _token: Doo Doo token address
     * @param _tge: TGE timestamp (seconds)
     * @param _beneficiary: beneficiary address
     */
    constructor(IERC20 _token, uint256 _tge, address _beneficiary) {
        token = _token;
        tge = _tge;
        beneficiary = _beneficiary;
    }

    function unlockedAmountAt(
        uint256 _timestamp
    ) public view returns (uint256) {
        if (_timestamp < tge) {
            return 0;
        }
        uint256 monthsUnlock = (_timestamp - tge) / (30 days) + 1;
        // release TGE
        if (monthsUnlock == 1) {
            return (totalAllocation * percentTge) / 100;
        }
        if (monthsUnlock <= monthsCliff) {
            return 0;
        }
        monthsUnlock = monthsUnlock - monthsCliff;
        if (monthsUnlock > months) {
            monthsUnlock = months;
        }
        return
            ((totalAllocation - (totalAllocation * percentTge) / 100) *
                monthsCliff) / months;
    }

    function unlockedAmount() public view returns (uint256) {
        return unlockedAmountAt(block.timestamp);
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function withdraw() public {
        uint256 _unlockedAmount = unlockedAmountAt(block.timestamp);
        require(
            _unlockedAmount > totalWithdrawn,
            "TokenLock: no tokens to release"
        );
        uint256 amount = _unlockedAmount - totalWithdrawn;
        token.safeTransfer(beneficiary, amount);
        totalWithdrawn = _unlockedAmount;
    }

    /**
     * @notice Set new beneficiary address.
     * @param _beneficiary: beneficiary address
     */
    function setBeneficiary(address _beneficiary) public {
        require(
            _beneficiary != address(0),
            "TokenLock: cannot be zero address"
        );
        require(msg.sender == beneficiary, "TokenLock: unauthorized");
        beneficiary = _beneficiary;
    }
}
