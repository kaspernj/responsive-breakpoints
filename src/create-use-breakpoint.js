// @ts-check
/* eslint-disable func-style, sort-imports */
import {useCallback, useEffect} from "react"
import {Dimensions} from "react-native"
import * as inflection from "inflection"
import isExpo from "./is-expo.js"
import {resolveWindowWidthFromSources} from "./resolve-window-width.js"
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
 * @typedef {[string, number]} BreakpointDefinition
 */

/**
 * @typedef {{name: string} & Record<string, unknown>} BreakpointState
 */

/**
 * @typedef {{base?: object} & Record<string, object | undefined>} BreakpointStylingArgs
 */

/**
 * @typedef {{
 *   addListener: (event: string, onCalled: (...args: Array<unknown>) => void) => void,
 *   removeListener: (event: string, onCalled: (...args: Array<unknown>) => void) => void
 * }} EventEmitterLike
 */

/**
 * @typedef {{
 *   remove?: () => void
 * }} EventListenerSubscription
 */

/**
 * @typedef {{
 *   get: (key: string) => {width: number},
 *   addEventListener: (event: string, onCalled: (...args: Array<unknown>) => void) => EventListenerSubscription | void,
 *   removeEventListener?: (event: string, onCalled: (...args: Array<unknown>) => void) => void
 * }} DimensionsLike
 */

/**
 * @typedef {(args?: object) => {styling: (args: BreakpointStylingArgs) => object} & BreakpointState} UseBreakpointHook
 */

/**
 * @typedef {object} CreateUseBreakpointOptions
 * @property {() => Array<BreakpointDefinition>} [getBreakpoints] Breakpoint provider.
 * @property {() => EventEmitterLike | null} [getEvents] Event emitter provider.
 * @property {string} [eventName] Event name for breakpoints.
 * @property {() => number} [getWindowWidth] Window width resolver override.
 * @property {boolean} [isExpo] Force Expo environment detection.
 * @property {DimensionsLike} [dimensions] Dimensions implementation override.
 */

/**
 * @param {Array<BreakpointDefinition>} breakpoints Ordered list of breakpoints.
 * @param {() => number} getWindowWidth Window width resolver.
 * @returns {BreakpointState} Breakpoint state map.
 */
function calculateBreakPoint(breakpoints, getWindowWidth) {
  const windowWidth = getWindowWidth()
  /** @type {{name?: string} & Record<string, boolean | string | undefined>} */
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
    return /** @type {BreakpointState} */ (result)
  }

  throw new Error(`Couldn't not find breakpoint from window width: ${windowWidth}`)
}

/**
 * @param {CreateUseBreakpointOptions} options Hook configuration.
 * @returns {UseBreakpointHook} Configured breakpoint hook.
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

  const actualDimensions = /** @type {DimensionsLike} */ (dimensionsOverride || Dimensions)
  const actualIsExpo = isExpoOverride ?? isExpo
  const resolveWindowWidth = getWindowWidth || (() => {
    const windowObject = typeof globalThis === "undefined"
      ? undefined
      : /** @type {{innerWidth?: number} | undefined} */ (
        /** @type {{window?: {innerWidth?: number}}} */ (globalThis).window
      )

    // Use 'window.innerWidth' outside Expo because sometimes window width excludes scroll
    return resolveWindowWidthFromSources({
      dimensions: actualDimensions,
      isExpo: actualIsExpo,
      windowObject
    })
  })

  /**
   * @param {object} [args] Shape configuration arguments.
   * @returns {{styling: (args: BreakpointStylingArgs) => object} & BreakpointState} Breakpoint helpers and state.
   */
  const useBreakpoint = (args = {}) => {
    const s = useShape(args)
    const events = getEvents()

    s.meta.breakpoints ||= getBreakpoints()

    const checkAndUpdateBreakpoint = useCallback(() => {
      const breakpoint = calculateBreakPoint(s.m.breakpoints, resolveWindowWidth)
      const currentBreakpoint = /** @type {BreakpointState | undefined} */ (s.s.breakpoint)

      if (breakpoint.name != currentBreakpoint?.name) {
        s.set({breakpoint})
      }
    }, [])

    const onDimensionsChange = useCallback(() => {
      checkAndUpdateBreakpoint()
    }, [])

    const onBreakpointsChange = useCallback(
      /**
       * @param {unknown} event Breakpoint change payload.
       * @returns {void} No return value.
       */
      (event) => {
        const {newValue} = /** @type {{newValue: Array<BreakpointDefinition>}} */ (event)

        s.meta.breakpoints = newValue
        checkAndUpdateBreakpoint()
      },
      []
    )

    s.useStates({
      breakpoint: () => calculateBreakPoint(s.m.breakpoints, resolveWindowWidth)
    })

    const styling = useCallback(
      /**
       * @param {BreakpointStylingArgs} args Styling arguments.
       * @returns {object} Merged style object.
       */
      (args) => {
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
      },
      []
    )

    useEventEmitter(events, eventName, onBreakpointsChange)
    useEventListener(actualDimensions, "change", onDimensionsChange)
    useEffect(() => {
      checkAndUpdateBreakpoint()
    }, [])

    return {
      styling,
      .../** @type {BreakpointState} */ (s.s.breakpoint)
    }
  }

  return useBreakpoint
}

export default createUseBreakpoint
