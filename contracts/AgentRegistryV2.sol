// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PaymentProcessor.sol";

/**
 * @title AgentRegistryV2
 * @dev Enhanced ERC-8004 implementation with integrated payments
 */
contract AgentRegistryV2 is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    PaymentProcessor public paymentProcessor;

    struct AgentInfo {
        string name;
        string description;
        string endpoint;
        address owner;
        uint256 pricePerQuery; // Price in USDC (6 decimals)
        uint256 registeredAt;
        bool active;
        uint256 totalQueries;
        uint256 totalEarnings;
    }

    struct Reputation {
        uint256 totalRatings;
        uint256 sumRatings;
        uint256 averageRating; // Out of 100
    }

    // Mappings
    mapping(uint256 => AgentInfo) public agents;
    mapping(address => uint256) public ownerToAgentId;
    mapping(uint256 => Reputation) public agentReputations;

    // Feedback struct
    struct Feedback {
        address reviewer;
        uint256 rating; // 0-100
        string comment;
        uint256 timestamp;
    }

    mapping(uint256 => Feedback[]) public agentFeedback;

    // Events
    event AgentRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        string endpoint,
        uint256 price
    );
    event AgentUpdated(uint256 indexed tokenId, string endpoint, uint256 price, bool active);
    event AgentQueried(uint256 indexed tokenId, address indexed user, string paymentId);
    event FeedbackSubmitted(uint256 indexed tokenId, address indexed reviewer, uint256 rating);

    constructor(address _paymentProcessor) ERC721("AI Agent Identity", "AGENT") Ownable(msg.sender) {
        _tokenIdCounter = 1;
        paymentProcessor = PaymentProcessor(_paymentProcessor);
    }

    /**
     * @dev Register a new AI agent
     */
    function registerAgent(
        string memory name,
        string memory description,
        string memory endpoint,
        string memory metadataURI,
        uint256 pricePerQuery
    ) external returns (uint256) {
        require(ownerToAgentId[msg.sender] == 0, "Agent already registered");
        require(pricePerQuery > 0, "Price must be > 0");

        uint256 tokenId = _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        agents[tokenId] = AgentInfo({
            name: name,
            description: description,
            endpoint: endpoint,
            owner: msg.sender,
            pricePerQuery: pricePerQuery,
            registeredAt: block.timestamp,
            active: true,
            totalQueries: 0,
            totalEarnings: 0
        });

        ownerToAgentId[msg.sender] = tokenId;

        emit AgentRegistered(tokenId, msg.sender, name, endpoint, pricePerQuery);

        return tokenId;
    }

    /**
     * @dev Update agent information
     */
    function updateAgent(
        uint256 tokenId,
        string memory newEndpoint,
        uint256 newPrice,
        bool active
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");

        agents[tokenId].endpoint = newEndpoint;
        agents[tokenId].pricePerQuery = newPrice;
        agents[tokenId].active = active;

        emit AgentUpdated(tokenId, newEndpoint, newPrice, active);
    }

    /**
     * @dev Record a query (called after payment verification)
     */
    function recordQuery(uint256 tokenId, string memory paymentId) external {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        require(agents[tokenId].active, "Agent not active");

        // Verify payment exists and is valid
        require(paymentProcessor.verifyPayment(paymentId), "Invalid payment");

        agents[tokenId].totalQueries++;

        PaymentProcessor.Payment memory payment = paymentProcessor.getPayment(paymentId);
        agents[tokenId].totalEarnings += payment.amount;

        emit AgentQueried(tokenId, msg.sender, paymentId);
    }

    /**
     * @dev Submit feedback for an agent
     */
    function submitFeedback(
        uint256 tokenId,
        uint256 rating,
        string memory comment
    ) external {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        require(rating <= 100, "Rating must be 0-100");

        agentFeedback[tokenId].push(
            Feedback({
                reviewer: msg.sender,
                rating: rating,
                comment: comment,
                timestamp: block.timestamp
            })
        );

        // Update reputation
        Reputation storage rep = agentReputations[tokenId];
        rep.totalRatings++;
        rep.sumRatings += rating;
        rep.averageRating = rep.sumRatings / rep.totalRatings;

        emit FeedbackSubmitted(tokenId, msg.sender, rating);
    }

    /**
     * @dev Get agent information
     */
    function getAgentInfo(uint256 tokenId) external view returns (AgentInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        return agents[tokenId];
    }

    /**
     * @dev Get agent reputation
     */
    function getAgentReputation(uint256 tokenId) external view returns (Reputation memory) {
        return agentReputations[tokenId];
    }

    /**
     * @dev Get all feedback for an agent
     */
    function getAgentFeedback(uint256 tokenId) external view returns (Feedback[] memory) {
        return agentFeedback[tokenId];
    }

    /**
     * @dev Get all active agents
     */
    function getActiveAgents() external view returns (uint256[] memory) {
        uint256 activeCount = 0;

        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (agents[i].active) {
                activeCount++;
            }
        }

        uint256[] memory activeAgents = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (agents[i].active) {
                activeAgents[index] = i;
                index++;
            }
        }

        return activeAgents;
    }

    /**
     * @dev Total agents registered
     */
    function totalAgents() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    /**
     * @dev Update payment processor (only owner)
     */
    function setPaymentProcessor(address newProcessor) external onlyOwner {
        paymentProcessor = PaymentProcessor(newProcessor);
    }
}
