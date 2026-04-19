/* eslint-disable sort-imports */
import useEnvSense from "env-sense/build/use-env-sense.js"
import {useCallback, useEffect, useLayoutEffect} from "react"

/**
 * @typedef {{
 *   remove?: () => void
 * }} EventListenerSubscription
 */

/**
 * @typedef {{
 *   addEventListener: (event: string, onCalled: (...args: Array<any>) => void) => EventListenerSubscription | void,
 *   removeEventListener?: (event: string, onCalled: (...args: Array<any>) => void) => void
 * }} EventTargetLike
 */

/**
 * @param {EventTargetLike | null | undefined} target Event target to attach listeners to.
 * @param {string} event Event name to listen for.
 * @param {(...args: Array<any>) => void} onCalled Callback invoked on event.
 * @returns {void} No return value.
 */
const useEventListener = (target, event, onCalled) => {
  const {isServer} = useEnvSense()
  const useWorkingEffect = isServer ? useEffect : useLayoutEffect
  const onCalledCallback = useCallback(
    /**
     * @param {...any} args Event callback arguments.
     * @returns {void} No return value.
     */
    (...args) => {
      // eslint-disable-next-line prefer-spread
      onCalled.apply(null, args)
    },
    [target, event, onCalled]
  )

  useWorkingEffect(() => {
    if (target) {
      const eventListener = target.addEventListener(event, onCalledCallback)

      return () => {
        if (eventListener?.remove) eventListener.remove() // This is how its done in Expo + Jest.
        if (target.removeEventListener) target.removeEventListener(event, onCalledCallback) // This is the "old" way in browsers.
      }
    }
  }, [target, event, onCalled])
}

export default useEventListener
