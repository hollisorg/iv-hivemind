// Publishes the version in package.json to hollisorg/iv-hivemind-releases, where installed copies update from.
//   npm run release                         checks everything and builds, publishes nothing
//   npm run release -- --publish NOTES.md   also creates the GitHub release with those notes
// It refuses with uncommitted changes, failing tests, or a version that's already released.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RELEASES = 'hollisorg/iv-hivemind-releases'
// Only npm needs the shell on Windows (it's npm.cmd). git and gh run directly, so arguments with spaces, like the
// release title, reach them as one argument; through the shell they were split into words.
const shell = (cmd) => process.platform === 'win32' && cmd === 'npm'
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit', shell: shell(cmd), ...opts })
const read = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', shell: shell(cmd) }).trim()

const args = process.argv.slice(2)
const publishAt = args.indexOf('--publish')
const notes = publishAt >= 0 ? args[publishAt + 1] : null
if (publishAt >= 0 && (!notes || !existsSync(notes))) throw Error('--publish needs a release notes file.')

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const tag = `v${version}`
if (read('git', ['status', '--porcelain'])) throw Error('Commit or put aside your changes first.')
const released = read('gh', ['release', 'list', '-R', RELEASES, '--limit', '200', '--json', 'tagName', '-q', '.[].tagName']).split(/\s+/)
if (released.includes(tag)) throw Error(`${tag} is already released on ${RELEASES}. Raise the version in package.json.`)

run('npm', ['test'])
run('npm', ['run', 'dist'])
const files = ['IV-Hivemind-Setup.exe', 'IV-Hivemind-Setup.exe.blockmap', 'latest.yml'].map(f => join(root, 'dist', f))
for (const f of files) if (!existsSync(f)) throw Error(`Build is missing ${f}`)
const feed = readFileSync(files[2], 'utf8')
if (!feed.includes(`version: ${version}`)) throw Error(`dist/latest.yml isn't for ${version}.`)

if (!notes) {
  console.log(`\nBuilt IV Hivemind ${version}. Nothing published. To publish: npm run release -- --publish NOTES.md`)
  process.exit(0)
}
run('gh', ['release', 'create', tag, '-R', RELEASES, '--title', `IV Hivemind ${version}`, '--notes-file', notes, ...files])
console.log(`\nPublished IV Hivemind ${version} to ${RELEASES}. Installed copies pick it up within six hours.`)
