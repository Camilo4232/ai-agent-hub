// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry
 * @dev Simple ERC-8004 implementation for AI Agent registration
 * Based on EIP-8004 Identity Registry
 */
contract AgentRegistry is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Agent metadata structure
    struct AgentInfo {
        string name;
        string description;
        string endpoint; // A2A endpoint URL
        address owner;
        uint256 registeredAt;
        bool active;
    }

    // Mapping from token ID to agent info
    mapping(uint256 => AgentInfo) public agents;

    // Mapping from address to agent token ID
    mapping(address => uint256) public ownerToAgentId;

    // Events
    event AgentRegistered(uint256 indexed tokenId, address indexed owner, string name, string endpoint);
    event AgentUpdated(uint256 indexed tokenId, string endpoint, bool active);
    event AgentDeactivated(uint256 indexed tokenId);

    constructor() ERC721("AI Agent Identity", "AGENT") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start from 1
    }

    /**
     * @dev Register a new AI agent
     * @param name Agent name
     * @param description Agent description
     * @param endpoint A2A protocol endpoint
     * @param metadataURI IPFS or HTTP URI with full agent metadata JSON
     */
    function registerAgent(
        string memory name,
        string memory description,
        string memory endpoint,
        string memory metadataURI
    ) external returns (uint256) {
        require(ownerToAgentId[msg.sender] == 0, "Agent already registered");

        uint256 tokenId = _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        agents[tokenId] = AgentInfo({
            name: name,
            description: description,
            endpoint: endpoint,
            owner: msg.sender,
            registeredAt: block.timestamp,
            active: true
        });

        ownerToAgentId[msg.sender] = tokenId;

        emit AgentRegistered(tokenId, msg.sender, name, endpoint);

        return tokenId;
    }

    /**
     * @dev Update agent endpoint and status
     * @param tokenId Agent token ID
     * @param newEndpoint New A2A endpoint
     * @param active Agent active status
     */
    function updateAgent(uint256 tokenId, string memory newEndpoint, bool active) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");

        agents[tokenId].endpoint = newEndpoint;
        agents[tokenId].active = active;

        emit AgentUpdated(tokenId, newEndpoint, active);
    }

    /**
     * @dev Deactivate an agent
     * @param tokenId Agent token ID
     */
    function deactivateAgent(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");

        agents[tokenId].active = false;

        emit AgentDeactivated(tokenId);
    }

    /**
     * @dev Get all active agents
     * @return Array of active agent token IDs
     */
    function getActiveAgents() external view returns (uint256[] memory) {
        uint256 activeCount = 0;

        // Count active agents
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (agents[i].active) {
                activeCount++;
            }
        }

        // Create array of active agent IDs
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
     * @dev Get agent info by token ID
     * @param tokenId Agent token ID
     * @return AgentInfo struct
     */
    function getAgentInfo(uint256 tokenId) external view returns (AgentInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        return agents[tokenId];
    }

    /**
     * @dev Get total number of registered agents
     */
    function totalAgents() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
}
