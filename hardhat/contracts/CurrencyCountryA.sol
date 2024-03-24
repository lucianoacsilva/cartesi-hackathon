// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CurrencyCountryA is ERC20, Ownable {
    constructor(address _initialOwner)
        ERC20("CurrencyCountryA", "CRCA")
        Ownable(_initialOwner)
    {
        authorizedAuthorities[_initialOwner] = true;
    }

    mapping (address=>uint256) private exchangeRates;
    mapping (address=>bool) authorizedAuthorities;

    modifier onlyAuthority {
        require(authorizedAuthorities[msg.sender] == true);
        _;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function getExchangeRate(address _currencyAddress) public view returns (uint256) {
        return exchangeRates[_currencyAddress];
    }

    function setExchangeRateCurrency(address _currencyAddress, uint256 _rate) public onlyAuthority {
        exchangeRates[_currencyAddress] = _rate;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public override returns (bool) {
        _transfer(_from, _to, _amount);

        return true;
    }

    function convertToCommonCurrency(address _targetCurrency, uint256 _amount) public {
        IERC20 targetToken = IERC20(_targetCurrency);
        uint256 prize = _amount * exchangeRates[_targetCurrency];

        require(this.balanceOf(msg.sender) >= prize, "Error: Not enough funds!");

        bool isDone = transferFrom(msg.sender,_targetCurrency, prize);
        bool isDone2 = targetToken.transferFrom(_targetCurrency, msg.sender, _amount);

        require(isDone && isDone2, "transaction failed!");
    }
    
    function withdrawCommonCurrency(address _targetCurrency, uint256 _amount) public {
        IERC20 targetToken = IERC20(_targetCurrency);
        uint256 withdraw = _amount * exchangeRates[_targetCurrency];

        require(_amount <= targetToken.balanceOf(msg.sender), "Error: Not enough tokens to exchange!");
        require(withdraw <= balanceOf(_targetCurrency), "Error: Not enough funds to withdraw!");

        targetToken.transferFrom(_targetCurrency, msg.sender, _amount);
        transferFrom(_targetCurrency, msg.sender, withdraw);
    }    
}
