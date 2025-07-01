#!/usr/bin/env bun

import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./app";
import figlet from "figlet";
import gradient from "gradient-string";

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

	Options
		--count, -c       Number of ping packets to send (default: unlimited)
		--chart, -ch      Display chart (default: false)
		--display, -d     Number of ping packets to display (default: 8)
		--interval, -i    Wait interval seconds between sending each packet (default: 1)
		--timeout, -t     Time to wait for a response, in seconds (default: 5)
		--size, -s        Number of data bytes to be sent (default: 56)
		--export, -e      Export results to JSON file after completion

	Examples
	  $ pingu google.com
	  $ pingu -c 10 8.8.8.8
	  $ pingu --count 5 --interval 2 example.com
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

const host = cli.input[0];

if (!host) {
  console.error("Error: Please provide a host to ping");
  console.log(cli.help);
  process.exit(0);
}

render(<App host={host} options={cli.flags} />);
