import { compileWeb } from "./src/main.ts";

class WebCompiler {
  compile(code: string) {
    try {
      return compileWeb(code);
    } catch (error) {
      console.error("Compilation error:", error);
      return {
        success: false,
        assembly: "",
        errors: [error.message],
      };
    }
  }
}

export default WebCompiler;
