// @ts-check
/* eslint-disable sort-imports */
import useEnvSense from "env-sense/build/use-env-sense.js"
import {useEffect, useLayoutEffect, useMemo} from "react"

/**
 * @typedef {{
 *   addListener: (event: string, onCalled: (...args: Array<unknown>) => void) => void,
 *   removeListener: (event: string, onCalled: (...args: Array<unknown>) => void) => void
 * }} EventEmitterLike
 */

/**
 * @param {EventEmitterLike | null} events Event emitter to subscribe to.
 * @param {string} event Event name to listen for.
 * @param {(...args: Array<unknown>) => void} onCalled Callback invoked on event.
 * @returns {void} No return value.
 */
export default function useEventEmitter(events, event, onCalled) {
  const {isServer} = useEnvSense()
  const useWorkingEffect = isServer ? useEffect : useLayoutEffect

  // useMemo to instantly connect
  useMemo(() => {
    if (events) {
      events.addListener(event, onCalled)
    }
  }, [events, event, onCalled])

  // useLayoutEffect to disconnect when unmounted or changed
  useWorkingEffect(() => {
    if (events) {
      return () => {
        events.removeListener(event, onCalled)
      }
    }
  }, [events, event, onCalled])
}
