// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KoiToken ($KOI)
 * @dev Governance token for the Koi Legend game.
 *
 * Properties:
 *   - Fixed supply: 100,000,000 $KOI (minted once at deployment)
 *   - ERC-20 compatible (transferable, burnable)
 *   - Used for: phase access (gating), governance votes, staking yield, marketplace fee discounts
 *
 * Token allocation (minted to deployer, to be distributed):
 *   - 30% Team & Advisors (4-year vesting)
 *   - 25% Ecosystem & Community Rewards
 *   - 20% Treasury (governance-controlled)
 *   - 15% Public Sale / Liquidity
 *   - 10% Play-to-Earn Rewards Pool
 *
 * Deploy on: Ronin (recommended, low gas) / Polygon / Arbitrum
 */
contract KoiToken is ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18;

    /// @notice Minimum $KOI balance required to access each phase tier.
    ///         Phase 1-3: 0 KOI (free), 4-6: 50, 7-9: 200, 10-12: 1000.
    mapping(uint8 => uint256) public phaseAccessRequirement;

    event PhaseAccessUpdated(uint8 indexed phaseId, uint256 requiredBalance);

    constructor() ERC20("Koi Legend", "KOI") Ownable(msg.sender) {
        _mint(msg.sender, MAX_SUPPLY);

        // Default phase access tiers
        phaseAccessRequirement[1] = 0;
        phaseAccessRequirement[2] = 0;
        phaseAccessRequirement[3] = 0;
        phaseAccessRequirement[4] = 50 * 1e18;
        phaseAccessRequirement[5] = 50 * 1e18;
        phaseAccessRequirement[6] = 50 * 1e18;
        phaseAccessRequirement[7] = 200 * 1e18;
        phaseAccessRequirement[8] = 200 * 1e18;
        phaseAccessRequirement[9] = 200 * 1e18;
        phaseAccessRequirement[10] = 1000 * 1e18;
        phaseAccessRequirement[11] = 1000 * 1e18;
        phaseAccessRequirement[12] = 1000 * 1e18;
    }

    /// @notice Check if an address can access a given phase
    function canAccessPhase(address account, uint8 phaseId) external view returns (bool) {
        return balanceOf(account) >= phaseAccessRequirement[phaseId];
    }

    /// @notice Update phase access requirement (governance only)
    function setPhaseAccess(uint8 phaseId, uint256 requiredBalance) external onlyOwner {
        phaseAccessRequirement[phaseId] = requiredBalance;
        emit PhaseAccessUpdated(phaseId, requiredBalance);
    }
}
