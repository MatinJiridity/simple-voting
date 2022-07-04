$(function () {
    $(window).load(function () {
      //  alert("hello");
      PrepareNetwork();
    });   
});

var JsonContract = null;
var web3 = null;
var MyContract  = null;
var Owner = null;
var Faz = null;
var tableHtml = '';

async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
}


async function loadWeb3() {
    
   // console.log(window.ethereum);
  //  console.log(window.web3);

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await  ethereum.request({method: 'eth_requestAccounts'}).then(function (accounts) {
          CurrentAccount = accounts[0];
          web3.eth.defaultAccount = CurrentAccount;
          console.log(` current account: ${CurrentAccount}`);
          setCurrentAccount();
          });
      //  console.log(a);
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      //   console.log('2');
      }
      else {
        window.alert(' Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    ethereum.on('accountsChanged', handleAccountChanged);
    ethereum.on('chainChanged', handleChainChanged);

}


function setCurrentAccount() {
    $('#AddressFill').text(CurrentAccount);
}

async function handleAccountChanged() {
    await  ethereum.request({method: 'eth_requestAccounts'}).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        setCurrentAccount();
    });
}


async function handleChainChanged(_chainId) {
  
    window.location.reload();
    console.log('Chain Changed: ', _chainId);
}

async function LoadDataSmartContract() {
    await $.getJSON('Votting.json', function(contractData) {
        // console.log('JsonContract: ',contractData);
        JsonContract = contractData;
      });

      web3 = await window.web3;
    // console.log(web3.eth);

      const networkId = await web3.eth.net.getId();           // grt id of network that in ganache is 5777

      const networkData = JsonContract.networks[networkId];   // getting address of contract from json of contract (in json arr all information about contract) we can see it in ganache too.

      if(networkData) {
          MyContract = new web3.eth.Contract(JsonContract.abi, networkData.address);
          console.log(MyContract); 
          
          Owner = await MyContract.methods.addressOwner().call(); //u can get imformatin from contract by make object
          console.log("owner", Owner);

          Faz = await MyContract.methods.states().call();
          console.log('STATE NOW: ',Faz);

          ShowState();
      };

      $(document).on('click', '#btn_ActFaz', btn_ActFaz); //when u click change state 
      $(document).on('click','#btn_Add',btn_Add);//when u click add candida
      $(document).on('click','#Vote',vote);//when u click add vote candida so it must connect to 
      $(document).on('click','#btn_Vote',btn_Vote);
      $(document).on('click','#btn_Win',btn_Win);
}

function ShowState() {
  if(Faz == 0) {
    $('#FazFill').text('  Prestart ==> pleas Register candida with admin..  ');
  }else if(Faz == 1) {
    $('#FazFill').text('  Start ==> pleas Vote your candida ..  ');
  }else{
    $('#FazFill').text('  End ==> pleas click WIN candida button..  ');
  }
}

//btn act faz
  
async function Close() {  //Close in html for refresh
    await window.location.reload();
    Faz = await MyContract.methods.states().call();
    alert(`STATE NOW: ${Faz}`);
}



function btn_Add() {

  if(Owner.toLowerCase() == CurrentAccount) { 

    if(Faz == 0){

          var nameCandidates = $('#SetNameCandida').val();//reed the string on deafult input
          if(nameCandidates.trim() == '') {
                alert(' pleas fill the box add voted! ');
                return;
          };

          MyContract.methods.addCondidates(nameCandidates).send({from: CurrentAccount}).then(function (instans){
              console.log(instans);
          }).catch(function (error){
              console.log(error.message);
          });

      }else{
          alert(' at firs stete must be Prestart. ');
      }

  }else{
      alert(' only owner can call it! ');
  }
}



async function vote() {

  var candidaCount = await MyContract.methods.counter().call(); 
  console.log(candidaCount);

///
  for(var i=0; i < candidaCount; i++) {    //for setting candida information candida need uint
      
      var item = await MyContract.methods.candida(i).call();
      // console.log(item);

      tableHtml += '<tr><td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.votecount + '</td></tr>';//add tag in table html
        console.log(" tableHtml:   " , tableHtml);
    };
  $('#location').append(tableHtml);
}



async function btn_ActFaz() {


  // if(tableHtml = '') {
  //   alert(' pleas add candida brfore going  Start state! ');
  //   return;
  // }else{

      if(Owner.toLowerCase() == CurrentAccount) { //only owner can call

          var ConseptFaz = $('#SelectFaz').find(":selected").text(); // for getting the string of states 
          // console.log(ConseptFaz);
          var numFaz = 0;

          if(ConseptFaz == 'Faz 1: Start') {
            numFaz = 1;
          }else if(ConseptFaz == 'Faz 2: End') {
            numFaz = 2;
          }
          // console.log(numFaz);

          if(numFaz > Faz) {
            
              // if(tableHtml = '') {
              //     alert(' pleas add candida brfore going  Start state! ');
              //     return;
              // }else{

                    if (numFaz == 1 ) {
                        MyContract.methods.changeStateToStart().send({from: CurrentAccount}).then(function (instans){ // this method use for add some informatin on blockchain by contract
                          console.log(instans);
                        }).catch(function (error){
                          console.log(error.message);
                        }).alert(numFaz);
                    } 

                    if (numFaz == 2 && Faz == 1) {
                          MyContract.methods.changeStateToEnd().send({from: CurrentAccount}).then(function (instans){
                              console.log(instans);
                          }).catch(function (error){
                              console.log(error.message);
                          }).alert(numFaz);
                          }else{
                              alert(" pleas go to Start state brfore going to End state ");
                          return;
                    }; 

          }else{
              alert('You cant backing the state')
          };     

      }else{
        alert(' only owner can call it! ');
      };
  
}


///////////// TAMRIN /////////

async function btn_Vote() {

    var nameCandida = $('#nameCandida').val(); // reading value in input html
    var idCandida = $('#idCandida').val();
    // console.log(nameCandida);
    // console.log(idCandida);

    var tableHtmlInputNew = '';
    var tableHtml2 = '';
    var candidaCount = await MyContract.methods.counter().call(); 
    var isbtn_VotedCorrect = null;

    for(var i=0; i < candidaCount; i++) {    //for setting candida information candida need uint
      
        var item = await MyContract.methods.candida(i).call();

        tableHtml2 = '<tr><td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.votecount + '</td></tr>';//add tag in table html
        // console.log(" tableHtml2222:     " , tableHtml2);

        tableHtmlInputNew = '<tr><td>' + idCandida + '</td><td>' + nameCandida + '</td><td>' + item.votecount + '</td></tr>';//add tag in table html
        // console.log(" tableHtml inputed :     " ,tableHtmlInputNew);

        if(tableHtml2 == tableHtmlInputNew){
            isbtn_VotedCorrect = true;
            break; 
        }else{
            isbtn_VotedCorrect = false;
        }
    };

    // console.log(isbtn_VotedCorrect); // are id and name correct?

    var voted = await MyContract.methods.voterInfo(CurrentAccount).call(); //voterInfo need address

    if(nameCandida.trim() == '' || idCandida.trim() == '') {
        alert(' pleas fill the boxes ');
        return;
    }
    
    if(voted[1] == false) {  //has Voted? no

        if(isbtn_VotedCorrect == true) {

              if (Faz == 1) {
                  MyContract.methods.vottingToCondida(nameCandida, idCandida).send({from: CurrentAccount}).then(function (instans){
                    console.log(instans);
                  }).catch(function (error){
                    console.log(error.message);
                  });   
              }else{
                  alert(' state must be Start! ')
              };
              
        }else{
          alert(" name Candida or id Candida is not true! ")
          return
        }

    }else{
        alert(" you have voted. ");
        console.log(CurrentAccount,voted[1]);
        return;
    } 
}


async function btn_Win() {

    if (Faz == 2) {
        var winCandida = await MyContract.methods.winnerCandida().call();

        $('#WinFill').text("====> name: "+winCandida[1]+" with id: "+winCandida[0]);

    }else{
        alert(' state must be End! ')
    }

}

