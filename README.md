# EXX Chain Node Setup Guide

## REQUIREMENT

### System Hardware Requirement

To RUN a validator node you need a min configuration

```text
CPU: 8 cores
RAM: 16 GB and swap 200 GB
Storage: 500 GB SSD (1 TB recomended for long term)
Network: More than 100 Mbps speed
OS: Ubuntu 20.04 LTS
```

### Envioronment Requirement

For Security Purpose its recomended to add a new user and give the user `sudo access`

```bash
aduser developer
usermod -aG sudo developer
su - developer
```

## PREQUISITES

### Update apt repository list

- Update apt repository list using `sudo apt update`.

### Install basic packages

We need to isntall following packages. Please Provide appropriate region if asked.

```bash
sudo apt-get install curl gnupg tar git software-properties-common build-essential -y
```
Install Nodejs Guide - https://github.com/exxnetwork/exxpoas-documentation/blob/main/NODEJS.md

[Official Guide](https://nodejs.dev/en/download) to Download and install.

## SETUP

Before you start setting up the node make sure to take some security steps activating firewall rules

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw deny 8545
sudo ufw deny 8546
sudo ufw deny 8551
sudo ufw enable
```

To Setup a validator you will be needing one validator keypair and one deposit credentials file.

Validator keypair will be used to sign and verify blocks in the POA consensus system.

Deposit Credentials file will be used while staking through launch pool.

1. Clone the github repo ``.
2. Change Directory to `exxpoaskeypair-utill` using `cd exxpoas-keypair-utill`.
3. Install dependencies using `npm install`.
4. Generate keys and credential using `node ./keygen.js`

## Stake

After you setted up everything here please wait for one day to fully sync the network.

Check keypair-utils folder you will find a deposit-signature.json copy it to safe place.

#### AFTER 1 DAYS

.

and follow the instruction...

You are a validator Now
