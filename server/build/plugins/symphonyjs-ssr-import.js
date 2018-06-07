import { join, resolve, relative, dirname } from 'path'

// This plugin modifies the require-ensure code generated by Webpack
// to work with @symph/joy SSR
export default class SymphonyJsSsrImportPlugin {
  apply (compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.mainTemplate.plugin('require-ensure', (code, chunk) => {
        // Update to load chunks from our custom chunks directory
        const outputPath = resolve('/')
        const pagePath = join('/', dirname(chunk.name))
        const relativePathToBaseDir = relative(pagePath, outputPath)
        // Make sure even in windows, the path looks like in unix
        // Node.js require system will convert it accordingly
        const relativePathToBaseDirNormalized = relativePathToBaseDir.replace(/\\/g, '/')
        let updatedCode = code.replace('require("./"', `require("./${relativePathToBaseDirNormalized}/"`)

        // Replace a promise equivalent which runs in the same loop
        // If we didn't do this webpack's module loading process block us from
        // doing SSR for chunks
        updatedCode = updatedCode.replace(
          'return Promise.resolve();',
          `return require('@symph/joy/dynamic').SameLoopPromise.resolve();`
        )
        return updatedCode
      })
    })
  }
}
