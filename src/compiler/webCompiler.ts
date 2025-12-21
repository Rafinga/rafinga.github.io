import { compileWeb, irGen } from "./src/main.ts";

class WebCompiler {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  compile(
    code: string,
    optimizations: string[] = [
      "cp",
      "cse",
      "dce",
      "algebra",
      "fold",
      "regalloc",
      "inline",
    ],
    canvas?: HTMLCanvasElement
  ) {
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

  checkErrors(code: string, onResult: (errors: string[]) => void) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      try {
        irGen(code);
        onResult([]);
      } catch (error) {
        onResult([error.message]);
      }
    }, 500);
  }
}

export default WebCompiler;
