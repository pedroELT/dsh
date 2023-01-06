#!/usr/bin/env node
const Dockerode = require('dockerode');
const { edit } = require('external-editor')
const { writeFileSync, readFileSync } = require('fs')


const docker = new Dockerode({ socketPath: '/var/run/docker.sock' })

const conf = require('./configuration.json')

const debug = process.env.DSH_DEBUG

const wait = (stream) => {
  return new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res), (data) => debug ? console.debug(data.status): '');
    });
}

const pullImage = (cmdImg) => {
  return docker.createImage({ fromImage: cmdImg })
}

const run = async (imgCmd, cmdArgs) => {
  try {
    const cmd = await docker.run(imgCmd, cmdArgs, process.stdout, {
      WorkingDir: '/workspace',
      Env: Object.keys(process.env).filter(key => !conf.blacklistEnv.reduce((reducer, blackKey ) => { reducer = reducer || key.includes(blackKey); return reducer; }, false)).map(key => `${key}=${process.env[key]}`),
      HostConfig: {
        Binds: [ `${process.cwd()}:/workspace`, ...(conf.volumes ? conf.volumes : []) ]
      }
    })
    if (debug) console.debug('dsh process', cmd[0].StatusCode ? 'failed' : 'succeeded')
    await cmd[1].remove({ force: true })
  } catch (err) {
    if (debug) console.debug('dsh process', 'failed', err.message)
  }
}

const configure = () => {
  writeFileSync(__dirname + '/configuration.json', edit(readFileSync(__dirname + '/configuration.json').toString()));
}

const search = async (img) => {
  const imgs = await docker.searchImages({ term: img })
  console.table(imgs.sort(( a, b) => a.star_count - b.star_count).reverse().map(img => ({ name: img.name, stars: img.star_count, description: img.description })))
}

(async () => {
  const argv = process.argv.slice(2)
  let cmdImg = argv[0]
  const cmd = argv.slice(1)

  switch(cmdImg) {
    case '':
      console.error('image or command is required')
      break;
    case '-h':
    case '--help':
      console.log('Docker Shell')
      console.log('This shell run commands on docker container using host env var ( exluding configure key words) and bind current folder')
      console.log('Additional blacklisted env var words, command binnary to docker image mapping and additionnal volumes can be configured')
      console.log('Usage:', 'dsh <img or command> [command]')
      console.log('Example:', 'dsh alpine ls .')
      console.log('Example:', 'dsh ls .')
      console.log('Configure:', 'dsh configure')
      console.log('Search for images:', 'dsh search <image_word>')
      break;
    case 'configure': 
      configure()
      break;
    case 'search': 
      await search(cmd[0])
      break;
    default: 
      if (conf.images[cmdImg]) {
        cmd.unshift(cmdImg)
        cmdImg = conf.images[cmd[0]]
      }
      await wait(await pullImage(cmdImg))
      await run(cmdImg, cmd)
  }
})()
