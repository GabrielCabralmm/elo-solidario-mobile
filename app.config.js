const { execSync } = require('child_process');

function obterCommit() {
  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) {
    return process.env.EAS_BUILD_GIT_COMMIT_HASH;
  }
  if (process.env.RENDER_GIT_COMMIT) {
    return process.env.RENDER_GIT_COMMIT;
  }
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'desconhecido';
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    commitHash: obterCommit(),
    apiJavaUrl: process.env.EXPO_PUBLIC_API_JAVA_URL ?? 'https://elo-solidario-java.onrender.com',
    apiDotnetUrl:
      process.env.EXPO_PUBLIC_API_DOTNET_URL ?? 'https://elo-solidario-dotnet.onrender.com',
  },
});
