#!/usr/bin/env node
const { writeFileSync, readFileSync } = require('fs');
const { homedir } = require('os')
const got = require('got');

(async () => {
  let actual
  try {
    actual = JSON.parse(readFileSync(homedir() + '/.dsh.json').toString())
  } catch (err) {

  }
  const downloaded = await got("https://github.com/pedroELT/dsh/raw/main/toDownload.json").json()
  if (actual) {
    downloaded.blacklistEnv = [...new Set([...actual.blacklistEnv, ...downloaded.blacklistEnv])]
    downloaded.volumes = actual.volumes
    downloaded.images = { ...actual.images, ...downloaded.images }
  }
  writeFileSync(homedir() + '/.dsh.json', JSON.stringify(downloaded, null, 4));
})()
