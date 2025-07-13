// Suppress monitoring errors from the Entitlements Client
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let suppressionActive = false;

function shouldSuppressMessage(args) {
  if (!suppressionActive) return false;
  
  const message = args.join(' ');
  return message.includes('Cannot read properties of undefined (reading \'monitoring\')') ||
         message.includes('TypeError: Cannot read properties of undefined');
}

function activateErrorSuppression() {
  suppressionActive = true;
  
  console.error = function(...args) {
    if (!shouldSuppressMessage(args)) {
      originalConsoleError.apply(console, args);
    }
  };
  
  console.warn = function(...args) {
    if (!shouldSuppressMessage(args)) {
      originalConsoleWarn.apply(console, args);
    }
  };
}

function deactivateErrorSuppression() {
  suppressionActive = false;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}

module.exports = {
  activateErrorSuppression,
  deactivateErrorSuppression
};