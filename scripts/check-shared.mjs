// Compares Hivemind's shared/ copies with an IV Outreach checkout, ignoring line endings.
//   npm run check:shared -- C:\path\to\iv-outreach            report differences
//   npm run check:shared -- C:\path\to\iv-outreach --update   copy Outreach's versions over Hivemind's
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SHARED } from './shared-files.mjs'

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const outreach = args.find(a => !a.startsWith('--'))
const update = args.includes('--update')
if (!outreach) throw Error('Pass the path to an IV Outreach checkout.')
const pkg = JSON.parse(readFileSync(join(outreach, 'package.json'), 'utf8'))
if (pkg.productName !== 'IV Outreach') throw Error(`${outreach} isn't an IV Outreach checkout.`)

const text = /\.(js|mjs|txt)$/
const read = (file) => {
  const data = readFileSync(file)
  return text.test(file) ? Buffer.from(data.toString('utf8').replace(/\r\n/g, '\n')) : data
}
let different = 0
for (const [mine, theirs] of SHARED) {
  const a = join(here, mine), b = join(outreach, theirs)
  if (!existsSync(b)) { console.log(`missing in Outreach: ${theirs}`); different++; continue }
  if (existsSync(a) && read(a).equals(read(b))) continue
  different++
  if (update) { mkdirSync(dirname(a), { recursive: true }); copyFileSync(b, a); console.log(`updated ${mine}`) }
  else console.log(`differs: ${mine} (Outreach ${theirs})`)
}
console.log(different ? `${different} file(s) ${update ? 'updated' : 'differ'}.` : `All ${SHARED.length} shared files match Outreach.`)
process.exitCode = different && !update ? 1 : 0
