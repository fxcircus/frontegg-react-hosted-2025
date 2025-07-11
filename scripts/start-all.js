#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

// Check if a command exists
function commandExists(cmd) {
  try {
    require('child_process').execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Check if Docker is running
async function isDockerRunning() {
  return new Promise((resolve) => {
    const docker = spawn('docker', ['info'], { stdio: 'ignore' });
    docker.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Wait for a URL to be accessible
async function waitForUrl(url, maxAttempts = 30, delay = 1000) {
  const http = require('http');
  const https = require('https');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve();
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        }).on('error', reject);
      });
      return true;
    } catch {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

// Main startup sequence
async function startAll() {
  console.log(`${colors.bright}${colors.green}🚀 Starting Frontegg Demo Application${colors.reset}\n`);
  
  // Step 1: Check prerequisites
  logStep('1/5', 'Checking prerequisites...');
  
  if (!commandExists('docker')) {
    log('❌ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop', colors.red);
    process.exit(1);
  }
  
  if (!commandExists('npm')) {
    log('❌ npm is not installed. Please install Node.js from https://nodejs.org', colors.red);
    process.exit(1);
  }
  
  // Check if .env files exist
  const frontendEnv = path.join(__dirname, '../frontend/.env');
  const backendEnv = path.join(__dirname, '../backend/.env');
  
  if (!fs.existsSync(frontendEnv)) {
    log('❌ frontend/.env file not found. Please create it from frontend/.env.example', colors.red);
    process.exit(1);
  }
  
  if (!fs.existsSync(backendEnv)) {
    log('❌ backend/.env file not found. Please create it from backend/.env.example', colors.red);
    process.exit(1);
  }
  
  log('✅ All prerequisites met', colors.green);
  
  // Step 2: Check Docker status
  logStep('2/5', 'Checking Docker status...');
  
  const dockerRunning = await isDockerRunning();
  if (!dockerRunning) {
    log('⚠️  Docker is not running. Please start Docker Desktop.', colors.yellow);
    log('   The app will start without ReBAC features (using mock).', colors.yellow);
    
    // Start without Docker
    logStep('3/5', 'Skipping Docker setup...');
    logStep('4/5', 'Starting backend with mock ReBAC...');
    logStep('5/5', 'Starting frontend and backend...');
    
    process.env.USE_MOCK_REBAC = 'true';
    await runCommand('npm', ['run', 'dev'], { cwd: path.join(__dirname, '..') });
    return;
  }
  
  log('✅ Docker is running', colors.green);
  
  // Step 3: Start Docker containers
  logStep('3/5', 'Starting Docker containers...');
  
  try {
    await runCommand('npm', ['run', 'docker:up'], { cwd: path.join(__dirname, '..') });
    log('✅ Docker containers started', colors.green);
  } catch (error) {
    log('⚠️  Failed to start Docker containers', colors.yellow);
    log('   Continuing without ReBAC features...', colors.yellow);
    process.env.USE_MOCK_REBAC = 'true';
  }
  
  // Step 4: Wait for Entitlements Agent
  if (!process.env.USE_MOCK_REBAC) {
    logStep('4/5', 'Waiting for Entitlements Agent to be ready...');
    
    const agentReady = await waitForUrl('http://localhost:8181/health', 15, 2000);
    if (agentReady) {
      log('✅ Entitlements Agent is ready', colors.green);
    } else {
      log('⚠️  Entitlements Agent not responding. ReBAC features may not work.', colors.yellow);
      log('   To fix: Check Docker logs with "npm run docker:logs"', colors.yellow);
    }
  }
  
  // Step 5: Start the application
  logStep('5/5', 'Starting frontend and backend...');
  
  console.log(`\n${colors.bright}📦 Application URLs:${colors.reset}`);
  console.log(`   Frontend: ${colors.blue}http://localhost:3000${colors.reset}`);
  console.log(`   Backend:  ${colors.blue}http://localhost:5000${colors.reset}`);
  console.log(`   Health:   ${colors.blue}http://localhost:5000/api/health${colors.reset}\n`);
  
  // Run the dev command which starts both frontend and backend
  await runCommand('npm', ['run', 'dev'], { cwd: path.join(__dirname, '..') });
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
  
  try {
    await runCommand('npm', ['run', 'docker:down'], { 
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore'
    });
    console.log(`${colors.green}✅ Cleanup complete${colors.reset}`);
  } catch {
    // Ignore errors during cleanup
  }
  
  process.exit(0);
});

// Run the startup sequence
startAll().catch((error) => {
  log(`\n❌ Startup failed: ${error.message}`, colors.red);
  process.exit(1);
});