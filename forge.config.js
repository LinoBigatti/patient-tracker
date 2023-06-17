module.exports = {
  packagerConfig: {
    "dir": "./pkg/",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      config: {},
    },
  ],
};
