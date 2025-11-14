// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SonicSelfVerification
 * @dev Self Protocol integration for Sonic SAT platform
 * Handles user identity verification using Self Protocol's zero-knowledge proofs
 */
contract SonicSelfVerification is Ownable, ReentrancyGuard, Pausable {
    
    // Verification status enum
    enum VerificationStatus {
        UNVERIFIED,
        PENDING,
        VERIFIED,
        EXPIRED,
        REVOKED
    }
    
    // Verification levels
    enum VerificationLevel {
        BASIC,      // Age + Identity
        ENHANCED,   // Basic + Nationality
        PREMIUM     // Enhanced + Additional attributes
    }
    
    // User verification record
    struct UserVerification {
        VerificationStatus status;
        VerificationLevel level;
        uint256 verifiedAt;
        uint256 expiresAt;
        bytes32 selfProofHash;      // Hash of Self Protocol proof
        string nationality;         // Optional nationality disclosure
        bool isMinimumAge;         // 18+ verification
        uint256 lastUpdated;
    }
    
    // Creator profile for enhanced features
    struct CreatorProfile {
        bool isActive;
        uint256 totalNFTsCreated;
        uint256 totalSales;
        uint256 reputationScore;    // 0-1000 scale
        uint256 joinedAt;
        uint256 lastActivityAt;
    }
    
    // Mappings
    mapping(address => UserVerification) public userVerifications;
    mapping(address => CreatorProfile) public creatorProfiles;
    mapping(bytes32 => bool) public usedProofHashes;
    
    // Configuration
    uint256 public constant VERIFICATION_VALIDITY_PERIOD = 365 days; // 1 year
    uint256 public constant MINIMUM_AGE = 18;
    uint256 public constant REPUTATION_DECAY_PERIOD = 90 days;
    
    // Events
    event UserVerified(
        address indexed user,
        VerificationLevel level,
        uint256 verifiedAt,
        uint256 expiresAt
    );
    
    event VerificationRevoked(
        address indexed user,
        string reason,
        uint256 revokedAt
    );
    
    event CreatorProfileCreated(
        address indexed creator,
        uint256 createdAt
    );
    
    event ReputationUpdated(
        address indexed creator,
        uint256 oldScore,
        uint256 newScore
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Verify user with Self Protocol proof
     * @param selfProofHash Hash of the Self Protocol verification proof
     * @param level Verification level requested
     * @param nationality Optional nationality (empty string if not disclosed)
     * @param isMinimumAge Whether user meets minimum age requirement
     */
    function verifyUser(
        bytes32 selfProofHash,
        VerificationLevel level,
        string memory nationality,
        bool isMinimumAge
    ) external nonReentrant whenNotPaused {
        require(selfProofHash != bytes32(0), "Invalid proof hash");
        require(!usedProofHashes[selfProofHash], "Proof already used");
        require(isMinimumAge, "User must be 18 or older");
        
        // Mark proof as used to prevent replay attacks
        usedProofHashes[selfProofHash] = true;
        
        uint256 currentTime = block.timestamp;
        uint256 expiryTime = currentTime + VERIFICATION_VALIDITY_PERIOD;
        
        // Update user verification
        userVerifications[msg.sender] = UserVerification({
            status: VerificationStatus.VERIFIED,
            level: level,
            verifiedAt: currentTime,
            expiresAt: expiryTime,
            selfProofHash: selfProofHash,
            nationality: nationality,
            isMinimumAge: isMinimumAge,
            lastUpdated: currentTime
        });
        
        // Create creator profile if doesn't exist
        if (!creatorProfiles[msg.sender].isActive) {
            _createCreatorProfile(msg.sender);
        }
        
        emit UserVerified(msg.sender, level, currentTime, expiryTime);
    }
    
    /**
     * @dev Check if user is verified and verification is still valid
     * @param user Address to check
     * @return isVerified Whether user is currently verified
     * @return level Verification level
     * @return expiresAt When verification expires
     */
    function isUserVerified(address user) external view returns (
        bool isVerified,
        VerificationLevel level,
        uint256 expiresAt
    ) {
        UserVerification memory verification = userVerifications[user];
        
        bool isValid = verification.status == VerificationStatus.VERIFIED &&
                      verification.expiresAt > block.timestamp;
        
        return (isValid, verification.level, verification.expiresAt);
    }
    
    /**
     * @dev Get user verification details
     * @param user Address to query
     */
    function getUserVerification(address user) external view returns (UserVerification memory) {
        return userVerifications[user];
    }
    
    /**
     * @dev Get creator profile
     * @param creator Address to query
     */
    function getCreatorProfile(address creator) external view returns (CreatorProfile memory) {
        return creatorProfiles[creator];
    }
    
    /**
     * @dev Update creator stats when NFT is created (called by NFT contract)
     * @param creator Creator address
     */
    function updateCreatorStats(address creator) external {
        // TODO: Add access control - only NFT contract should call this
        require(creatorProfiles[creator].isActive, "Creator not verified");
        
        creatorProfiles[creator].totalNFTsCreated++;
        creatorProfiles[creator].lastActivityAt = block.timestamp;
        
        // Update reputation score based on activity
        _updateReputationScore(creator);
    }
    
    /**
     * @dev Update creator stats when NFT is sold (called by marketplace contract)
     * @param creator Creator address
     */
    function updateSaleStats(address creator, uint256 /* salePrice */) external {
        // TODO: Add access control - only marketplace contract should call this
        require(creatorProfiles[creator].isActive, "Creator not verified");
        
        creatorProfiles[creator].totalSales++;
        creatorProfiles[creator].lastActivityAt = block.timestamp;
        
        // Update reputation score based on sales
        _updateReputationScore(creator);
    }
    
    /**
     * @dev Revoke user verification (admin only)
     * @param user User to revoke
     * @param reason Reason for revocation
     */
    function revokeVerification(address user, string memory reason) external onlyOwner {
        require(userVerifications[user].status == VerificationStatus.VERIFIED, "User not verified");
        
        userVerifications[user].status = VerificationStatus.REVOKED;
        userVerifications[user].lastUpdated = block.timestamp;
        
        // Deactivate creator profile
        creatorProfiles[user].isActive = false;
        
        emit VerificationRevoked(user, reason, block.timestamp);
    }
    
    /**
     * @dev Batch verify multiple users (admin only, for migration)
     * @param users Array of user addresses
     * @param proofHashes Array of proof hashes
     * @param levels Array of verification levels
     */
    function batchVerifyUsers(
        address[] memory users,
        bytes32[] memory proofHashes,
        VerificationLevel[] memory levels
    ) external onlyOwner {
        require(users.length == proofHashes.length, "Array length mismatch");
        require(users.length == levels.length, "Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (!usedProofHashes[proofHashes[i]]) {
                usedProofHashes[proofHashes[i]] = true;
                
                uint256 currentTime = block.timestamp;
                userVerifications[users[i]] = UserVerification({
                    status: VerificationStatus.VERIFIED,
                    level: levels[i],
                    verifiedAt: currentTime,
                    expiresAt: currentTime + VERIFICATION_VALIDITY_PERIOD,
                    selfProofHash: proofHashes[i],
                    nationality: "",
                    isMinimumAge: true,
                    lastUpdated: currentTime
                });
                
                if (!creatorProfiles[users[i]].isActive) {
                    _createCreatorProfile(users[i]);
                }
                
                emit UserVerified(users[i], levels[i], currentTime, currentTime + VERIFICATION_VALIDITY_PERIOD);
            }
        }
    }
    
    /**
     * @dev Internal function to create creator profile
     * @param creator Creator address
     */
    function _createCreatorProfile(address creator) internal {
        creatorProfiles[creator] = CreatorProfile({
            isActive: true,
            totalNFTsCreated: 0,
            totalSales: 0,
            reputationScore: 500, // Start with neutral score
            joinedAt: block.timestamp,
            lastActivityAt: block.timestamp
        });
        
        emit CreatorProfileCreated(creator, block.timestamp);
    }
    
    /**
     * @dev Internal function to update reputation score
     * @param creator Creator address
     */
    function _updateReputationScore(address creator) internal {
        CreatorProfile storage profile = creatorProfiles[creator];
        uint256 oldScore = profile.reputationScore;
        
        // Simple reputation algorithm (can be enhanced)
        uint256 activityScore = (profile.totalNFTsCreated * 10) + (profile.totalSales * 20);
        uint256 timeDecay = (block.timestamp - profile.lastActivityAt) / REPUTATION_DECAY_PERIOD;
        
        // Calculate new score (0-1000 range)
        uint256 newScore = (500 + activityScore) > timeDecay ? (500 + activityScore - timeDecay) : 100;
        if (newScore > 1000) newScore = 1000;
        if (newScore < 100) newScore = 100;
        
        profile.reputationScore = newScore;
        
        if (oldScore != newScore) {
            emit ReputationUpdated(creator, oldScore, newScore);
        }
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get verification statistics
     */
    function getVerificationStats() external pure returns (
        uint256 totalVerified,
        uint256 totalCreators,
        uint256 totalNFTsCreated,
        uint256 totalSales
    ) {
        // Note: This is a simplified version. In production, you'd want to track these more efficiently
        // For now, returning placeholder values
        return (0, 0, 0, 0);
    }
}