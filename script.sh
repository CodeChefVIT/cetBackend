#!/bin/bash
sudo apt update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16
nvm use 16
npm install -g npm
npm install -g pm2

sudo apt install nginx


# git clone https://N0v0cain3:{token}@github.com/CodeChefVIT/cetBackend.git
# cd cetBackend/
# npm i

