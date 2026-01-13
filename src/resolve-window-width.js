/**
 * @param {object} options
 * @param {object} [options.dimensions]
 * @param {boolean} [options.isExpo]
 * @param {object} [options.windowObject]
 * @returns {number}
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
