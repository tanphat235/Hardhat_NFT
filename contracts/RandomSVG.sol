// SPDX_License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol"; // for random number generation by Chainlink VRF
import "./SVGNFT.sol"; // import the SVGNFT contract
import "base64-sol/base64.sol"; // for encoding SVG to base64

contract RandomSVG is ERC721URIStorage, VRFConsumerBase {
    bytes32 public keyHash;
    uint256 public fee;
    uint256 public tokenCounter; // counter for the number of tokens minted
    
    // SVG parameters
    uint256 public maxNumberOfPaths;
    uint256 public maxNumberOfPathsCommands;
    uint256 public size;
    string[] public pathCommands;
    string[] public colors;

    mapping(bytes32 => address) public requestIDToSender; // map request ID to sender address
    mapping(bytes32 => uint256) public requestIdtoTokenId; // map token ID to SVG string
    mapping(uint256 => uint256) public tokenIdToRandomNumber; // map token ID to random number generated

    event requestedRandomSVG(bytes32 indexed requestId, uint256 indexed tokenId); // event to log the request for random SVG
    event CreatedUnfinishedRandomSVG(uint256 indexed tokenId, uint256 randomNumber); // event to log the creation of an unfinished random SVG
    event CreatedRandomSVG(uint256 indexed tokenId, string tokenURI); // event to log the creation of a finished random SVG


    constructor(address _VRFCoordinator, address _LinkToken, bytes32 _keyHash, uint256 _fee) 
        VRFConsumerBase(_VRFCoordinator, _LinkToken) 
        ERC721("RandomSVG", "rsNFT") { // (name, symbol)
            fee = _fee; // set the fee for Chainlink VRF
            keyHash = _keyHash; // set the key hash for Chainlink VRF
            tokenCounter = 0; // initialize the token counter

            maxNumberOfPaths = 10; // set the maximum number of paths for the SVG
            maxNumberOfPathsCommands = 5;
            size = 500; // set the size of the SVG
            pathCommands = ["M", "L"]; // define the path commands for the SVG
            colors = ["red", "blue", "green", "yellow", "black", "white"]; // define the colors for the SVG
    }

    function create() public returns (bytes32 requestId) {
        requestId = requestRandomness(keyHash, fee); // request a random number from Chainlink VRF
        requestIDToSender[requestId] = msg.sender; // map the request ID to the sender address
        uint256 tokenId = tokenCounter;
        requestIdtoTokenId[requestId] = tokenId; // store the sender address for the request ID
        tokenCounter++; 
        emit requestedRandomSVG(requestId, tokenId); // emit an event with the request ID and token ID

    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber) internal override {
        address nftOwner = requestIDToSender[requestId]; // get the sender address from the request ID
        uint256 tokenId = requestIdtoTokenId[requestId]; // get the token ID from the request ID
        _safeMint(nftOwner, tokenId);
        // generate a random SVG string based on the random number
        tokenIdToRandomNumber[tokenId] = randomNumber; // store the random number for the token ID
        emit CreatedUnfinishedRandomSVG(tokenId, randomNumber); // emit an event with the token ID and random number
    }

    function finishMint(uint256 _tokenId) public {
        require(bytes(tokenURI(_tokenId)).length <= 0, "Token URI already set"); // check if the token URI is already set
        require(tokenCounter > _tokenId, "Token ID does not exist"); // check if the token ID exists
        require(tokenIdToRandomNumber[_tokenId] > 0, "Random number VRF not generated yet"); // check if the random number is generated
        uint256 randomNumber = tokenIdToRandomNumber[_tokenId]; // get the random number for the token ID
        string memory svg = generateSVG(randomNumber); // generate the SVG string based on the random number
        string memory imageURI = svgToImageURI(svg); // convert the SVG to an image URI
        string memory tokenURI = formatTokenURI(imageURI); // format the token URI with metadata
        _setTokenURI(_tokenId, tokenURI);
        emit CreatedRandomSVG(_tokenId, svg); // emit an event with the token ID and svg
    
    }

    function generateSVG(uint256 _randomNumber) public view returns (string memory finalSvg) {
        uint256 numberOfPaths = (_randomNumber % maxNumberOfPaths) + 1; // generate a random number of paths

        finalSvg = string(abi.encodePacked("<svg xmlns='http://www.w3.org/2000/svg' height='", 
                                            uint2str(size), 
                                            "' width='", 
                                            uint2str(size), 
                                            "'>")); // close the SVG tag

        for (uint256 i = 0; i < numberOfPaths; i++) {
            uint256 newRNG = uint256(keccak256(abi.encode(_randomNumber, i))); // generate a new random number for each path
            string memory pathSvg = generatePath(newRNG); // generate the path SVG string
            finalSvg = string(abi.encodePacked(finalSvg, pathSvg)); // concatenate the path SVG to the final SVG
        }
        finalSvg = string(abi.encodePacked(finalSvg, "</svg>")); // close the SVG tag
    }

    function generatePath(uint256 _randomNumber) public view returns (string memory pathSvg){
        uint256 numberOfPaths = (_randomNumber % maxNumberOfPathsCommands) + 1; // generate a random number of path commands
        pathSvg = "<path d='"; // start the path SVG string
        for (uint256 i = 0; i < numberOfPaths; i++) {
            uint256 newRNG = uint256(keccak256(abi.encode(_randomNumber, size + i))); // generate a new random number for each path command
            string memory pathCommand = genetePathCommand(newRNG);
            pathSvg = string(abi.encodePacked(pathSvg, pathCommand)); // concatenate the path command to the path SVG
        }
        string memory color = colors[_randomNumber % colors.length]; // select a random color from the colors array
        pathSvg = string(abi.encodePacked(pathSvg, "' fill='transparent' stroke='", color, "'/>")); // close the path SVG tag with the color
    
    }

    function genetePathCommand(uint256 _randomNumber) public view returns (string memory pathCommand) {
        pathCommand = pathCommands[_randomNumber % pathCommands.length]; // select a random path command from the pathCommands array
        uint256 parameterOne = uint256(keccak256(abi.encode(_randomNumber, size * 2))) % size; // generate a random parameter for the path command
        uint256 parameterTwo = uint256(keccak256(abi.encode(_randomNumber, size * 3))) % size; // generate a random parameter for the path command
        pathCommand = string(abi.encodePacked(pathCommand, " ", uint2str(parameterOne), " ", uint2str(parameterTwo), " ")); // concatenate the path command with the parameters
    }

    function svgToImageURI(string memory _svg) public pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,"; // base64 encoding for SVG
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(_svg)))); // encode the SVG to base64
        string memory imageURI = string(abi.encodePacked(baseURL, svgBase64Encoded)); // concatenate the base URL and the encoded SVG
        return imageURI; // return the full image URI
    }

    function formatTokenURI(string memory _imageURI) public pure returns (string memory) {
        string memory baseURL = "data:application/json;base64,"; // base64 encoding for JSON metadata
        return string(abi.encodePacked(
            baseURL,
            Base64.encode(
                bytes(abi.encodePacked(
                    '{"name": "SVG NFT", "description": "An NFT based on SVG!", "attributes": "", "image": "', 
                    _imageURI, '"}'
                ))
            ) // format the token URI with metadata
        )); // return the formatted token URI
    }

    // From: https://stackoverflow.com/a/65707309/11969592
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}