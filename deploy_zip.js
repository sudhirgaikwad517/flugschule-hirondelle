const Client = require('ssh2-sftp-client');
const { Client: SshClient } = require('ssh2');
const path = require('path');

const config = {
  host: 'w0214da1.kasserver.com',
  username: 'ssh-w021de64',
  password: 'UmRP3YPcXo55r4MYu6sF',
  port: 22
};

const REMOTE_BASE = '/www/htdocs/w021de64/flugschule-app/flugschule-hirondelle';
const NODE_BIN = '/www/htdocs/w021de64/.nvm/versions/node/v26.7.0/bin/node';

async function deploy() {
  const sftp = new Client();
  try {
    console.log('Connecting via SFTP...');
    await sftp.connect(config);

    console.log('Uploading dist.zip...');
    await sftp.fastPut(
      path.join(__dirname, 'dist.zip'),
      `${REMOTE_BASE}/dist.zip`
    );
    
    // Check if backend files need to be re-uploaded or they are already uploaded by previous script
    console.log('Uploading backend fix scripts...');
    await sftp.fastPut(
      path.join(__dirname, 'backend/fix_event_images.js'),
      `${REMOTE_BASE}/backend/fix_event_images.js`
    );
    await sftp.fastPut(
      path.join(__dirname, 'backend/remove_duplicates.js'),
      `${REMOTE_BASE}/backend/remove_duplicates.js`
    );

    await sftp.end();
    console.log('SFTP Upload complete. Connecting via SSH to unzip and run scripts...');

    const conn = new SshClient();
    conn.on('ready', () => {
      console.log('SSH connection ready. Running commands...');
      const cmd = `cd ${REMOTE_BASE} && unzip -o dist.zip -d frontend/dist && rm dist.zip && cd backend && ${NODE_BIN} fix_event_images.js && ${NODE_BIN} remove_duplicates.js`;
      
      conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Scripts finished with code ' + code);
          console.log('Restarting PM2 apps...');
          conn.exec(`cd ${REMOTE_BASE}/backend && /www/htdocs/w021de64/.nvm/versions/node/v26.7.0/bin/pm2 restart all`, (err2, stream2) => {
            if (err2) throw err2;
            stream2.on('close', () => {
                console.log('PM2 restart initiated.');
                conn.end();
            }).on('data', data => console.log('PM2: ' + data));
          });
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    }).connect(config);

  } catch (err) {
    console.error('Error during deployment:', err);
    sftp.end();
  }
}

deploy();
