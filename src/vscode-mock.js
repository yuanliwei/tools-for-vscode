export default {
    workspace: {
        getConfiguration() {
            return {
                /**
                 * @param {string | number} key
                 */
                get(key) {
                    return {
                        chatgpt_http_api: ['1', '2']
                    }[key]
                }
            }
        }
    }
}