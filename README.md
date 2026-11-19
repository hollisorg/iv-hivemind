# IV Hivemind

IV Hivemind floats over your desktop. Its eye sits in the middle with your IV apps around it (Studio, Signal,
Outreach, Chat, Voice and Downloader): click one to open it, or **Get** to install it. It carries your
business profiles and memory between the apps, keeps track of **handoffs** (a brief from IV Outreach becomes a
project in IV Studio, and the finished picture or video becomes an unapproved post in IV Signal), and its
**chat** works in those apps for you through your own Claude Code or Codex. You see the app work, and
anything that needs your OK waits for you.

Windows 10 or 11, 64-bit.

**[Download `IV-Hivemind-Setup.exe`](https://github.com/hollisorg/iv-hivemind-releases/releases/latest/download/IV-Hivemind-Setup.exe)**

Installers and updates are published from
[iv-hivemind-releases](https://github.com/hollisorg/iv-hivemind-releases). Hivemind updates itself from there,
with no account or sign-in. The gear button shows your version, with **Check for updates**. Your data is kept in
`%APPDATA%\Hivemind`; the profiles and memory it shares with the other IV apps are in `%APPDATA%\IV Workspace`.

## Build it yourself

You need Node.js 24 on Windows.

```
npm ci
node node_modules/electron/install.js   # npm 11 skips Electron's install script
npm test
npm run dev     # run from source
npm run dist    # installer in dist/
```

## Where things are

- `main/`: the Electron main process (overlay window, chat, handoffs, installs, memory, updates)
- `mcp/`: the tool server Hivemind's chat gives to Claude Code or Codex
- `preload/`, `renderer/`: the window
- `shared/`: files shared with [IV Outreach](https://github.com/hollisorg/iv-outreach), including the IV
  workspace contract every IV app uses. Outreach is where they're changed; `npm run check:shared -- <path to an
  iv-outreach checkout>` shows whether the copies here still match (add `--update` to copy them over).
- `test/`: `npm test`

Until 2026-11-19 Hivemind lived in the IV Outreach repo under `apps/hivemind`; its history came with it.

## Licence

MIT. See [LICENSE](LICENSE). The fonts in `shared/` are under the SIL Open Font License (`shared/licenses/`).
