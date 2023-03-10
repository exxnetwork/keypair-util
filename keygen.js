import inquirer from 'inquirer';
import Wallet from 'ethereumjs-wallet';
import bip39 from 'bip39';
import hdkey from 'hdkey';
import ethUtil from 'ethereumjs-util';
import fs from 'fs';
import path from 'path';
import Web3 from 'web3';
import { setTimeout } from 'timers/promises';
import { BigNumber} from 'bignumber.js'
const __dirname = path.resolve();

let web3 = new Web3("https://ds2.exx.network");


//function for generate mnemonic
async function generateMnemonic(){
  console.log("Please wait Generating new seed")
  await setTimeout(2000); //wait for 2 seconds
  let mnemonic = bip39.generateMnemonic();
  console.log(mnemonic)
  console.log(".......Store this seed is a secure place.......");
  await setTimeout(2000); //wait for 2 seconds
  return mnemonic;
}

//generate public private key of address
async function walletfromMnemonic(userInput){
  console.log("......we are using first address to generate stuff")
  let mnemonic = userInput
  let seed = await bip39.mnemonicToSeed(mnemonic);
  let root = hdkey.fromMasterSeed(seed);
  let masterPrivateKey = root.privateKey.toString('hex');
  let addrNode = root.derive("m/44'/60'/0'/0/0");
  let pubKey = ethUtil.privateToPublic(addrNode._privateKey);
  let privateKey = addrNode._privateKey.toString('hex');
  let addr = "0x"+ethUtil.publicToAddress(pubKey).toString('hex');
  let address = ethUtil.toChecksumAddress(addr);
  // console.log("Private Key ", masterPrivateKey);
  // console.log("Public Key", address);
  return {mnemonic, privateKey, address};
}

//generate signed json file
async function generateDepositeSignature(jsonObject){
  let amountInWei = BigInt(BigNumber(jsonObject.amountStake).multipliedBy(BigNumber(10**18)).toFixed());
  // let amountInWei = BigInt(BigNumber(jsonObject.amountStake).toFixed());
  let message = `I want to stake ${amountInWei.toString()} EXX coin to testnet from ${jsonObject.address.toLowerCase()}.`;
  // console.log(jsonObject);
  let sign = web3.eth.accounts.sign(web3.utils.sha3(message), `0x${jsonObject.privateKey}`);
  let template = `{
  "message": "${message}",
  "amount": "${amountInWei.toString()}",
  "timestamp": ${Date.now()},
  "signature": "${sign.signature}",
  "address": "${jsonObject.address}"
}`;
  console.log(template);
  let date = new Date();
  let filename = 'UTC--'+date.toISOString();
  let wallet = Wallet.default.fromPrivateKey(Buffer.from(jsonObject.privateKey,'hex'));
  let content = await wallet.toV3String(jsonObject.password);
  //fs.writeFileSync(`${filename}.json`, template); //write json file
  filename = filename.replace(':','-').replace(':','-').slice(0,24)+'.306670631Z'+'--'+JSON.parse(content).address;
  fs.writeFileSync(path.join(__dirname,'blockchain','.ethereum','keystore',`${filename}`), content); //write json
  fs.writeFileSync(path.join(__dirname,'deposit-signature.json'), template); //write json
  fs.writeFileSync(path.join(__dirname,'blockchain','password.txt'), jsonObject.password); //write password.txt
  fs.writeFileSync(path.join(__dirname,'blockchain/start.sh'),"geth --config /app/config2.toml --mine --unlock 0x"+JSON.parse(content).address+" --password /app/password.txt --http --ws --allow-insecure-unlock")
  // web3.eth.accounts.sign("Hello World", `0x${jsonObject.privateKey}`)
  // .then(console.log);
}

//inquirer questions
const questionSetA = [
  {
      type: "list",
      name: "seedOption",
      message: "Do you have seed phrase?",
      choices: ["yes", "no"]
  },
  {
    type: "input",
    name: "mnemonicProvided",
    message: "Enter 12 keyword mnemonic",
    when(answers) {
        return answers.seedOption === "yes"
    }
  },
  {
    type: "confirm",
    name: "mnemonicGenerated",
    message: "Press ENTER key to continue",
    default: true,
    when(answers) {
        return answers.seedOption === "no"
    }
  },
]

const questionSetB = [
  {
    type: "input",
    name: "amountStake",
    message: "How much amount you want to stake?",
    default: "50",
    // default: "200000",
  },
  {
    type: "input",
    name: "password",
    message: "Enter password to secure keystore",
    when(answers){
      return answers.amountStake
    }
  },
]

//inquirer call
inquirer
.prompt(questionSetA)
.then(async (answers) => {
  let signedMessage;  //variable of store signed message properties
  if(answers.seedOption === "no"){
    let seed = await generateMnemonic();
    let wallet = await walletfromMnemonic(seed.trim());
    //answers.mnemonicGenerated = wallet;
    //console.log(wallet);
    signedMessage = wallet;
  }
  if(answers.seedOption === "yes"){
    let seed = await walletfromMnemonic((answers.mnemonicProvided).trim());
    signedMessage = seed;
    console.log("signedMessage", signedMessage);
  }
  if(answers.mnemonicGenerated === true || answers.mnemonicProvided)
  {
    inquirer
    .prompt(questionSetB)
    .then(async (answers) => {
      // console.log(JSON.stringify(answers, null, 2))
      signedMessage = {...signedMessage, ...answers}
      console.log(JSON.stringify(signedMessage, null, 2));
      let file = await generateDepositeSignature(signedMessage);
    })
  }
})
.catch((error) => {
  if (error.isTtyError) {
    console.log("Your console environment is not supported!")
  } else {
    console.log(error)
  }
})
