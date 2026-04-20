// @ts-check
import createUseBreakpoint from "./create-use-breakpoint.js"

/**
 * @typedef {object} DefaultBreakpointState
 * @property {string} name Active breakpoint name.
 * @property {boolean} xsDown Whether viewport is at or below the xs breakpoint.
 * @property {boolean} xsUp Whether viewport is at or above the xs breakpoint.
 * @property {boolean} smDown Whether viewport is at or below the sm breakpoint.
 * @property {boolean} smUp Whether viewport is at or above the sm breakpoint.
 * @property {boolean} mdDown Whether viewport is at or below the md breakpoint.
 * @property {boolean} mdUp Whether viewport is at or above the md breakpoint.
 * @property {boolean} lgDown Whether viewport is at or below the lg breakpoint.
 * @property {boolean} lgUp Whether viewport is at or above the lg breakpoint.
 * @property {boolean} xlDown Whether viewport is at or below the xl breakpoint.
 * @property {boolean} xlUp Whether viewport is at or above the xl breakpoint.
 * @property {boolean} xxlDown Whether viewport is at or below the xxl breakpoint.
 * @property {boolean} xxlUp Whether viewport is at or above the xxl breakpoint.
 */

/**
 * @typedef {{base?: object} & Record<string, object | undefined>} BreakpointStylingArgs
 */

/**
 * @typedef {(args?: object) => {styling: (args: BreakpointStylingArgs) => object} & DefaultBreakpointState} DefaultUseBreakpointHook
 */

/** @type {DefaultUseBreakpointHook} */
const useBreakpoint = /** @type {DefaultUseBreakpointHook} */ (createUseBreakpoint())

export default useBreakpoint
