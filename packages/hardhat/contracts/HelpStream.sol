// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HelpStream{

    uint256 totalHelpStreams;
    uint256 totalCreatedStreams;

    IERC20 public cUSDToken;
    address public owner;


    constructor() {

    owner = msg.sender;
    cUSDToken = IERC20(0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1);
    
    }

    struct Helpstream{
        uint256 id;
        string title;
        string description;
        string ipfsHash;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 remaining;
        address[] contributors;
        address creator;
        bool fullyFunded;       
    } 
    
    Helpstream[] helpStreams;

    struct Comment{
        address commenter;
        uint256 timestamp;
        string message;
    }

    //mapping of comments and a helpstream
    mapping(uint256 => Comment[]) public helpStreamComments;

    event HelpstreamRegistered(
        uint256 id,
        string title,
        string description,
        string ipfsHash,
        uint256 targetAmount,
        address creator
    );
    event HelpStreamDeleted(uint256 id, uint256 _timestamp,string title,uint256 _raisedAmount);
    event Funded( address sender,uint256 _id,uint256 _amount);
    event HelpStreamEdited(uint256 _id, string _newTitle, string _newDescription, uint256 _newTargetAmount);
    event CommentAdded(uint256 _id,address sender,string _message, uint256 _timestamp);

    // Function to register a new helpstream
    function registerHelpStream(
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        uint256 _targetAmount
    ) public {
        require(_targetAmount > 0 , "The target amount can't be 0");
        Helpstream memory newHelpstream = Helpstream({
            id: totalHelpStreams, // Use the length of the array as the ID
            title: _title,
            description: _description,
            ipfsHash: _ipfsHash,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            remaining: _targetAmount,
            contributors: new address[](0),  // Initialize an empty contributors array
            creator: msg.sender,
            fullyFunded: false
        });

        // Push the new helpstream into the helpStreams array
        helpStreams.push(newHelpstream);
        totalHelpStreams++;
        totalCreatedStreams++;

        // Emit an event to notify that a helpstream has been registered
        emit HelpstreamRegistered(
            newHelpstream.id,
            _title,
            _description,
            _ipfsHash,
            _targetAmount,
            msg.sender
        );
    }

    //function to delete a helpstream
    function deleteHelpStream(uint256 id) public {
        require(id < helpStreams.length, "Helpstream does not exist");
        Helpstream storage helpstream = helpStreams[id];
        require(
            helpstream.creator == msg.sender,
            "Only the creator can delete the helpstream"
        );

        // Replace the helpstream to be deleted with the last one in the array
        helpStreams[id] = helpStreams[helpStreams.length - 1];

        // Remove the last element (effectively deleting the helpstream)
        helpStreams.pop();

        totalCreatedStreams--;

        emit HelpStreamDeleted(
            id,
            block.timestamp,
            helpstream.title,
            helpstream.raisedAmount
        );
    }

    //function to fund a helpstream
    function fund(uint256 _id ,uint256 _amount) public {
        require(_id <= helpStreams.length , "Helpstream does not exist");
        Helpstream storage helpstream = helpStreams[_id];
        helpstream.raisedAmount = helpstream.raisedAmount + _amount;
        helpstream.contributors.push(msg.sender);
        helpstream.remaining -= _amount;

        if(helpstream.remaining == 0){
            helpstream.fullyFunded = true;
        }

        emit Funded(msg.sender, _id, _amount);
    }

    // Edit helpstream details (only creator)
    function editHelpStream(
        uint256 _id,

        string memory _newTitle,
        string memory _newIpfsHash,
        string memory _newDescription,
        uint256 _newTargetAmount
    ) public {
        require(_id < helpStreams.length, "Helpstream does not exist");

        Helpstream storage helpstream = helpStreams[_id];
        require(helpstream.creator == msg.sender, "Only the creator can edit this helpstream");

        helpstream.title = _newTitle;
        helpstream.ipfsHash = _newIpfsHash;
        helpstream.description = _newDescription;
        helpstream.targetAmount = _newTargetAmount;
        helpstream.remaining = _newTargetAmount - helpstream.raisedAmount;

        emit HelpStreamEdited(_id, _newTitle, _newDescription, _newTargetAmount);
    }

     // Add a comment to a helpstream
    function addComment(uint256 _id, string memory _message) public {
        require(_id < helpStreams.length, "Helpstream does not exist");

        Comment memory newComment = Comment({
            commenter: msg.sender,
            message: _message,
            timestamp: block.timestamp
        });

        helpStreamComments[_id].push(newComment);

        emit CommentAdded(_id, msg.sender, _message, block.timestamp);
    }

    // Get comments for a helpstream
    function getComments(uint256 id) public view returns (Comment[] memory) {
        require(id < helpStreams.length, "Helpstream does not exist");
        return helpStreamComments[id];
    }

    // Helper function to get all helpstreams 
    function getAllHelpStreams() public view returns (Helpstream[] memory) {
        return helpStreams;
    }

    //function to get a single helpstream
    function getHelpStream(uint256 id) public view returns (Helpstream memory) {
        return helpStreams[id];
    }
}
