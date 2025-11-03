// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentProcessor
 * @dev Handles X402 payments for AI Agent services
 * Supports USDC and ETH payments
 */
contract PaymentProcessor is Ownable, ReentrancyGuard {
    IERC20 public usdcToken;

    struct Payment {
        address payer;
        address agent;
        uint256 amount;
        string paymentId;
        string serviceId;
        uint256 timestamp;
        bool verified;
        bool settled;
    }

    // Mapping from payment ID to Payment
    mapping(string => Payment) public payments;

    // Mapping from agent address to earnings
    mapping(address => uint256) public agentEarnings;

    // Platform fee (in basis points: 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Minimum payment amounts
    uint256 public minPaymentUSDC = 1000; // 0.001 USDC (6 decimals)
    uint256 public minPaymentETH = 0.0001 ether;

    // Events
    event PaymentCreated(
        string indexed paymentId,
        address indexed payer,
        address indexed agent,
        uint256 amount,
        string serviceId
    );

    event PaymentVerified(string indexed paymentId, bool verified);
    event PaymentSettled(string indexed paymentId, address agent, uint256 amount);
    event Withdrawal(address indexed agent, uint256 amount);

    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @dev Create payment in USDC
     * @param paymentId Unique payment identifier
     * @param agent Agent receiving payment
     * @param amount Amount in USDC (6 decimals)
     * @param serviceId Service being paid for
     */
    function createPaymentUSDC(
        string memory paymentId,
        address agent,
        uint256 amount,
        string memory serviceId
    ) external nonReentrant {
        require(bytes(payments[paymentId].paymentId).length == 0, "Payment already exists");
        require(agent != address(0), "Invalid agent address");
        require(amount >= minPaymentUSDC, "Amount too low");

        // Transfer USDC from payer to contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );

        payments[paymentId] = Payment({
            payer: msg.sender,
            agent: agent,
            amount: amount,
            paymentId: paymentId,
            serviceId: serviceId,
            timestamp: block.timestamp,
            verified: true, // Auto-verified since payment is on-chain
            settled: false
        });

        emit PaymentCreated(paymentId, msg.sender, agent, amount, serviceId);
        emit PaymentVerified(paymentId, true);
    }

    /**
     * @dev Create payment in ETH
     * @param paymentId Unique payment identifier
     * @param agent Agent receiving payment
     * @param serviceId Service being paid for
     */
    function createPaymentETH(
        string memory paymentId,
        address agent,
        string memory serviceId
    ) external payable nonReentrant {
        require(bytes(payments[paymentId].paymentId).length == 0, "Payment already exists");
        require(agent != address(0), "Invalid agent address");
        require(msg.value >= minPaymentETH, "Amount too low");

        payments[paymentId] = Payment({
            payer: msg.sender,
            agent: agent,
            amount: msg.value,
            paymentId: paymentId,
            serviceId: serviceId,
            timestamp: block.timestamp,
            verified: true,
            settled: false
        });

        emit PaymentCreated(paymentId, msg.sender, agent, msg.value, serviceId);
        emit PaymentVerified(paymentId, true);
    }

    /**
     * @dev Settle payment and distribute funds to agent
     * @param paymentId Payment identifier
     */
    function settlePayment(string memory paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];

        require(bytes(payment.paymentId).length > 0, "Payment does not exist");
        require(payment.verified, "Payment not verified");
        require(!payment.settled, "Payment already settled");

        // Calculate platform fee
        uint256 fee = (payment.amount * platformFee) / FEE_DENOMINATOR;
        uint256 agentAmount = payment.amount - fee;

        // Mark as settled
        payment.settled = true;

        // Add to agent earnings
        agentEarnings[payment.agent] += agentAmount;
        agentEarnings[owner()] += fee; // Platform fee goes to owner

        emit PaymentSettled(paymentId, payment.agent, agentAmount);
    }

    /**
     * @dev Agent withdraws earnings in USDC
     */
    function withdrawUSDC() external nonReentrant {
        uint256 amount = agentEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        agentEarnings[msg.sender] = 0;

        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Agent withdraws earnings in ETH
     */
    function withdrawETH() external nonReentrant {
        uint256 amount = agentEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        agentEarnings[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Verify if payment exists and is valid
     * @param paymentId Payment identifier
     */
    function verifyPayment(string memory paymentId) external view returns (bool) {
        Payment memory payment = payments[paymentId];
        return bytes(payment.paymentId).length > 0 && payment.verified && !payment.settled;
    }

    /**
     * @dev Get payment details
     * @param paymentId Payment identifier
     */
    function getPayment(string memory paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }

    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }

    /**
     * @dev Update minimum payment amounts (only owner)
     */
    function setMinPayments(uint256 newMinUSDC, uint256 newMinETH) external onlyOwner {
        minPaymentUSDC = newMinUSDC;
        minPaymentETH = newMinETH;
    }

    /**
     * @dev Update USDC token address (only owner)
     */
    function setUSDCToken(address newUSDC) external onlyOwner {
        usdcToken = IERC20(newUSDC);
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}
