// give the contract some SVG code
// output an FNT URI with this SVG code
// Stpring all the NFT metadata on chain

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "base64-sol/base64.sol"; // for encoding SVG to base64


contract SVGNFT is ERC721URIStorage { // SVGNFT inheritence ERC721URIStorage
    uint256 public tokenCounter; // counter for the number of tokens minted
    event CreatedNFT(uint256 indexed tokenID, string tokenURI); // event to log the creation of an NFT

    constructor() ERC721("SVG NFT", "svgNFT") { // (name, symbol)

    }

    function create(string memory _svg) public {
        _safeMint(msg.sender, tokenCounter); // mint to the sender (Framework function)
        string memory imageURI = svgToImageURI(_svg); // convert SVG to image URI
        string memory tokenURI = formatTokenURI(imageURI); // format the token URI with metadata
        _setTokenURI(tokenCounter, tokenURI); // set the token URI for the minted token (Framework function)
        emit CreatedNFT(tokenCounter, tokenURI); // emit the event with the token ID and URI
        tokenCounter++; // increment the token counter
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
}