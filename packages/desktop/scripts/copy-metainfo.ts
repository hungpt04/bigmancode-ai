import { resolveChannel } from "./utils"

const arg = process.argv[2]
const channel = arg === "dev" || arg === "beta" || arg === "prod" ? arg : resolveChannel()

const appId = channel === "prod" ? "ai.bigmancode.desktop" : `ai.bigmancode.desktop.${channel}`
const productName = channel === "prod" ? "BIGMAN Code" : `BIGMAN Code ${channel.charAt(0).toUpperCase() + channel.slice(1)}`
const summary = `Open source AI coding agent${channel !== "prod" ? ` (${channel})` : ""}`

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>${appId}</id>

  <metadata_license>CC0-1.0</metadata_license>
  <project_license>MIT</project_license>

  <name>${productName}</name>
  <summary>${summary}</summary>

  <developer id="ly.anoma">
    <name>BigMan Code</name>
  </developer>

  <description>
    <p>
      BIGMAN Code is an open source agent that helps you write and run code with any AI model.
    </p>
  </description>

  <launchable type="desktop-id">${appId}.desktop</launchable>

  <content_rating type="oars-1.1" />

  <url type="bugtracker">https://github.com/hungpt04/bigmancode-ai/issues</url>
  <url type="homepage">https://github.com/hungpt04/bigmancode-ai</url>
  <url type="vcs-browser">https://github.com/hungpt04/bigmancode-ai</url>

  <screenshots>
    <screenshot type="default">
      <image>https://raw.githubusercontent.com/hungpt04/bigmancode-ai/dev/screenshot-uk.png</image>
    </screenshot>
  </screenshots>
</component>
`

await Bun.write(`resources/${appId}.metainfo.xml`, xml)
console.log(`Generated metainfo for ${channel} at resources/${appId}.metainfo.xml`)
