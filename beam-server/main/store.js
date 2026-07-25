/*
 * Settings persistence — a plain JSON file in Electron's userData dir rather
 * than a dependency like electron-store: the schema here (friendlyName,
 * port, folders, launchAtLogin) is small and stable enough that hand-rolling
 * load/save is less code than adding and configuring another package.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

function settingsFile(app) {
  return path.join(app.getPath('userData'), 'beam-server-settings.json');
}

function defaults() {
  const host = os.hostname().replace(/\.local$/i, '');
  return {
    friendlyName: `${host}’s Beam Server`,
    port: 8200,
    folders: [], // [{ path, label }]
    launchAtLogin: false,
  };
}

function load(app) {
  try {
    const raw = JSON.parse(fs.readFileSync(settingsFile(app), 'utf8'));
    return { ...defaults(), ...raw };
  } catch (e) {
    return defaults();
  }
}

function save(app, settings) {
  fs.writeFileSync(settingsFile(app), JSON.stringify(settings, null, 2));
}

module.exports = { load, save, defaults };
