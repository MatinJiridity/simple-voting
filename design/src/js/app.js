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
          console.log('current account: ' + CurrentAccount);
          setCurrentAccount();
          });
      //  console.log(a);
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      //   console.log('2');
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
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

    const accounts = await web3.eth.getAccounts();
    // console.log(accounts);

    const networkId = await web3.eth.net.getId();
    // console.log('networkId: ',networkId);

    const networkData = JsonContract.networks[networkId];
    // console.log('networkData: ',networkData);
    // console.log('networkData.address: ',networkData.address);
    // console.log('contractData.abi: ',JsonContract.abi);

    if(networkData) {
        MyContract = new web3.eth.Contract(JsonContract.abi, networkData.address)
        // console.log(MyContract);
         // await  MySCcontract.methods.setStr('salam').send({ from: CurrentAccount });
         Owner = await  MyContract.methods.Owner().call();
        //  console.log('Owner: ',Owner);
         Faz = await  MyContract.methods.fazes().call();
        //  console.log('fazes: ',Faz);
         ShowFaz();

     }

   
     $(document).on('click','#btn_Add',btn_Add);
     $(document).on('click','#btn_Vote',btn_Vote);
     $(document).on('click','#btn_Win',btn_Win);
     $(document).on('click','#btn_ActFaz',btn_ActFaz);
     $(document).on('click','#Vote',vote);
}

function Close() {
    window.location.reload();
}

function ShowFaz() {
    if(Faz == 0){
        $('#FazFill').text(' Pre Start ===> Please Register with Admin...');
    } else if(Faz == 1){
        $('#FazFill').text(' Start ===> Please Vote Your Selected Candida...');
    }else{
        $('#FazFill').text(' End ===> Please Click Win Candida...');
    }
}

async function btn_ChangeFaz() {
    window.location.reload();
}

function btn_ActFaz() {
    if (Owner.toLowerCase() == CurrentAccount) {
        var conceptFaz = $('#SelectFaz').find(":selected").text();
        // console.log(conceptFaz);
        var NumFaz = 0;
        if (conceptFaz == 'Faz 1: Start') {
            NumFaz = 1;
        }else if (conceptFaz == 'Faz 2: End'){
            NumFaz = 2;
        }
        //  console.log(NumFaz);
        //  console.log(Faz);
        if (NumFaz > Faz) {
            MyContract.methods.ChangFaz(NumFaz).send({ from: CurrentAccount }).then(function (Instance) {      
                console.log(Instance);
            }).catch(function (error) {
                console.log(error.message);
            });
            window.location.reload();
        }else{
            alert("You dont select this Faz...");
        }
       
    }else{
        alert("You do not have access to this section");
        // return;
    } 
    
    
}

function btn_Add() {

    if (Owner.toLowerCase() == CurrentAccount) {
        if (Faz == 0) {
            var name = $('#SetNameCandida').val();
            if (name.trim() == '') {
                alert('Please Fill Text...');
                return;
            }
            console.log(name);   
            MyContract.methods.AddCandida(name).send({ from: CurrentAccount }).then(function (Instance) {      
                console.log(Instance);
            }).catch(function (error) {
                console.log(error.message);
            });

        }else{
            alert("You dont Act this Faz...");
        }
       
    }else{
        alert("You do not have access to this section");
    } 
}

async function vote() {
    var CandidaCount = await  MyContract.methods.Counter().call();
   // console.log(CandidaInfo);
   var trHTML = '';  
//    console.log(trHTML);
   for (var i = 0; i < CandidaCount; i++) {
    var item = await  MyContract.methods.candida(i).call();
    // console.log(item.Id);
    //  console.log(item.id);
    //  console.log(item.name);
    //  console.log(item.CountVote);
         
    // for (let index = 0; index < array.length; index++) {
      
        trHTML += '<tr><td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.CountVote + '</td></tr>';
    // }    
    // $.each(item.id, function (i, items) {
        
    //     trHTML += '<tr><td>' + item.id[i] + '</td><td>' + item.name[i] + '</td>d>' + item.CountVote[i] + '</td></tr>';
    // });
    
   }
   $('#location').append(trHTML);
//    console.log(trHTML);
}

async function btn_Vote() {
    var namecandid = $('#nameCandida').val();
    var idcandid = $('#idCandida').val();

    if (namecandid.trim() == '' || idcandid.trim() == '') {
        alert('Please Fill Text...');
        return;
    }

    if (Faz == 1) {
        MyContract.methods.VottingCandida(namecandid,idcandid).send({ from: CurrentAccount }).then(function (Instance) {      
            console.log(Instance);
        }).catch(function (error) {
            console.log(error.message);
        });
    }else{
        alert("Please Wait, It is not time to vote yet");
    } 
}

async function btn_Win() {
    if (Faz == 2) {
        var WinCandida = await  MyContract.methods.WinCandida().call();
        $('#WinFill').text('====> Name: ' + WinCandida[1] + ' With ID: ' + WinCandida[0]);
    }else{
        alert("Please Wait, It is not yet time to announce the winner of the vote");
    } 
}