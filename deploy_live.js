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

    console.log('Uploading frontend/dist directory...');
    // We only need to upload images to public/images! 
    // Wait, since we rebuilt the frontend, we can upload the whole dist just to be safe, 
    // but the easiest is just syncing the public images to frontend/dist/images/bilder?
    // Actually, vite output goes to dist. Let's upload dist.
    await sftp.uploadDir(
      path.join(__dirname, 'frontend/dist'),
      `${REMOTE_BASE}/frontend/dist`
    );

    console.log('Uploading backend fix scripts...');
    await sftp.put(
      path.join(__dirname, 'backend/fix_event_images.js'),
      `${REMOTE_BASE}/backend/fix_event_images.js`
    );
    await sftp.put(
      path.join(__dirname, 'backend/remove_duplicates.js'),
      `${REMOTE_BASE}/backend/remove_duplicates.js`
    );

    await sftp.end();
    console.log('SFTP Upload complete. Connecting via SSH to run scripts...');

    const conn = new SshClient();
    conn.on('ready', () => {
      console.log('SSH connection ready. Running scripts...');
      const cmd = `cd ${REMOTE_BASE}/backend && ${NODE_BIN} fix_event_images.js && ${NODE_BIN} remove_duplicates.js`;
      
      conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Scripts finished with code ' + code);
          // Restart PM2 just in case
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
