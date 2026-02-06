const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Ensure Metro resolves the client directory as a root
config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, "node_modules"),
];

// Add the alias support for Metro if needed, though Babel usually handles it
// But we want to make sure Metro sees the client folder
config.resolver.sourceExts.push("mjs");

module.exports = config;
