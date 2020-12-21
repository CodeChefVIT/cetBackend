source /home/ec2-user/.bash_profile
cd /home/ec2-user/common-deploy
sudo chown -R ec2-user:ec2-user .
pm2 start app.js