const { Client: SshClient } = require('ssh2');

const config = {
  host: 'w0214da1.kasserver.com',
  username: 'ssh-w021de64',
  password: 'UmRP3YPcXo55r4MYu6sF',
  port: 22
};

const REMOTE_BASE = '/www/htdocs/w021de64/flugschule-app/flugschule-hirondelle';
const NODE_BIN = '/www/htdocs/w021de64/.nvm/versions/node/v26.7.0/bin/node';

async function deploy() {
  const conn = new SshClient();
  conn.on('ready', () => {
    console.log('SSH connection ready. Running git pull and updating...');
    
    // Using master instead of main
    const cmd = `
      cd ${REMOTE_BASE} &&
      git reset --hard HEAD &&
      git pull origin master &&
      cd backend &&
      ${NODE_BIN} fix_event_images.js &&
      ${NODE_BIN} remove_duplicates.js &&
      /www/htdocs/w021de64/.nvm/versions/node/v26.7.0/bin/pm2 restart all
    `;
    
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log('Deployment script finished with code ' + code);
        conn.end();
      }).on('data', (data) => {
        process.stdout.write(data.toString());
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });
    });
  }).connect(config);
}

deploy();
