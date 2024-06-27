const axios = require('axios');
require('dotenv').config();

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

// Function to enable GitHub Pages
const enablePages = async () => {
  try {
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

enablePages();