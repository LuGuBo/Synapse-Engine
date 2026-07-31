#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Helper function to log formatted messages in English
function log(msg) {
  console.log(`[RELEASE] ${msg}`);
}

function errorLog(msg) {
  console.error(`[RELEASE ERROR] ❌ ${msg}`);
}

// 1. Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
let githubPat = process.env.GITHUB_PAT || process.env.GH_TOKEN;

if (fs.existsSync(envPath)) {
  log('Loading configurations from local .env file...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GITHUB_PAT=["']?([^"'\r\n]+)["']?/);
  if (match) {
    githubPat = match[1];
  }
}

if (!githubPat) {
  errorLog('GITHUB_PAT is not configured in the environment or .env file.');
  process.exit(1);
}

// 2. Obtain current version from package.json
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  errorLog('package.json not found in workspace root.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;
log(`Detected target release version: v${version}`);

// 3. Extract release notes from CHANGELOG.md
const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
let releaseBody = `Official release for version v${version} of Synapse Engine.`;

if (fs.existsSync(changelogPath)) {
  log('Extracting release notes from CHANGELOG.md...');
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const versionEscaped = version.replace(/\./g, '\\.');
  const regex = new RegExp(`##\\s*\\[?${versionEscaped}\\]?(?:[\\s\\S]*?)(?=\\n##|$)`);
  const match = changelog.match(regex);
  if (match) {
    // Strip header '## [X.Y.Z]' to extract description body
    releaseBody = match[0].replace(/##\s*\[?[\d\.]+\]?.*?\n/, '').trim();
    log('Release notes extracted successfully.');
  } else {
    log(`Warning: Version notes for v${version} not found in CHANGELOG.md. Falling back to default description.`);
  }
} else {
  log('Warning: CHANGELOG.md not found in root. Falling back to default description.');
}

// 4. Run Jest unit test suite quality gate
try {
  log('Executing unit test suite quality gate...');
  execSync('npm test', { stdio: 'inherit' });
  log('All quality gate tests passed successfully.');
} catch (e) {
  errorLog('Unit test suite failed. Aborting release for integrity protection.');
  process.exit(1);
}

// 5. Ensure git working directory is clean
try {
  log('Auditing Git modified working directory status...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (gitStatus) {
    log('Uncommitted changes detected. Creating automated release preparation commit...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "chore(release): prepare release v${version}"`, { stdio: 'inherit' });
    log('Release preparation commit created successfully.');
  } else {
    log('Clean workspace repository; no residual commit required.');
  }
} catch (e) {
  errorLog(`Failed to prepare Git commit: ${e.message}`);
  process.exit(1);
}

// 6. Verify if local or remote tag exists
const tag = `v${version}`;
try {
  log(`Checking if tag ${tag} exists locally...`);
  const localTags = execSync('git tag', { encoding: 'utf8' });
  if (localTags.split('\n').includes(tag)) {
    log(`Tag ${tag} exists locally. Deleting previous local tag...`);
    execSync(`git tag -d ${tag}`, { stdio: 'inherit' });
  }
} catch (e) {
  errorLog(`Failed to inspect Git tags: ${e.message}`);
}

// 7. Create local Git tag
try {
  log(`Creating local tag ${tag}...`);
  execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: 'inherit' });
  log(`Tag ${tag} created locally.`);
} catch (e) {
  errorLog(`Failed to create local Git tag: ${e.message}`);
  process.exit(1);
}

// 8. Push commits and tags to GitHub
try {
  log('Pushing master branch to origin remote...');
  execSync('git push origin master', { stdio: 'inherit' });
  log(`Pushing tag ${tag} to origin remote...`);
  execSync(`git push origin ${tag} --force`, { stdio: 'inherit' });
  log('Git push executed successfully.');
} catch (e) {
  errorLog(`Failed to push to Git origin: ${e.message}`);
  process.exit(1);
}

// 9. Create GitHub Release entry via REST API using native HTTPS
log('Initiating HTTP request for GitHub Release creation...');
const repoOwner = 'LuGuBo';
const repoName = 'Synapse-Engine';

const postData = JSON.stringify({
  tag_name: tag,
  target_commitish: 'master',
  name: `v${version} - Multi-Model Connectors, Intelligent Routing & AST Architecture`,
  body: releaseBody,
  draft: false,
  prerelease: false
});

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${repoOwner}/${repoName}/releases`,
  method: 'POST',
  headers: {
    'Authorization': `token ${githubPat}`,
    'User-Agent': 'Synapse-Engine-Release-Agent',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/vnd.github+json'
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      const releaseInfo = JSON.parse(responseData);
      log(`🎉 Official Release successfully created on GitHub!`);
      log(`🔗 Release URL: ${releaseInfo.html_url}`);
      process.exit(0);
    } else {
      log(`----------------------------------------------------------------------`);
      log(`⚠️  Note: Commits and tag '${tag}' pushed to GitHub successfully.`);
      log(`⚠️  However, REST API Release creation returned status code: ${res.statusCode}.`);
      log(`----------------------------------------------------------------------`);
      process.exit(0);
    }
  });
});

req.on('error', (e) => {
  log(`----------------------------------------------------------------------`);
  log(`⚠️  Note: Commits and tag '${tag}' pushed to GitHub successfully.`);
  log(`⚠️  HTTP API error encountered: ${e.message}`);
  log(`----------------------------------------------------------------------`);
  process.exit(0);
});

req.write(postData);
req.end();
