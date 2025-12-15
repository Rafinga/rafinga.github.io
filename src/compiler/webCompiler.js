import { compileWeb } from './src/main.ts'

class WebCompiler {
  compile(code) {
    try {
      return compileWeb(code)
    } catch (error) {
      return {
        success: false,
        assembly: '',
        errors: [error.message]
      }
    }
  }
}

export default WebCompiler
