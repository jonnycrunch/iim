const Fs = require('fs').promises
const Path = require('path')
const explain = require('explain-error')

module.exports = async function npmInstall (ctx, mod, version, path, options) {
  const { spinner, npm } = ctx
  options = options || {}
  const moduleTitle = options.moduleTitle || mod

  spinner.start(`checking to see if ${moduleTitle}@${version} is already installed`)
  let isInstalled = false
  try {
    await Fs.stat(Path.join(path, 'node_modules', mod))
    isInstalled = true
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw explain(err, `failed to determine if ${moduleTitle} ${version} is already installed`)
    }
    await Fs.mkdir(path, { recursive: true })
  }

  spinner.text = `${isInstalled ? 'updating' : 'installing'} ${moduleTitle} ${version}`

  try {
    if (isInstalled) {
      if (options.update) {
        await npm.update(path)
      }
    } else {
      await npm.install(mod, version, path)
    }
  } catch (err) {
    spinner.fail(`failed to ${isInstalled ? 'update' : 'install'} ${moduleTitle} ${version}`)
    throw err
  }
  spinner.succeed(`${isInstalled ? 'updated' : 'installed'} ${moduleTitle} ${version}`)

  return isInstalled
}
