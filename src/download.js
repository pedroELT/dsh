#!/usr/bin/env node
const { writeFileSync, readFileSync } = require('fs');
(async () => {
  let actual
  try {
    actual = JSON.parse(readFileSync(__dirname + '/configuration.json').toString())
  } catch (err) {

  }
  const downloadedResp = await fetch(process.argv[2])
  const downloaded = await downloadedResp.json()
  if (actual) {
    downloaded.blacklistEnv = [...new Set([...actual.blacklistEnv, ...downloaded.blacklistEnv])]
    downloaded.volumes = actual.volumes
    downloaded.images = { ...actual.images, ...downloaded.images }
  }
  writeFileSync(__dirname + '/configuration.json', JSON.stringify(downloaded, null, 4));
})()
