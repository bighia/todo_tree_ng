#!/usr/bin/env node

/**
 * Suppress Node.js deprecation warnings from npm dependencies
 * These warnings are not from our extension code
 * This wrapper is used in npm scripts that would otherwise show these warnings
 */

process.env.NODE_NO_DEPRECATION = "1";

// You can use this script in npm package.json like:
// "scripts": { "compile": "node suppress-warnings.js esbuild.js" }
