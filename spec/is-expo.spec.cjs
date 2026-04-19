// @ts-check
const {createRequire} = require("node:module")

global.require = createRequire(__filename)

describe("is-expo", () => {
  it("returns false when expo-constants is unavailable", async () => {
    const {default: isExpo} = await import("../src/is-expo.js")

    expect(isExpo).toBe(false)
  })
})
