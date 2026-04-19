/**
 * @typedef {{width: number}} WindowDimensions
 */

/**
 * @typedef {{get: (key: string) => WindowDimensions}} DimensionsLike
 */

/**
 * @typedef {{innerWidth?: number}} WindowObjectLike
 */

/**
 * @param {object} options Input sources for resolving window width.
 * @param {DimensionsLike} [options.dimensions] React Native Dimensions-like module.
 * @param {boolean} [options.isExpo] Whether the environment is Expo.
 * @param {WindowObjectLike} [options.windowObject] Window-like object with innerWidth.
 * @returns {number} Resolved window width.
 */
const resolveWindowWidthFromSources = ({dimensions, isExpo, windowObject}) => {
  if (isExpo && dimensions?.get) {
    return dimensions.get("window").width
  }

  if (windowObject?.innerWidth !== undefined) {
    return windowObject.innerWidth
  }

  if (dimensions?.get) {
    return dimensions.get("window").width
  }

  throw new Error("Didn't know where to get window width from")
}

export {resolveWindowWidthFromSources}
