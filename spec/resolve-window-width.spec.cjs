// @ts-check
describe("resolveWindowWidthFromSources", () => {
  it("uses window width when not in Expo", async () => {
    const {resolveWindowWidthFromSources} = await import("../src/resolve-window-width.js")

    const result = resolveWindowWidthFromSources({
      dimensions: {get: () => ({width: 640})},
      isExpo: false,
      windowObject: {innerWidth: 900}
    })

    expect(result).toBe(900)
  })

  it("falls back to Dimensions when window is unavailable", async () => {
    const {resolveWindowWidthFromSources} = await import("../src/resolve-window-width.js")

    const result = resolveWindowWidthFromSources({
      dimensions: {get: () => ({width: 720})},
      isExpo: false
    })

    expect(result).toBe(720)
  })

  it("prefers Dimensions in Expo", async () => {
    const {resolveWindowWidthFromSources} = await import("../src/resolve-window-width.js")

    const result = resolveWindowWidthFromSources({
      dimensions: {get: () => ({width: 480})},
      isExpo: true,
      windowObject: {innerWidth: 1000}
    })

    expect(result).toBe(480)
  })
})
