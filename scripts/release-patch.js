// @ts-check
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
 * @param {string} command Command to execute and capture stdout from.
 * @returns {string} Trimmed stdout.
 */
const output = (command) => {
  return execSync(command, {encoding: "utf8"}).trim()
}

/**
 * @returns {string} Current package version.
 */
const currentVersion = () => {
  const packageJsonPath = decodeURIComponent(new URL("../package.json", import.meta.url).pathname)
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))

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

/**
 * @returns {void} No return value.
 */
const ensureCleanWorktree = () => {
  if (output("git status --short")) {
    throw new Error("Release requires a clean git worktree")
  }
}

ensureCleanWorktree()
run("git fetch origin")
run("git checkout master")
run("git merge --ff-only origin/master")
run("npm version patch --no-git-tag-version")
run("npm run build")

const version = currentVersion()

run("git add -A")
run(`git commit -m "Release v${version}"`)
run("git push origin master")

ensureNpmLogin()
run("npm publish")
