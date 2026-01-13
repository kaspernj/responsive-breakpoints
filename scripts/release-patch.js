import {execSync} from "node:child_process"
import {readFileSync} from "node:fs"

/**
 * @param {string} command Command to execute in the release flow.
 * @returns {void} No return value.
 */
const run = (command) => {
  execSync(command, {stdio: "inherit"})
}

/**
 * @returns {string} Current package version.
 */
const currentVersion = () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)))

  return packageJson.version
}

/**
 * @returns {void} No return value.
 */
const ensureNpmLogin = () => {
  try {
    execSync("npm whoami", {stdio: "ignore"})
  } catch {
    run("npm login")
  }
}

run("npm version patch --no-git-tag-version")

const version = currentVersion()

run("git add -A")
run(`git commit -m "Release v${version}"`)
run("git push origin master")

ensureNpmLogin()
run("npm publish")
