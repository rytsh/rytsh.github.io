<script lang="ts">
  import { onMount } from "svelte";
  import { FitAddon } from "@xterm/addon-fit";
  import { WebLinksAddon } from "@xterm/addon-web-links";
  import { Terminal } from "@xterm/xterm";
  import "@xterm/xterm/css/xterm.css";

  type Command = {
    description: string;
    run: (args: string[]) => Promise<string[]> | string[];
  };

  type MessageResponse = {
    error?: string;
    ok?: boolean;
  };

  let terminalElement: HTMLDivElement;
  let terminal: Terminal | undefined;
  let commandRunning = false;
  let currentInput = "";

  const messageEndpoint = import.meta.env.VITE_MESSAGE_ENDPOINT as string | undefined;
  const prompt = "\x1b[38;5;208mvisitor@rytsh\x1b[0m:\x1b[38;5;39m~\x1b[0m$ ";
  const links: Record<string, string> = {
    "github": "https://github.com/rytsh",
    "linkedin": "https://www.linkedin.com/in/rytsh/",
    "wiki": "https://wiki.rytsh.io",
  };

  const sendMessage = async (args: string[]) => {
    const message = args.join(" ").trim();

    if (!message) {
      return ["Usage: msg <message>"];
    }

    if (!messageEndpoint) {
      return [
        "Message endpoint is not configured.",
        "Set VITE_MESSAGE_ENDPOINT to your Cloudflare Worker URL.",
      ];
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(messageEndpoint, {
        body: JSON.stringify({
          message,
          page: window.location.href,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });
      let body: MessageResponse = {};

      try {
        body = await response.json();
      } catch {
        body = {};
      }

      if (!response.ok) {
        return [`Message failed: ${body.error || response.statusText}`];
      }

      return ["Message sent."];
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return ["Message failed: request timed out."];
      }

      return ["Message failed: network error."];
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const commands: Record<string, Command> = {
    "help": {
      description: "List available commands",
      run: () => [
        "Available commands:",
        ...Object.entries(commands).map(([name, { description }]) => {
          return `  ${name.padEnd(8)} ${description}`;
        }),
      ],
    },
    "about": {
      description: "Print a short profile",
      run: () => [
        "Hi there, I'm Eray.",
        "This is a small interactive corner of rytsh.io.",
      ],
    },
    "links": {
      description: "Show profile links",
      run: () => Object.entries(links).map(([name, link]) => {
        return `${name.padEnd(8)} ${link}`;
      }),
    },
    "open": {
      description: "Open github, linkedin, or wiki",
      run: ([target]) => {
        if (!target || !links[target]) {
          return ["Usage: open <github|linkedin|wiki>"];
        }

        window.open(links[target], "_blank", "noopener,noreferrer");
        return [`Opening ${target}...`];
      },
    },
    "msg": {
      description: "Send a Discord message to Eray",
      run: sendMessage,
    },
    "whoami": {
      description: "Print current visitor",
      run: () => ["visitor"],
    },
    "date": {
      description: "Print browser date",
      run: () => [new Date().toString()],
    },
    "clear": {
      description: "Clear terminal output",
      run: () => [],
    },
  };

  const writePrompt = () => {
    terminal?.write(prompt);
  };

  const writeLines = (lines: string[]) => {
    lines.forEach((line) => terminal?.writeln(line));
  };

  const clearTerminal = () => {
    terminal?.write("\x1b[2J\x1b[3J\x1b[H");
  };

  const replaceInput = (nextInput: string) => {
    if (!terminal || !nextInput.startsWith(currentInput)) {
      return;
    }

    terminal.write(nextInput.slice(currentInput.length));
    currentInput = nextInput;
  };

  const showCompletions = (matches: string[]) => {
    if (!terminal) {
      return;
    }

    terminal.writeln("");
    terminal.writeln(matches.join("  "));
    writePrompt();
    terminal.write(currentInput);
  };

  const completeInput = () => {
    const commandNames = Object.keys(commands);
    const linkNames = Object.keys(links);

    if (currentInput.startsWith("open ")) {
      const target = currentInput.slice("open ".length);
      const matches = linkNames.filter((link) => link.startsWith(target));

      if (matches.length === 1) {
        replaceInput(`open ${matches[0]} `);
      } else if (matches.length > 1) {
        showCompletions(matches);
      }

      return;
    }

    if (/\s/.test(currentInput)) {
      return;
    }

    const matches = commandNames.filter((command) => {
      return command.startsWith(currentInput);
    });

    if (currentInput === "") {
      showCompletions(commandNames);
    } else if (matches.length === 1) {
      replaceInput(`${matches[0]} `);
    } else if (matches.length > 1) {
      showCompletions(matches);
    }
  };

  const runCommand = async (rawCommand: string) => {
    if (!terminal) {
      return;
    }

    if (commandRunning) {
      return;
    }

    commandRunning = true;

    try {
      const [name = "", ...args] = rawCommand.trim().split(/\s+/);

      if (name === "clear") {
        clearTerminal();
        writePrompt();
        return;
      }

      terminal.writeln("");

      if (!name) {
        writePrompt();
        return;
      }

      const command = commands[name];

      if (!command) {
        terminal.writeln(`${name}: command not found. Try 'help'.`);
        writePrompt();
        return;
      }

      writeLines(await command.run(args));
      writePrompt();
    } finally {
      commandRunning = false;
    }
  };

  const handleInput = (data: string) => {
    if (!terminal) {
      return;
    }

    if (commandRunning) {
      return;
    }

    if (data === "\r") {
      void runCommand(currentInput);
      currentInput = "";
      return;
    }

    if (data === "\t") {
      completeInput();
      return;
    }

    if (data === "\u007F") {
      if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        terminal.write("\b \b");
      }

      return;
    }

    if (data === "\u0003") {
      terminal.write("^C");
      currentInput = "";
      terminal.writeln("");
      writePrompt();
      return;
    }

    if (data === "\u000c") {
      clearTerminal();
      writePrompt();
      terminal.write(currentInput);
      return;
    }

    if (/^[\x20-\x7E]+$/.test(data)) {
      currentInput += data;
      terminal.write(data);
    }
  };

  const writeIntro = () => {
    writeLines([
      "Rytsh Web Terminal",
      "Type 'help' to see available commands.",
      "",
    ]);
    writePrompt();
  };

  const focusTerminal = () => {
    terminal?.focus();
  };

  const openLink = (_event: MouseEvent, uri: string) => {
    window.open(uri, "_blank", "noopener,noreferrer");
  };

  const getTerminalFontSize = () => {
    if (window.innerWidth < 420) {
      return 12;
    }

    if (window.innerWidth < 640) {
      return 13;
    }

    return 15;
  };

  onMount(() => {
    const fitAddon = new FitAddon();
    let animationFrame = 0;

    terminal = new Terminal({
      allowTransparency: true,
      convertEol: true,
      cursorBlink: true,
      fontFamily: "Inconsolata, monospace",
      fontSize: getTerminalFontSize(),
      lineHeight: 1.25,
      rows: 14,
      theme: {
        background: "#050505",
        black: "#050505",
        blue: "#38bdf8",
        brightBlack: "#6b7280",
        brightWhite: "#ffffff",
        cursor: "#ff5c00",
        foreground: "#f8fafc",
        green: "#86efac",
        red: "#f87171",
        yellow: "#facc15",
      },
    });

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon(openLink));
    terminal.open(terminalElement);
    terminal.onData(handleInput);

    const fitTerminal = () => {
      if (!terminal) {
        return;
      }

      const fontSize = getTerminalFontSize();

      if (terminal.options.fontSize !== fontSize) {
        terminal.options.fontSize = fontSize;
      }

      fitAddon.fit();
    };
    const scheduleFit = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(fitTerminal);
    };
    const resizeObserver = new ResizeObserver(scheduleFit);

    resizeObserver.observe(terminalElement);
    window.addEventListener("resize", scheduleFit);
    document.fonts?.ready.then(scheduleFit).catch(() => undefined);
    scheduleFit();

    writeIntro();
    focusTerminal();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", scheduleFit);
      resizeObserver.disconnect();
      terminal?.dispose();
      terminal = undefined;
    };
  });
</script>

<div
  aria-label="Interactive terminal"
  bind:this={terminalElement}
  class="terminal-screen h-[calc(100dvh-12rem)] min-h-[16rem] w-full min-w-0 max-w-full border border-black bg-black p-2"
></div>

<style>
  .terminal-screen {
    box-shadow: none;
    max-width: 100%;
    overflow: hidden;
  }

  .terminal-screen :global(.xterm) {
    height: 100%;
    max-width: 100%;
  }

  .terminal-screen :global(.xterm-viewport) {
    background-color: transparent !important;
    overflow-y: auto;
  }

  .terminal-screen :global(.xterm-screen) {
    width: 100% !important;
  }
</style>
