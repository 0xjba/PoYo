// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TokenSentimentTracker {
    struct TokenData {
        string symbol;
        uint256 bullishVotes;
        uint256 bearishVotes;
        bool exists;
    }

    struct UserVote {
        bool hasVoted;
        bool isBullish;
        uint256 timestamp;
    }

    // Admin address
    address public admin;
    
    // Mapping from token symbol to token data
    mapping(string => TokenData) public tokens;
    
    // Mapping from token symbol to user address to vote data
    mapping(string => mapping(address => UserVote)) public userVotes;
    
    // Array to keep track of all tokens
    string[] public tokenList;
    
    // 24 hour voting cooldown
    uint256 public constant VOTE_COOLDOWN = 24 hours;

    event TokenAdded(string symbol);
    event VoteSubmitted(string indexed symbol, address indexed user, bool isBullish);
    event TokenSentimentUpdated(string indexed symbol, uint256 bullishVotes, uint256 bearishVotes);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    function addToken(string memory symbol) external onlyAdmin {
        require(!tokens[symbol].exists, "Token already exists");
        
        tokens[symbol] = TokenData({
            symbol: symbol,
            bullishVotes: 0,
            bearishVotes: 0,
            exists: true
        });
        
        tokenList.push(symbol);
        emit TokenAdded(symbol);
    }

    function submitVote(string memory symbol, bool isBullish) external {
        require(tokens[symbol].exists, "Token not found");
        
        UserVote storage userVote = userVotes[symbol][msg.sender];
        
        // Check cooldown period if user has voted before
        if (userVote.hasVoted) {
            require(
                block.timestamp >= userVote.timestamp + VOTE_COOLDOWN,
                "Must wait 24 hours between votes"
            );
            
            // Remove previous vote
            if (userVote.isBullish) {
                tokens[symbol].bullishVotes--;
            } else {
                tokens[symbol].bearishVotes--;
            }
        }
        
        // Record new vote
        if (isBullish) {
            tokens[symbol].bullishVotes++;
        } else {
            tokens[symbol].bearishVotes++;
        }
        
        // Update user vote data
        userVotes[symbol][msg.sender] = UserVote({
            hasVoted: true,
            isBullish: isBullish,
            timestamp: block.timestamp
        });
        
        emit VoteSubmitted(symbol, msg.sender, isBullish);
        emit TokenSentimentUpdated(
            symbol,
            tokens[symbol].bullishVotes,
            tokens[symbol].bearishVotes
        );
    }

    function getTokenSentiment(string memory symbol) external view returns (
        uint256 bullishVotes,
        uint256 bearishVotes,
        uint256 totalVotes,
        uint256 sentimentScore
    ) {
        require(tokens[symbol].exists, "Token not found");
        
        TokenData memory token = tokens[symbol];
        totalVotes = token.bullishVotes + token.bearishVotes;
        
        // Calculate sentiment score (0-100)
        // 50 is neutral, >50 is bullish, <50 is bearish
        sentimentScore = totalVotes == 0 ? 50 : (token.bullishVotes * 100) / totalVotes;
        
        return (token.bullishVotes, token.bearishVotes, totalVotes, sentimentScore);
    }

    function getUserVoteStatus(string memory symbol, address user) external view returns (
        bool hasVoted,
        bool isBullish,
        uint256 timestamp
    ) {
        UserVote memory vote = userVotes[symbol][user];
        return (vote.hasVoted, vote.isBullish, vote.timestamp);
    }

    function getAllTokens() external view returns (string[] memory) {
        return tokenList;
    }

    function canUserVote(string memory symbol, address user) external view returns (bool) {
        UserVote memory vote = userVotes[symbol][user];
        if (!vote.hasVoted) return true;
        return block.timestamp >= vote.timestamp + VOTE_COOLDOWN;
    }
}