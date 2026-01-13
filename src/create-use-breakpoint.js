/* eslint-disable func-style, sort-imports */
import {useCallback} from "react"
import {Dimensions} from "react-native"
import * as inflection from "inflection"
import isExpo from "./is-expo.js"
import useEventEmitter from "./use-event-emitter.js"
import useEventListener from "./use-event-listener.js"
import useShape from "set-state-compare/build/use-shape.js"

const DEFAULT_BREAKPOINTS = [
  ["xxl", 1400],
  ["xl", 1200],
  ["lg", 992],
  ["md", 768],
  ["sm", 576],
  ["xs", 0]
]

/**
 * @param {Array<[string, number]>} breakpoints
 * @param {() => number} getWindowWidth
 * @returns {object}
 */
function calculateBreakPoint(breakpoints, getWindowWidth) {
  const windowWidth = getWindowWidth()
  const result = {}

  for (const breakpointData of breakpoints) {
    const breakpoint = breakpointData[0]
    const width = breakpointData[1]

    if (!result.name && windowWidth >= width) {
      result.name = breakpoint
      result[`${breakpoint}Down`] = true
    } else {
      result[`${breakpoint}Down`] = !result.name
    }

    result[`${breakpoint}Up`] = Boolean(result.name)
  }

  if (result.name) {
    return result
  }

  throw new Error(`Couldn't not find breakpoint from window width: ${windowWidth}`)
}

/**
 * @param {object} options
 * @param {() => Array<[string, number]>} [options.getBreakpoints]
 * @param {() => object} [options.getEvents]
 * @param {string} [options.eventName]
 * @param {() => number} [options.getWindowWidth]
 * @param {boolean} [options.isExpo]
 * @param {object} [options.dimensions]
 * @returns {Function}
 */
const createUseBreakpoint = (options = {}) => {
  const {
    getBreakpoints = () => DEFAULT_BREAKPOINTS,
    getEvents = () => null,
    eventName = "onBreakpointsChange",
    getWindowWidth,
    isExpo: isExpoOverride,
    dimensions: dimensionsOverride
  } = options

  const actualDimensions = dimensionsOverride || Dimensions
  const actualIsExpo = isExpoOverride ?? isExpo
  const resolveWindowWidth = getWindowWidth || (() => {
    if (actualIsExpo) {
      return actualDimensions.get("window").width
    }

    if (typeof window !== "undefined" && window.innerWidth !== undefined) {
      // Use 'window.innerWidth' outside Expo because sometimes window width excludes scroll
      return window.innerWidth
    }

    throw new Error("Didn't know where to get window width from")
  })

  const useBreakpoint = (args = {}) => {
    const s = useShape(args)
    const events = getEvents()

    s.meta.breakpoints ||= getBreakpoints()

    const checkAndUpdateBreakpoint = useCallback(() => {
      const breakpoint = calculateBreakPoint(s.m.breakpoints, resolveWindowWidth)

      if (breakpoint.name != s.s.breakpoint.name) {
        s.set({breakpoint})
      }
    }, [])

    const onDimensionsChange = useCallback(() => {
      checkAndUpdateBreakpoint()
    }, [])

    const onBreakpointsChange = useCallback(({newValue}) => {
      s.meta.breakpoints = newValue
      checkAndUpdateBreakpoint()
    }, [])

    s.useStates({
      breakpoint: () => calculateBreakPoint(s.m.breakpoints, resolveWindowWidth)
    })

    const styling = useCallback((args) => {
      // eslint-disable-next-line prefer-object-spread
      const style = Object.assign({}, args.base)

      for (const breakpointData of s.m.breakpoints) {
        const breakpoint = breakpointData[0]
        const breakpointWithSizeType = `${breakpoint}${inflection.camelize("down")}`

        if (args[breakpointWithSizeType] && s.s.breakpoint[breakpointWithSizeType]) {
          Object.assign(style, args[breakpointWithSizeType])
        }
      }

      for (const breakpointData of [...s.m.breakpoints].reverse()) {
        const breakpoint = breakpointData[0]
        const breakpointWithSizeType = `${breakpoint}${inflection.camelize("up")}`

        if (args[breakpointWithSizeType] && s.s.breakpoint[breakpointWithSizeType]) {
          Object.assign(style, args[breakpointWithSizeType])
        }
      }

      return style
    }, [])

    useEventEmitter(events, eventName, onBreakpointsChange)
    useEventListener(actualDimensions, "change", onDimensionsChange)

    return {
      styling,
      ...s.s.breakpoint
    }
  }

  return useBreakpoint
}

export default createUseBreakpoint
