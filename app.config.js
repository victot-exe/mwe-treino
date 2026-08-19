module.exports = ({ config }) => {
  const packageJson = require("./package.json");
  return {
    ...config,
    version: packageJson.version,
  };
};
