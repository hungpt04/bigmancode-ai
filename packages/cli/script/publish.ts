#!/usr/bin/env bun
import { $ } from "bun"
import pkg from "../package.json"
import { Script } from "@opencode-ai/script"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

const isUpstream = (process.env.GH_REPO?.startsWith("anomalyco/") || !!process.env.NODE_AUTH_TOKEN) ?? false

async function published(name: string, version: string) {
  return (await $`npm view ${name}@${version} version`.nothrow()).exitCode === 0
}

async function publish(dir: string, name: string, version: string) {
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(dir)
  if (await published(name, version)) return console.log(`already published ${name}@${version}`)
  await $`bun pm pack`.cwd(dir)
  if (name.startsWith("@opencode-ai/") && !process.env.GH_REPO?.startsWith("anomalyco/")) {
    console.log(`already packed ${name}@${version} (skipping scoped package publish on fork repository)`)
    return
  }
  if (!isUpstream) {
    console.log(`already packed ${name}@${version} (skipping npm publish on fork repository)`)
    return
  }
  let attempts = 5
  while (attempts > 0) {
    try {
      await $`npm publish *.tgz --access public --tag ${Script.channel}`.cwd(dir)
      break
    } catch (error) {
      attempts--
      if (attempts === 0) {
        throw error
      }
      const delay = (5 - attempts) * 60000
      console.warn(`npm publish failed for ${name}, retrying in ${delay / 1000} seconds... (Attempts remaining: ${attempts})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

const binaries: Record<string, string> = {}
for (const filepath of new Bun.Glob("*/package.json").scanSync({ cwd: "./dist" })) {
  const item = await Bun.file(`./dist/${filepath}`).json()
  binaries[item.name] = item.version
}
console.log("binaries", binaries)
const version = Object.values(binaries)[0]

await $`mkdir -p ./dist/${pkg.name}/bin`
await $`cp ./bin/lildax.cjs ./dist/${pkg.name}/bin/lildax`
await Bun.file(`./dist/${pkg.name}/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name,
      bin: { lildax: "./bin/lildax" },
      version,
      license: pkg.license,
      repository: { type: "git", url: "git+https://github.com/anomalyco/opencode.git" },
      os: ["darwin", "linux", "win32"],
      cpu: ["arm64", "x64"],
      optionalDependencies: binaries,
    },
    null,
    2,
  ),
)

let hasError = false
for (const [name, binVersion] of Object.entries(binaries)) {
  try {
    await publish(`./dist/${name.replace("@opencode-ai/", "")}`, name, binVersion)
  } catch (error) {
    console.error(`Failed to publish binary package ${name}:`, error)
    hasError = true
  }
  await new Promise((resolve) => setTimeout(resolve, 30000))
}
try {
  await publish(`./dist/${pkg.name}`, pkg.name, version)
} catch (error) {
  console.error(`Failed to publish wrapper package ${pkg.name}:`, error)
  hasError = true
}

if (hasError) {
  process.exit(1)
}
