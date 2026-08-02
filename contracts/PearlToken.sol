// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PearlToken ($PEARL)
 * @dev Utility / reward token for the Koi Legend game.
 *
 * Properties:
 *   - Inflatable (game mints rewards) BUT with active burn mechanism
 *   - 20% of every phase entry fee is burned
 *   - 5% of every marketplace sale is burned
 *   - Card minting requires burning $PEARL
 *   - Minting capped per day to prevent hyperinflation
 *
 * Sustainable design: mint rate is bounded by gameplay, burn rate scales with activity.
 */
contract PearlToken is ERC20Burnable, AccessControl {
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");
    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");

    /// @notice Maximum $PEARL that can be minted per day (1,000,000)
    uint256 public constant DAILY_MINT_CAP = 1_000_000 * 1e18;
    /// @notice Hard cap on total supply (1,000,000,000)
    uint256 public constant HARD_CAP = 1_000_000_000 * 1e18;

    uint256 public mintedToday;
    uint256 public currentDay;
    /// @notice Total $PEARL burned (for transparency)
    uint256 public totalBurned;

    event Minted(address indexed to, uint256 amount, string reason);
    event BurnedForPhase(address indexed from, uint256 amount, uint8 phaseId);

    constructor() ERC20("Pearl", "PEARL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_ROLE, msg.sender);
        _grantRole(REWARDER_ROLE, msg.sender);
        currentDay = block.timestamp / 1 days;
        // Initial supply for liquidity
        _mint(msg.sender, 10_000_000 * 1e18);
    }

    modifier rollDay() {
        uint256 today = block.timestamp / 1 days;
        if (today > currentDay) {
            currentDay = today;
            mintedToday = 0;
        }
        _;
    }

    /// @notice Reward a player for completing a phase (called by game backend)
    function rewardPlayer(address to, uint256 amount, uint8 phaseId) external onlyRole(REWARDER_ROLE) rollDay {
        require(mintedToday + amount <= DAILY_MINT_CAP, "Daily mint cap exceeded");
        require(totalSupply() + amount <= HARD_CAP, "Hard cap exceeded");
        mintedToday += amount;
        _mint(to, amount);
        emit Minted(to, amount, string.concat("phase-", _uint2str(phaseId)));
    }

    /// @notice Burn $PEARL to pay for a phase entry (20% burn, 80% to treasury)
    function payForPhase(address treasury, uint256 amount, uint8 phaseId) external {
        require(amount > 0, "Zero amount");
        uint256 burnAmount = (amount * 20) / 100;
        uint256 treasuryAmount = amount - burnAmount;
        _transfer(_msgSender(), treasury, treasuryAmount);
        _burn(_msgSender(), burnAmount);
        totalBurned += burnAmount;
        emit BurnedForPhase(_msgSender(), burnAmount, phaseId);
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            bstr[k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}
