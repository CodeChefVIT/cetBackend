#!/bin/bash
source /home/ec2-user/.bash_profile
cd /home/ec2-user/common-deploy
pm2 stop app.js
sudo chown -R ec2-user:ec2-user .
npm install
