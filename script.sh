#!/bin/bash
sudo apt update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16
nvm use 16
npm install -g npm
npm install -g pm2

sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/caddy-stable.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
sudo setcap CAP_NET_BIND_SERVICE=+eip $(which caddy)



# git clone https://N0v0cain3:{token}@github.com/CodeChefVIT/cetBackend.git
# cd cetBackend/
# npm i

