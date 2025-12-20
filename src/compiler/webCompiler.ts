import { compileWeb } from "./src/main.ts";

class WebCompiler {
  compile(code: string, optimizations: string[] = ["cp", "cse", "dce", "algebra", "fold", "regalloc", "inline"], canvas?: HTMLCanvasElement) {
    try {
      return compileWeb(code, optimizations, canvas);
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
