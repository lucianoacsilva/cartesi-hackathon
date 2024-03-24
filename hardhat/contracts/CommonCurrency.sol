// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CommonCurrency is ERC20, Ownable, ERC20Burnable {
    constructor(address _initialOwner)
        ERC20("CommonCurrency", "CMC")
        Ownable(_initialOwner)
    {
        authorizedAuthorities[_initialOwner] = true;
    }

    modifier onlyAuthority {
        require(authorizedAuthorities[msg.sender] == true, "Unauthorized!");
        _;
    }

    mapping (address=>bool) authorizedAuthorities;

    function mint(address to, uint256 amount) public onlyAuthority {
        _mint(to, amount);
    }

    function addAuthorizedAuthorities(address _tcAddress) public onlyAuthority {
        authorizedAuthorities[_tcAddress] = true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public override returns (bool) {
        require(authorizedAuthorities[_from] == true, "Unauthorized!");
        _transfer(_from, _to, _amount);

        return true;
    }

}
