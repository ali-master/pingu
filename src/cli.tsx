#!/usr/bin/env bun

import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app";
import figlet from "figlet";
import gradient from "gradient-string";
import { generateCompletion, printCompletionHelp } from "./utils/completions";

console.log();
console.log(
  gradient(["cyan", "pink"])(
    figlet.textSync("PINGU", {
      font: "ANSI Shadow",
      horizontalLayout: "default",
      verticalLayout: "default",
    }),
  ),
);
console.log();

const cli = meow(
  `
	Usage
	  $ pingu <host>
	  $ pingu completion <shell>

	Options
		--count, -c       Number of ping packets to send (default: unlimited)
		--chart, -ch      Display chart (default: false)
		--display, -d     Number of ping packets to display (default: 8)
		--interval, -i    Wait interval seconds between sending each packet (default: 1)
		--timeout, -t     Time to wait for a response, in seconds (default: 5)
		--size, -s        Number of data bytes to be sent (default: 56)
		--export, -e      Export results to JSON file after completion

	Commands
		completion <shell>    Generate shell completion script (bash, zsh, fish)

	Examples
	  $ pingu google.com
	  $ pingu -c 10 8.8.8.8
	  $ pingu --count 5 --interval 2 example.com
	  $ pingu completion bash > /usr/local/etc/bash_completion.d/pingu
	  $ pingu completion zsh > ~/.local/share/zsh/site-functions/_pingu
`,
  {
    importMeta: import.meta,
    flags: {
      display: {
        type: "number",
        shortFlag: "d",
        default: 8,
      },
      count: {
        type: "number",
        shortFlag: "c",
      },
      chart: {
        type: "boolean",
        shortFlag: "ch",
        default: false,
      },
      interval: {
        type: "number",
        shortFlag: "i",
        default: 1,
      },
      timeout: {
        type: "number",
        shortFlag: "t",
        default: 5,
      },
      size: {
        type: "number",
        shortFlag: "s",
        default: 56,
      },
      export: {
        type: "boolean",
        shortFlag: "e",
        default: false,
      },
    },
  },
);

// Handle completion command
if (cli.input[0] === "completion") {
  const shell = cli.input[1];

  if (!shell) {
    printCompletionHelp();
    process.exit(0);
  }

  try {
    const completionScript = generateCompletion(shell);
    console.log(completionScript);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    printCompletionHelp();
    process.exit(1);
  }
}

const host = cli.input[0];

if (!host) {
  console.error("Error: Please provide a host to ping");
  console.log(cli.help);
  process.exit(0);
}

render(<App host={host} options={cli.flags} />);
