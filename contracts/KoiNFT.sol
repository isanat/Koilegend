// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title KoiNFT
 * @dev ERC-721 collectible cards for the Koi Legend game.
 *
 * Each card represents one of the 12 phases (or a fused/evolved variant).
 * Cards grant in-game abilities and can be traded on the marketplace.
 *
 * Metadata (image + attributes) stored on IPFS; tokenURI points to IPFS gateway.
 */
contract KoiNFT is ERC721Enumerable, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIdCounter;

    /// @notice Rarity tier of each token
    enum Rarity { Common, Uncommon, Rare, Epic, Legendary, Mythic }

    struct CardAttributes {
        uint8 phaseId;          // which phase this card is from (1-12)
        Rarity rarity;          // rarity tier
        uint8 power;            // ability power 1-100
        uint8 luck;             // luck bonus 1-100
        bool evolved;           // whether this card was fused/evolved
    }

    mapping(uint256 => CardAttributes) public cardAttributes;
    mapping(uint8 => uint256) public phaseCardCount; // cards minted per phase

    event CardMinted(uint256 indexed tokenId, address indexed to, uint8 phaseId, Rarity rarity);
    event CardsFused(uint256[] burnedTokenIds, uint256 newTokenId);

    constructor() ERC721("Koi Legend Cards", "KOICARD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint a card as a phase reward (called by game backend)
    function mintReward(
        address to,
        uint8 phaseId,
        Rarity rarity,
        uint8 power,
        uint8 luck,
        string memory tokenURI_
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(phaseId >= 1 && phaseId <= 12, "Invalid phase");
        require(power <= 100 && luck <= 100, "Stats out of range");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        cardAttributes[tokenId] = CardAttributes({
            phaseId: phaseId,
            rarity: rarity,
            power: power,
            luck: luck,
            evolved: false
        });
        phaseCardCount[phaseId]++;

        emit CardMinted(tokenId, to, phaseId, rarity);
        return tokenId;
    }

    /// @notice Fuse two cards of the same phase to create an evolved card
    ///         (burns both inputs, mints a new evolved card with boosted stats)
    function fuseCards(
        uint256 tokenIdA,
        uint256 tokenIdB,
        string memory newTokenURI
    ) external returns (uint256) {
        require(tokenIdA != tokenIdB, "Cannot fuse same card");
        require(ownerOf(tokenIdA) == _msgSender(), "Not owner of A");
        require(ownerOf(tokenIdB) == _msgSender(), "Not owner of B");

        CardAttributes memory a = cardAttributes[tokenIdA];
        CardAttributes memory b = cardAttributes[tokenIdB];
        require(a.phaseId == b.phaseId, "Must be same phase");
        require(!a.evolved && !b.evolved, "Already evolved");

        _burn(tokenIdA);
        _burn(tokenIdB);

        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_msgSender(), newTokenId);
        _setTokenURI(newTokenId, newTokenURI);

        Rarity newRarity = Rarity(uint256(a.rarity) + 1 > uint256(Rarity.Mythic) ? uint256(Rarity.Mythic) : uint256(a.rarity) + 1);
        cardAttributes[newTokenId] = CardAttributes({
            phaseId: a.phaseId,
            rarity: newRarity,
            power: _boost(a.power, b.power),
            luck: _boost(a.luck, b.luck),
            evolved: true
        });

        emit CardsFused(_asArray(tokenIdA, tokenIdB), newTokenId);
        return newTokenId;
    }

    function _boost(uint8 a, uint8 b) internal pure returns (uint8) {
        uint256 result = (uint256(a) + uint256(b)) / 2 + 10;
        return result > 100 ? 100 : uint8(result);
    }

    function _asArray(uint256 a, uint256 b) internal pure returns (uint256[] memory) {
        uint256[] memory arr = new uint256[](2);
        arr[0] = a; arr[1] = b;
        return arr;
    }

    // Required overrides for multiple inheritance
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
