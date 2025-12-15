import { Command, Option } from '@commander-js/extra-typings';

/**
 * Compilation stages.
 */
export enum CompilerAction {
  default = "default",
  scan = "scan",
  parse = "parse",
  inter = "inter",
  assembly = "assembly"
}

export class CLI {

  /** Compilation target stage */
  static target: CompilerAction = CompilerAction.default;

  /** Input Decaf file */
  static input_file: string | undefined = undefined;

  /** Compilation output file */
  static output_file: string | undefined = undefined;

  /** Whether to print debug information or not */
  static debug: boolean = false;

  /** List of optimizations to perform */
  static optimizations: string[] = [];

  /** Parses command line arguments, and saves them to the static properties */
  public static parse() {
    const program = new Command();

    program
      .argument('<input-file>')
      .addOption(new Option('-t, --target <stage>', 'Target compilation stage').choices(['default', 'scan', 'parse', 'inter', 'assembly']).default('default'))
      .option('-o, --output <output-file>', 'Compilation output file')
      .option('-d, --debug', 'Print debug information', false)
      .option('-O, --opts <optimization,...>', 'Optimizations to be performed (cp,dce,simplify,fold)', [])
      .action((input_file, options) => {
        CLI.input_file = input_file;
        CLI.target = CompilerAction[options.target as keyof typeof CompilerAction];
        CLI.output_file = options.output;
        CLI.debug = options.debug;
        CLI.optimizations = options.opts;
      })
      .parse(process.argv);
  }
}
