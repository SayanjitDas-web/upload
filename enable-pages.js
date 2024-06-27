const axios = require('axios');
require('dotenv').config();
const { exec } = require('child_process');

const repoOwner = 'SayanjitDas-web';
const repoName = 'upload';
const mainBranch = 'main'; // or 'master', depending on your default branch

const config = {
  headers: {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

// Function to check if a branch exists
const branchExists = async (branch) => {
  try {
    await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/branches/${branch}`, config);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
};

// Function to create a branch from the main branch
const createBranch = async (newBranch, fromBranch) => {
  try {
    const { data: fromBranchData } = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/ref/heads/${fromBranch}`,
      config
    );

    await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`,
      {
        ref: `refs/heads/${newBranch}`,
        sha: fromBranchData.object.sha
      },
      config
    );
    console.log(`Branch '${newBranch}' created from '${fromBranch}'`);
  } catch (error) {
    console.error('Error creating branch:', error.response.data);
  }
};

// Function to check if GitHub Pages is enabled
const isPagesEnabled = async () => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/pages`, config);
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
};

// Function to enable GitHub Pages
const enablePages = async () => {
  try {
    // Check if GitHub Pages is already enabled
    if (await isPagesEnabled()) {
      console.log('GitHub Pages is already enabled.');
      return;
    }

    // Ensure the gh-pages branch exists
    if (!await branchExists('gh-pages')) {
      await createBranch('gh-pages', mainBranch);
    }

    // Set the GitHub Pages source to the 'gh-pages' branch
    const response = await axios.post(
      `https://api.github.com/repos/${repoOwner}/${repoName}/pages`,
      {
        source: {
          branch: 'gh-pages'
        }
      },
      config
    );
    console.log('GitHub Pages enabled:', response.data);
  } catch (error) {
    console.error('Error enabling GitHub Pages:', error.response.data);
  }
};

// Function to get the file SHA
const getFileSha = async (filePath) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=gh-pages`,
      config
    );
    return response.data.sha;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`File '${filePath}' does not exist.`);
      return null;
    }
    throw error;
  }
};

// Function to delete a file from the gh-pages branch
const deleteFile = async (filePath) => {
  try {
    const fileSha = await getFileSha(filePath);

    if (!fileSha) {
      console.log(`File '${filePath}' not found.`);
      return;
    }

    await axios.delete(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        headers: config.headers,
        data: {
          message: `Delete ${filePath}`,
          sha: fileSha,
          branch: 'gh-pages'
        }
      }
    );
    console.log(`File '${filePath}' deleted successfully.`);
  } catch (error) {
    console.error('Error deleting file:', error.response.data);
  }
};

// Example usage: delete a file
const filePath = "images/SipTon.png" // Replace with the path to your file
deleteFile(filePath);

// Function to commit and push changes
const commitAndPush = (message) => {
  try {
    exec('git add .');
    exec(`git commit -m "${message}"`);
    exec('git push origin gh-pages'); // Replace with your branch name
    console.log('Changes committed and pushed successfully.');
  } catch (error) {
    console.error('Error committing and pushing changes:', error);
  }
};

commitAndPush("file deleted")