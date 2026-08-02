// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IBurnableERC20 {
    function burn(uint256 amount) external;
}

/**
 * @title KoiMarketplace
 * @dev NFT marketplace for Koi Legend cards.
 *
 * Fee structure (sustainable):
 *   - 2.5% marketplace fee (of which 50% → staking pool, 50% → treasury)
 *   - 5% of the fee is burned in $PEARL (deflationary)
 *
 * Listings in $PEARL (utility token). Optional $KOI discount for fees.
 */
contract KoiMarketplace is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC721 public immutable koiNFT;
    IERC20 public immutable pearlToken;

    uint256 public constant MARKETPLACE_FEE_BPS = 250;  // 2.5%
    uint256 public constant BURN_FRACTION_BPS = 5000;   // 50% of fee burned
    uint256 public constant STAKING_SHARE_BPS = 5000;   // 50% of fee to stakers

    address public treasury;
    address public stakingPool;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;       // in $PEARL
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public totalVolume;
    uint256 public totalFeesCollected;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Sold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price, uint256 fee);
    event Cancelled(uint256 indexed tokenId, address indexed seller);

    constructor(address _koiNFT, address _pearlToken, address _treasury, address _stakingPool) {
        koiNFT = IERC721(_koiNFT);
        pearlToken = IERC20(_pearlToken);
        treasury = _treasury;
        stakingPool = _stakingPool;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function list(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be > 0");
        require(koiNFT.ownerOf(tokenId) == _msgSender(), "Not owner");
        require(koiNFT.isApprovedForAll(_msgSender(), address(this)) || koiNFT.getApproved(tokenId) == address(this), "Not approved");

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: _msgSender(),
            price: price,
            active: true
        });
        emit Listed(tokenId, _msgSender(), price);
    }

    function buy(uint256 tokenId) external nonReentrant {
        Listing memory l = listings[tokenId];
        require(l.active, "Not listed");

        uint256 fee = (l.price * MARKETPLACE_FEE_BPS) / 10000;
        uint256 burnAmount = (fee * BURN_FRACTION_BPS) / 10000;
        uint256 stakingAmount = (fee * STAKING_SHARE_BPS) / 10000;
        uint256 treasuryAmount = fee - burnAmount - stakingAmount;
        uint256 sellerAmount = l.price - fee;

        // Transfer $PEARL from buyer
        require(pearlToken.transferFrom(_msgSender(), address(this), l.price), "Transfer failed");

        // Pay seller
        require(pearlToken.transfer(l.seller, sellerAmount), "Seller payment failed");
        // Pay staking pool
        if (stakingAmount > 0) {
            require(pearlToken.transfer(stakingPool, stakingAmount), "Staking payment failed");
        }
        // Pay treasury
        if (treasuryAmount > 0) {
            require(pearlToken.transfer(treasury, treasuryAmount), "Treasury payment failed");
        }
        // Burn portion
        if (burnAmount > 0) {
            IBurnableERC20(address(pearlToken)).burn(burnAmount);
        }

        // Transfer NFT to buyer
        koiNFT.transferFrom(l.seller, _msgSender(), tokenId);

        listings[tokenId].active = false;
        totalVolume += l.price;
        totalFeesCollected += fee;

        emit Sold(tokenId, _msgSender(), l.seller, l.price, fee);
    }

    function cancel(uint256 tokenId) external {
        require(listings[tokenId].seller == _msgSender(), "Not seller");
        require(listings[tokenId].active, "Not active");
        listings[tokenId].active = false;
        emit Cancelled(tokenId, _msgSender());
    }

    function setTreasury(address _treasury) external onlyRole(ADMIN_ROLE) {
        treasury = _treasury;
    }
    function setStakingPool(address _stakingPool) external onlyRole(ADMIN_ROLE) {
        stakingPool = _stakingPool;
    }
}
