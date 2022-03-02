/***
 * @version 1.1
 */

import * as dotenv from 'dotenv'

export default class Env {
    static loaded = false
    static data:any

    private constructor() {}

    private static loader() {
        const env = dotenv.config()
        if (env.error) console.warn( env.error )
        this.data = env.parsed
        this.loaded = true
    }

    static get(key?:string, defaultValue?:any) {
        if (!this.loaded) this.loader()
        if (!key) return this.data
        let value = this.data ? this.data[key] : undefined
        if (typeof value === 'undefined' && typeof defaultValue !== 'undefined')  value = defaultValue
        if (typeof value === 'undefined') throw new Error(`Env key "${key}" is not set!`)
        return value
    }
}