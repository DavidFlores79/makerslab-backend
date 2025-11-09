#!/usr/bin/env node

/**
 * Pre-deployment checklist for Render
 * This script checks if all required configurations are in place
 */

const fs = require('fs');
const path = require('path');

// Ensure we're working from the project root
const projectRoot = path.join(__dirname, '..');
process.chdir(projectRoot);

console.log('🔍 Checking Render deployment readiness...\n');
console.log(`📁 Project root: ${projectRoot}\n`);

const checks = {
  passed: [],
  warnings: [],
  failed: []
};

// Check 1: package.json exists and has start script
try {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts.start) {
    checks.passed.push('✅ package.json has "start" script');
  } else {
    checks.failed.push('❌ package.json missing "start" script');
  }
} catch (error) {
  checks.failed.push('❌ package.json not found');
}

// Check 2: render.yaml exists
if (fs.existsSync(path.join(projectRoot, 'render.yaml'))) {
  checks.passed.push('✅ render.yaml configuration file exists');
} else {
  checks.failed.push('❌ render.yaml not found');
}

// Check 3: .env.example exists (for reference)
if (fs.existsSync(path.join(projectRoot, '.env.example'))) {
  checks.passed.push('✅ .env.example exists for environment variable reference');
} else {
  checks.warnings.push('⚠️  .env.example not found (recommended for documentation)');
}

// Check 4: .gitignore exists and ignores .env
try {
  const gitignore = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf8');
  if (gitignore.includes('.env')) {
    checks.passed.push('✅ .gitignore properly excludes .env file');
  } else {
    checks.warnings.push('⚠️  .env should be in .gitignore');
  }
} catch (error) {
  checks.warnings.push('⚠️  .gitignore not found');
}

// Check 5: Main entry point exists
if (fs.existsSync(path.join(projectRoot, 'app.js'))) {
  checks.passed.push('✅ Main entry point (app.js) exists');
} else {
  checks.failed.push('❌ app.js not found');
}

// Check 6: Database config exists
if (fs.existsSync(path.join(projectRoot, 'database', 'config.js'))) {
  checks.passed.push('✅ Database configuration file exists');
} else {
  checks.warnings.push('⚠️  Database configuration file not found');
}

// Check 7: Models directory exists
if (fs.existsSync(path.join(projectRoot, 'models'))) {
  checks.passed.push('✅ Models directory exists');
} else {
  checks.failed.push('❌ Models directory not found');
}

// Print results
console.log('📋 Deployment Readiness Report:\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED:');
  checks.passed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  checks.warnings.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED:');
  checks.failed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

// Summary
console.log('📊 Summary:');
console.log(`   Passed: ${checks.passed.length}`);
console.log(`   Warnings: ${checks.warnings.length}`);
console.log(`   Failed: ${checks.failed.length}\n`);

if (checks.failed.length === 0) {
  console.log('🎉 Your application is ready for Render deployment!');
  console.log('\n📖 Next steps:');
  console.log('   1. Push your code to GitHub/GitLab');
  console.log('   2. Go to https://dashboard.render.com/');
  console.log('   3. Create a new Blueprint using your repository');
  console.log('   4. Set your environment variables (especially MONGODB)');
  console.log('   5. Deploy!\n');
  console.log('📚 For detailed instructions, see RENDER_DEPLOYMENT.md\n');
  process.exit(0);
} else {
  console.log('⚠️  Please fix the failed checks before deploying.\n');
  process.exit(1);
}
