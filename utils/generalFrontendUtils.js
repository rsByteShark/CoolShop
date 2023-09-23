/**
 * This function returns promise that will be resolved when react state will be completely set
 * @param {import("react").Dispatch<*>} dispatchFunction 
 * @param {*} newStateArgsOrPrevStateCallback 
 * @returns {Promise<void>}
 */
module.exports.promisefullStateDispatch = (dispatchFunction, newStateArgsOrPrevStateCallback) => {

    return new Promise((resolve) => {

        dispatchFunction(newStateArgsOrPrevStateCallback, () => {

            resolve();

        })

    })

}