// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Votting{

    address public addressOwner;

    enum State{
        Prestart,//0
        Start,//1
        End//2
    }

    State public states;

    struct Candidate{
        uint8 id;
        uint8 votecount;
        string name;
    }

    struct Votor{
        string name;
        bool hasVoted;
        uint8 condidateIdVoted;
    }

    uint8 public counter;

    Candidate[] public candida;

    mapping(address => Votor) public voterInfo;

    modifier onlyOwner() {
        require(msg.sender == addressOwner , " sorry, only owner can call cahnge states! ");
        _;
    }

    event ChangeStates(State states);
    event YouVoted(string nameCandida);
    event Winer(uint8);

    constructor() public{
        addressOwner = msg.sender;
        states = State.Prestart;
    }


    function changeStateToStart() public onlyOwner() {
        states = State.Start;
        emit ChangeStates(State.Start );
    }

    function changeStateToEnd() public onlyOwner() {
        require(states == State.Start, " before call it state must be Staet! ");
        states = State.End;
        emit ChangeStates(State.End);
    }

    function addCondidates(string memory name) public  onlyOwner() {
        require(states == State.Prestart, " call it state must be Prestart! ");
        candida.push(Candidate(counter,0,name));
        counter++;
    }

    function vottingToCondida(string memory name, uint8 candidaId) public {
        require(states == State.Start , " state must be Start! ");
        require(voterInfo[msg.sender].hasVoted == false, " u can vote only once time! ");
        voterInfo[msg.sender] = Votor(name, true, candidaId);
        candida[candidaId].votecount++;
        emit YouVoted(name);
    }

    function winnerCandida() public view returns(uint8, string memory) {
        require(states == State.End , " state must be Start! ");

        uint maximum = 1;
        uint8 winIndex = 0; 

        for(uint8 i=0;i<candida.length;i++){
            if(candida[i].votecount>maximum){
                maximum = candida[i].votecount;
                winIndex = i;
            }
        }
        // emit Winer(winIndex);
        return (winIndex, candida[winIndex].name);
        
    }

}

