#!/usr/bin/env node
/**
 * tdd-gate.js
 * Enforces Test-Driven Development (TDD) validation gate before commits.
 * Performs exact name-mapping verification for staged production files.
 * Ensures corresponding test files are either staged or already tracked in the repository.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getStagedFiles() {
  try {
    return execSync('git diff --cached --name-only --diff-filter=ACMR')
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(f => f.trim().replace(/\\/g, '/'));
  } catch (err) {
    console.error('❌ Error executing git diff. Are you in a git repository?', err.message);
    process.exit(1);
  }
}

function getTrackedFiles() {
  try {
    return new Set(
      execSync('git ls-files')
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(f => f.trim().replace(/\\/g, '/'))
    );
  } catch (err) {
    console.error('❌ Error executing git ls-files.', err.message);
    process.exit(1);
  }
}

function main() {
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('✅ No staged files detected. Skipping TDD gate.');
    process.exit(0);
  }

  const trackedFiles = getTrackedFiles();

  // Filter production files (starting with src/, lib/, or app/)
  const prodFiles = stagedFiles.filter(f => f.startsWith('src/') || f.startsWith('lib/') || f.startsWith('app/'));

  // Verify dynamic validation_status in state.json if editing production files
  if (prodFiles.length > 0) {
    const statePath = path.resolve(process.cwd(), '.agents/state.json');
    if (fs.existsSync(statePath)) {
      try {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        const status = state.validation_status || {};
        
        // Enforce state machine compliance for DEVELOPER and QA stages
        if (state.active_persona === 'DEVELOPER' || state.active_persona === 'QA') {
          if (!status.tdd_test_executed || status.tdd_test_failed || !status.implementation_passed) {
            console.error('\n❌ TDD Gate Violation: State validation status is incomplete.');
            console.error('   Expected state.json validation_status requirements:');
            console.error(`   - tdd_test_executed:  true  (Current: ${status.tdd_test_executed})`);
            console.error(`   - tdd_test_failed:    false (Current: ${status.tdd_test_failed})`);
            console.error(`   - implementation_passed: true  (Current: ${status.implementation_passed})`);
            console.error('\n   Ensure the QA or Developer persona runs tests and registers pass flags in state.json before committing.\n');
            process.exit(1);
          }
        }
      } catch (err) {
        console.warn(`⚠️ Warning: Could not parse state.json for TDD check: ${err.message}. Skipping status check.`);
      }
    }
  }

  for (const prodFile of prodFiles) {
    const fileName = path.basename(prodFile);
    const ext = path.extname(prodFile).slice(1);
    const baseName = path.basename(prodFile, path.extname(prodFile));

    const candidates = [];
    const testDirs = ['tests', 'test', 'src', 'lib', 'app'];
    
    const relativeDir = path.dirname(prodFile).replace(/^(src|lib|app)/, '');

    for (const dir of testDirs) {
      const subDirPath = `${dir}/${relativeDir}`.replace(/\/+/g, '/');
      candidates.push(`${subDirPath}/${baseName}.test.${ext}`);
      candidates.push(`${subDirPath}/${baseName}.spec.${ext}`);
      
      candidates.push(`${dir}/${baseName}.test.${ext}`);
      candidates.push(`${dir}/${baseName}.spec.${ext}`);
    }

    const exactDir = path.dirname(prodFile);
    candidates.push(`${exactDir}/${baseName}.test.${ext}`);
    candidates.push(`${exactDir}/${baseName}.spec.${ext}`);

    const uniqueCandidates = Array.from(new Set(candidates.map(p => p.replace(/\\/g, '/'))));

    const hasStagedTest = stagedFiles.some(f => uniqueCandidates.includes(f));
    const testExistsInRepo = uniqueCandidates.some(pat => trackedFiles.has(pat));

    if (!hasStagedTest && !testExistsInRepo) {
      console.error(`\n❌ TDD Gate Violation: No test file found for staged production file: ${prodFile}`);
      console.error(`   Expected one of the following to be staged or tracked in Git:`);
      for (const pat of uniqueCandidates) {
        console.error(`   - ${pat}`);
      }
      console.error(`\n   BMAD Harness requires a corresponding test to be staged or already tracked before committing.\n`);
      process.exit(1);
    }
  }

  console.log('✅ Staged changes passed TDD validation.');
  process.exit(0);
}

main();
