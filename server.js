const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

app.post('/trigger-automation', async (req, res) => {
  try {
    console.log('Running deploy...');
    await runCommand('npm run deploy');
    console.log('Running enable-pages...');
    await runCommand('npm run enable-pages');
    console.log('Automation complete.');
    res.send('Automation complete.');
  } catch (error) {
    console.error('Automation failed:', error);
    res.status(500).send('Automation failed.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
