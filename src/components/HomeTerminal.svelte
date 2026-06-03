<script lang="ts">
  import { onMount } from "svelte";
  import { FitAddon } from "@xterm/addon-fit";
  import { WebLinksAddon } from "@xterm/addon-web-links";
  import { Terminal } from "@xterm/xterm";
  import "@xterm/xterm/css/xterm.css";

  type Command = {
    description: string;
    run: (
      args: string[],
      rawArgs?: string,
    ) => Promise<string[] | undefined> | string[] | undefined;
  };

  type MessageResponse = {
    error?: string;
    ok?: boolean;
  };

  type CaptchaChallenge = {
    answer: number;
    question: string;
  };

  type MessageRequest = {
    message: string;
    name: string;
  };

  type ComposerField = "name" | "message" | "captcha" | "send" | "cancel";

  type MessageComposer = {
    captcha: CaptchaChallenge;
    captchaAnswer: string;
    message: string;
    messageCursorIndex: number;
    messageEditing: boolean;
    name: string;
    selectedField: ComposerField;
    sending: boolean;
    status: string;
  };

  let terminalElement: HTMLDivElement;
  let terminal: Terminal | undefined;
  let commandRunning = false;
  let currentInput = "";
  let commandHistory: string[] = [];
  let historyDraft = "";
  let historyIndex = 0;
  let messageComposer: MessageComposer | undefined;

  const messageEndpoint = import.meta.env.VITE_MESSAGE_ENDPOINT as
    | string
    | undefined;
  const prompt = "\x1b[38;2;121;205;136mrytsh\x1b[0m$ ";
  const promptLength = "rytsh$ ".length;
  const maxHistoryLength = 50;
  const maxMessageLength = 800;
  const maxNameLength = 60;
  const maxCaptchaLength = 3;
  const terminalFontFamily =
    '"JetBrains Mono", "SFMono-Regular", "Cascadia Mono", "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", monospace';
  const composerFields: ComposerField[] = [
    "name",
    "message",
    "captcha",
    "send",
    "cancel",
  ];
  const ansi = {
    bgActive: "\x1b[48;5;236m",
    blue: "\x1b[38;5;81m",
    border: "\x1b[38;5;240m",
    cyan: "\x1b[38;5;117m",
    danger: "\x1b[38;5;203m",
    dim: "\x1b[2m",
    green: "\x1b[38;5;114m",
    accent: "\x1b[38;2;121;205;136m",
    cursor: "\x1b[48;2;121;205;136m\x1b[38;5;16m",
    muted: "\x1b[38;5;244m",
    placeholder: "\x1b[38;5;241m",
    reset: "\x1b[0m",
    white: "\x1b[38;5;253m",
    yellow: "\x1b[38;5;222m",
  };
  const links: Record<string, string> = {
    github: "https://github.com/rytsh",
    linkedin: "https://www.linkedin.com/in/rytsh/",
    wiki: "https://wiki.rytsh.io",
  };
  const decodeMessageInput = (input: string) => {
    return input.replace(/\\n/g, "\n").trim();
  };

  const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const createCaptchaChallenge = (): CaptchaChallenge => {
    let left = randomInt(2, 12);
    let right = randomInt(1, 9);
    const operator = Math.random() < 0.5 ? "+" : "-";

    if (operator === "-" && right > left) {
      [left, right] = [right, left];
    }

    return {
      answer: operator === "+" ? left + right : left - right,
      question: `${left} ${operator} ${right}`,
    };
  };

  const deliverMessage = async ({ message, name }: MessageRequest) => {
    if (!messageEndpoint) {
      return [
        "Message endpoint is not configured.",
        "Set VITE_MESSAGE_ENDPOINT to your Cloudflare Worker URL.",
      ];
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(messageEndpoint, {
        body: JSON.stringify({
          message,
          name,
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

  const writePrompt = () => {
    terminal?.write(prompt);
  };

  const writeLines = (lines: string[]) => {
    lines.forEach((line) => terminal?.writeln(line));
  };

  const getInputRowCount = (input: string) => {
    if (!terminal?.cols) {
      return 1;
    }

    return Math.max(
      1,
      Math.ceil((promptLength + input.length) / terminal.cols),
    );
  };

  const redrawInput = (nextInput: string) => {
    if (!terminal) {
      return;
    }

    const rowCount = getInputRowCount(currentInput);

    terminal.write("\x1b[2K\r");

    for (let row = 1; row < rowCount; row += 1) {
      terminal.write("\x1b[1A\x1b[2K\r");
    }

    writePrompt();
    terminal.write(nextInput);
    currentInput = nextInput;
  };

  const clearTerminal = () => {
    terminal?.write("\x1b[2J\x1b[3J\x1b[H");
  };

  const replaceInput = (nextInput: string) => {
    if (!terminal) {
      return;
    }

    redrawInput(nextInput);
  };

  const resetHistorySearch = () => {
    historyDraft = "";
    historyIndex = commandHistory.length;
  };

  const rememberCommand = (rawCommand: string) => {
    const command = rawCommand.trim();

    if (!command) {
      resetHistorySearch();
      return;
    }

    if (commandHistory[commandHistory.length - 1] !== command) {
      commandHistory = [...commandHistory, command].slice(-maxHistoryLength);
    }

    resetHistorySearch();
  };

  const showPreviousCommand = () => {
    if (!commandHistory.length) {
      return;
    }

    if (historyIndex >= commandHistory.length) {
      historyDraft = currentInput;
      historyIndex = commandHistory.length - 1;
    } else if (historyIndex > 0) {
      historyIndex -= 1;
    }

    redrawInput(commandHistory[historyIndex]);
  };

  const showNextCommand = () => {
    if (!commandHistory.length || historyIndex >= commandHistory.length) {
      return;
    }

    if (historyIndex < commandHistory.length - 1) {
      historyIndex += 1;
      redrawInput(commandHistory[historyIndex]);
      return;
    }

    historyIndex = commandHistory.length;
    redrawInput(historyDraft);
    historyDraft = "";
  };

  const color = (style: string, value: string) => {
    return `${style}${value}${ansi.reset}`;
  };

  const visibleLength = (value: string) => {
    return value.replace(/\x1b\[[0-9;]*m/g, "").length;
  };

  const truncateText = (value: string, width: number) => {
    if (width <= 0) {
      return "";
    }

    if (value.length > width) {
      if (width <= 3) {
        return value.slice(0, width);
      }

      return `${value.slice(0, width - 3)}...`;
    }

    return value;
  };

  const fitText = (value: string, width: number) => {
    const fittedValue = truncateText(value, width);

    return fittedValue.padEnd(width, " ");
  };

  const padAnsi = (value: string, width: number) => {
    if (width <= 0) {
      return "";
    }

    const length = visibleLength(value);

    if (length > width) {
      return truncateText(value.replace(/\x1b\[[0-9;]*m/g, ""), width);
    }

    return `${value}${" ".repeat(width - length)}`;
  };

  const boxLine = (
    content: string,
    width: number,
    borderStyle = ansi.border,
  ) => {
    return `${color(borderStyle, "|")} ${padAnsi(content, width - 4)} ${color(borderStyle, "|")}`;
  };

  const topLine = (width: number) => {
    return color(ansi.border, `+${"-".repeat(width - 2)}+`);
  };

  const valueText = (value: string, placeholder: string, width: number) => {
    if (!value) {
      return color(
        `${ansi.dim}${ansi.placeholder}`,
        fitText(placeholder, width),
      );
    }

    return color(ansi.white, fitText(value, width));
  };

  const fieldLine = (
    field: ComposerField,
    label: string,
    value: string,
    placeholder: string,
    width: number,
  ) => {
    const active = messageComposer?.selectedField === field;
    const contentWidth = width - 4;
    const valueWidth = Math.max(8, contentWidth - 14);
    const marker = active ? color(ansi.accent, ">") : color(ansi.muted, " ");
    const labelText = color(active ? ansi.yellow : ansi.cyan, label.padEnd(8));
    const renderedValue = valueText(value, placeholder, valueWidth);
    const content = `${marker} ${labelText} ${renderedValue}`;

    return boxLine(content, width, active ? ansi.accent : ansi.border);
  };

  const statusLine = (status: string, width: number) => {
    const style =
      status.startsWith("Message failed") ||
      status.includes("required") ||
      status.includes("failed") ||
      status.includes("too") ||
      status.includes("not allowed")
        ? ansi.danger
        : status.startsWith("Attached") || status.startsWith("Sending")
          ? ansi.green
          : ansi.muted;

    return boxLine(color(style, status || "Ready."), width);
  };

  const buttonText = (field: "send" | "cancel", label: string) => {
    const active = messageComposer?.selectedField === field;
    const style = field === "send" ? ansi.green : ansi.danger;

    if (active) {
      return `${ansi.bgActive}${color(style, `[ ${label} ]`)}${ansi.reset}`;
    }

    return color(ansi.muted, `[ ${label} ]`);
  };

  const helpText = (value: string) => {
    return color(ansi.muted, value);
  };

  const titleText = (title: string) => {
    return `${color(ansi.accent, "rytsh")}${color(ansi.border, " / ")}${color(ansi.blue, title)}`;
  };

  const writeComposerFrame = (lines: string[]) => {
    if (!terminal) {
      return;
    }

    const frame = lines.map((line) => `\x1b[2K${line}`).join("\r\n");

    terminal.write(`\x1b[?2026h\x1b[H${frame}\x1b[?2026l`);
  };

  const getMessageCursorIndex = () => {
    if (!messageComposer) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        messageComposer.messageCursorIndex,
        messageComposer.message.length,
      ),
    );
  };

  const getMessageCursorPosition = () => {
    const message = messageComposer?.message || "";
    const cursorIndex = getMessageCursorIndex();
    let lineIndex = 0;
    let lineStart = 0;

    for (let index = 0; index < cursorIndex; index += 1) {
      if (message[index] === "\n") {
        lineIndex += 1;
        lineStart = index + 1;
      }
    }

    return {
      column: cursorIndex - lineStart,
      lineIndex,
    };
  };

  const getMessageIndexAtPosition = (lineIndex: number, column: number) => {
    const lines = messageComposer?.message.split("\n") || [""];
    const targetLineIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));
    let index = 0;

    for (let line = 0; line < targetLineIndex; line += 1) {
      index += lines[line].length + 1;
    }

    return index + Math.min(column, lines[targetLineIndex].length);
  };

  const renderTextWithCursor = (
    content: string,
    width: number,
    cursorColumn: number | undefined,
    isPlaceholder: boolean,
  ) => {
    if (cursorColumn === undefined) {
      const value = isPlaceholder ? "type or paste message here" : content;

      return isPlaceholder
        ? color(`${ansi.dim}${ansi.placeholder}`, fitText(value, width))
        : color(ansi.white, fitText(value, width));
    }

    const clampedCursorColumn = Math.max(
      0,
      Math.min(cursorColumn, content.length),
    );
    const start = Math.max(0, clampedCursorColumn - width + 1);
    const before = content.slice(start, clampedCursorColumn);
    const cursorChar = content[clampedCursorColumn] || " ";
    const after = content.slice(
      clampedCursorColumn + (content[clampedCursorColumn] ? 1 : 0),
      start + width,
    );
    const rendered = `${color(ansi.white, before)}${color(ansi.cursor, cursorChar)}${color(ansi.white, after)}`;

    return padAnsi(rendered, width);
  };

  const messageLine = (
    content: string,
    width: number,
    lineNumber: number,
    isPlaceholder = false,
    cursorColumn?: number,
  ) => {
    const active = messageComposer?.selectedField === "message";
    const contentWidth = width - 4;
    const lineNumberText = color(ansi.muted, String(lineNumber).padStart(2));
    const divider = color(ansi.border, "|");
    const textWidth = Math.max(8, contentWidth - 7);
    const text = renderTextWithCursor(
      content,
      textWidth,
      cursorColumn,
      isPlaceholder,
    );

    return boxLine(
      `  ${lineNumberText} ${divider} ${text}`,
      width,
      active ? ansi.accent : ansi.border,
    );
  };

  const getMessageDisplayLineCount = () => {
    const rowBudget = Math.max(2, Math.min(8, (terminal?.rows || 14) - 10));
    const actualLineCount = Math.max(
      1,
      messageComposer?.message.split("\n").length || 1,
    );

    return Math.min(
      Math.max(messageComposer?.messageEditing ? 3 : 2, actualLineCount),
      rowBudget,
    );
  };

  const messageEditorLines = (width: number) => {
    if (!messageComposer) {
      return [];
    }

    const composer = messageComposer;
    const active = composer.selectedField === "message";
    const marker = active ? color(ansi.accent, ">") : color(ansi.muted, " ");
    const mode = composer.messageEditing
      ? color(ansi.green, "editing")
      : color(ansi.placeholder, "Enter to edit");
    const header = boxLine(
      `${marker} ${color(active ? ansi.yellow : ansi.cyan, "Message ")} ${mode}`,
      width,
      active ? ansi.accent : ansi.border,
    );
    const displayLineCount = getMessageDisplayLineCount();
    const rawLines = composer.message ? composer.message.split("\n") : [""];
    const cursor = getMessageCursorPosition();
    const maxStartIndex = Math.max(0, rawLines.length - displayLineCount);
    let startIndex = Math.max(0, rawLines.length - displayLineCount);

    if (composer.messageEditing) {
      if (cursor.lineIndex < startIndex) {
        startIndex = cursor.lineIndex;
      } else if (cursor.lineIndex >= startIndex + displayLineCount) {
        startIndex = cursor.lineIndex - displayLineCount + 1;
      }
    }

    startIndex = Math.max(0, Math.min(startIndex, maxStartIndex));
    const visibleLines = rawLines.slice(
      startIndex,
      startIndex + displayLineCount,
    );
    const contentLines = visibleLines.map((line, index) => {
      const lineIndex = startIndex + index;
      const cursorColumn =
        composer.messageEditing && cursor.lineIndex === lineIndex
          ? cursor.column
          : undefined;

      return messageLine(
        line,
        width,
        lineIndex + 1,
        !composer.message && index === 0,
        cursorColumn,
      );
    });

    while (contentLines.length < displayLineCount) {
      contentLines.push(
        messageLine("", width, startIndex + contentLines.length + 1),
      );
    }

    return [header, ...contentLines];
  };

  const getMessageStats = () => {
    if (!messageComposer?.message) {
      return "0 chars, 0 lines";
    }

    return `${messageComposer.message.length}/${maxMessageLength} chars, ${messageComposer.message.split("\n").length} lines`;
  };

  const renderMessageComposer = () => {
    if (!terminal || !messageComposer) {
      return;
    }

    const width = Math.max(36, Math.min(terminal.cols || 72, 78));
    const captchaLabel = `${messageComposer.captcha.question} = ${messageComposer.captchaAnswer}`;
    const sendLabel = buttonText("send", "Send");
    const cancelLabel = buttonText("cancel", "Cancel");
    const namePreview = messageComposer.name;

    writeComposerFrame([
      topLine(width),
      boxLine(titleText("message composer"), width, ansi.accent),
      boxLine(helpText("Tab/Up/Down move  Enter action  Ctrl+C cancel"), width),
      fieldLine("name", "Name", namePreview, "required sender name", width),
      ...messageEditorLines(width),
      boxLine(
        helpText(
          `Message: ${getMessageStats()}. In editor: Enter newline, Esc done.`,
        ),
        width,
      ),
      fieldLine("captcha", "Captcha", captchaLabel, "answer", width),
      boxLine(`${sendLabel}  ${cancelLabel}`, width),
      statusLine(messageComposer.status, width),
      boxLine(
        helpText("Message only. Uploads are disabled for safety."),
        width,
      ),
      topLine(width),
    ]);
  };

  const closeMessageComposer = (lines: string[] = []) => {
    if (!terminal) {
      return;
    }

    messageComposer = undefined;
    terminal.write("\x1b[?25h\x1b[?1049l");
    writeLines(lines);
    writePrompt();
    focusTerminal();
  };

  const updateMessageComposer = (updates: Partial<MessageComposer>) => {
    if (!messageComposer) {
      return;
    }

    messageComposer = { ...messageComposer, ...updates };
    renderMessageComposer();
  };

  const getComposerFieldIndex = () => {
    return Math.max(
      0,
      composerFields.indexOf(messageComposer?.selectedField || "name"),
    );
  };

  const moveComposerField = (delta: number) => {
    if (!messageComposer) {
      return;
    }

    const nextIndex =
      (getComposerFieldIndex() + delta + composerFields.length) %
      composerFields.length;

    updateMessageComposer({
      selectedField: composerFields[nextIndex],
      status: "",
    });
  };

  const appendComposerInput = (value: string) => {
    if (!messageComposer) {
      return;
    }

    if (messageComposer.selectedField === "name") {
      const nextValue = value.replace(/[\r\n\t]+/g, " ");

      updateMessageComposer({
        name: `${messageComposer.name}${nextValue}`.slice(0, maxNameLength),
        status: "",
      });
      return;
    }

    if (messageComposer.selectedField === "message") {
      const nextValue = value
        .replace(/^\x1b\[200~/, "")
        .replace(/\x1b\[201~$/, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\t/g, "  ");
      const cursorIndex = getMessageCursorIndex();
      const availableLength = maxMessageLength - messageComposer.message.length;
      const insertedValue = nextValue.slice(0, Math.max(0, availableLength));

      if (!insertedValue) {
        updateMessageComposer({
          status: `Message must be ${maxMessageLength} chars or less.`,
        });
        return;
      }

      updateMessageComposer({
        message: `${messageComposer.message.slice(0, cursorIndex)}${insertedValue}${messageComposer.message.slice(cursorIndex)}`,
        messageCursorIndex: cursorIndex + insertedValue.length,
        status: "",
      });
      return;
    }

    if (messageComposer.selectedField === "captcha") {
      updateMessageComposer({
        captchaAnswer:
          `${messageComposer.captchaAnswer}${value.replace(/\D/g, "")}`.slice(
            0,
            maxCaptchaLength,
          ),
        status: "",
      });
      return;
    }
  };

  const backspaceComposerInput = () => {
    if (!messageComposer) {
      return;
    }

    if (messageComposer.selectedField === "name") {
      updateMessageComposer({
        name: messageComposer.name.slice(0, -1),
        status: "",
      });
      return;
    }

    if (messageComposer.selectedField === "message") {
      if (!messageComposer.messageEditing) {
        updateMessageComposer({
          status: "Press Enter to edit the message first.",
        });
        return;
      }

      const cursorIndex = getMessageCursorIndex();

      if (cursorIndex === 0) {
        return;
      }

      updateMessageComposer({
        message: `${messageComposer.message.slice(0, cursorIndex - 1)}${messageComposer.message.slice(cursorIndex)}`,
        messageCursorIndex: cursorIndex - 1,
        status: "",
      });
      return;
    }

    if (messageComposer.selectedField === "captcha") {
      updateMessageComposer({
        captchaAnswer: messageComposer.captchaAnswer.slice(0, -1),
        status: "",
      });
      return;
    }
  };

  const moveMessageCursor = (delta: number) => {
    if (!messageComposer) {
      return;
    }

    updateMessageComposer({
      messageCursorIndex: Math.max(
        0,
        Math.min(
          getMessageCursorIndex() + delta,
          messageComposer.message.length,
        ),
      ),
      status: "",
    });
  };

  const moveMessageCursorLine = (delta: number) => {
    if (!messageComposer) {
      return;
    }

    const cursor = getMessageCursorPosition();
    const lines = messageComposer.message.split("\n");
    const nextLineIndex = Math.max(
      0,
      Math.min(cursor.lineIndex + delta, lines.length - 1),
    );

    updateMessageComposer({
      messageCursorIndex: getMessageIndexAtPosition(
        nextLineIndex,
        cursor.column,
      ),
      status: "",
    });
  };

  const submitMessageComposer = async () => {
    if (!messageComposer || !terminal || messageComposer.sending) {
      return;
    }

    const message = decodeMessageInput(messageComposer.message);
    const name = messageComposer.name.replace(/\s+/g, " ").trim();
    const captchaAnswer = Number(messageComposer.captchaAnswer.trim());

    if (!name) {
      updateMessageComposer({
        selectedField: "name",
        status: "Name is required.",
      });
      return;
    }

    if (!message) {
      updateMessageComposer({
        selectedField: "message",
        status: "Message is required.",
      });
      return;
    }

    if (message.length < 2) {
      updateMessageComposer({
        selectedField: "message",
        status: "Message is too short.",
      });
      return;
    }

    if (message.length > maxMessageLength) {
      updateMessageComposer({
        selectedField: "message",
        status: `Message must be ${maxMessageLength} chars or less.`,
      });
      return;
    }

    if (
      !messageComposer.captchaAnswer ||
      captchaAnswer !== messageComposer.captcha.answer
    ) {
      updateMessageComposer({
        captcha: createCaptchaChallenge(),
        captchaAnswer: "",
        selectedField: "captcha",
        status: "Captcha failed. Try the new question.",
      });
      return;
    }

    updateMessageComposer({ sending: true, status: "Sending..." });

    const lines = await deliverMessage({
      message,
      name,
    });

    if (lines.some((line) => line.startsWith("Message sent"))) {
      closeMessageComposer(lines);
      return;
    }

    updateMessageComposer({ sending: false, status: lines.join(" ") });
  };

  const handleComposerEnter = () => {
    if (!messageComposer) {
      return;
    }

    if (messageComposer.selectedField === "message") {
      updateMessageComposer({
        messageEditing: true,
        status: "Editing message. Enter adds new line, Esc exits editor.",
      });
      return;
    }

    if (messageComposer.selectedField === "captcha") {
      updateMessageComposer({
        selectedField: "send",
        status: "Press Enter on Send to submit.",
      });
      return;
    }

    if (messageComposer.selectedField === "send") {
      void submitMessageComposer();
      return;
    }

    if (messageComposer.selectedField === "cancel") {
      closeMessageComposer(["Message composer cancelled."]);
      return;
    }

    moveComposerField(1);
  };

  const handleComposerInput = (data: string) => {
    if (!messageComposer || messageComposer.sending) {
      return;
    }

    if (data === "\u0003") {
      closeMessageComposer(["Message composer cancelled."]);
      return;
    }

    if (data === "\x1b") {
      if (messageComposer.messageEditing) {
        updateMessageComposer({
          messageEditing: false,
          status: "Message editor closed.",
        });
      }

      return;
    }

    if (data === "\r") {
      if (messageComposer.selectedField === "message") {
        if (messageComposer.messageEditing) {
          appendComposerInput("\n");
        } else {
          updateMessageComposer({
            messageCursorIndex: messageComposer.message.length,
            messageEditing: true,
            status: "Editing message. Enter adds new line, Esc exits editor.",
          });
        }

        return;
      }

      handleComposerEnter();
      return;
    }

    if (data === "\t") {
      if (messageComposer.messageEditing) {
        appendComposerInput("  ");
        return;
      }

      moveComposerField(1);
      return;
    }

    if (data === "\x1b[B") {
      if (messageComposer.messageEditing) {
        moveMessageCursorLine(1);
        return;
      }

      moveComposerField(1);
      return;
    }

    if (data === "\x1b[Z" || data === "\x1b[A") {
      if (messageComposer.messageEditing) {
        moveMessageCursorLine(-1);
        return;
      }

      moveComposerField(-1);
      return;
    }

    if (data === "\x1b[C") {
      if (messageComposer.messageEditing) {
        moveMessageCursor(1);
        return;
      }

      if (messageComposer.selectedField === "send") {
        updateMessageComposer({ selectedField: "cancel", status: "" });
      } else {
        moveComposerField(1);
      }

      return;
    }

    if (data === "\x1b[D") {
      if (messageComposer.messageEditing) {
        moveMessageCursor(-1);
        return;
      }

      if (messageComposer.selectedField === "cancel") {
        updateMessageComposer({ selectedField: "send", status: "" });
      } else {
        moveComposerField(-1);
      }

      return;
    }

    if (data.startsWith("\x1b")) {
      if (
        messageComposer.selectedField === "message" &&
        data.startsWith("\x1b[200~")
      ) {
        updateMessageComposer({
          messageCursorIndex: messageComposer.message.length,
          messageEditing: true,
          status: "",
        });
        appendComposerInput(data);
      }

      return;
    }

    if (data === "\u007F") {
      backspaceComposerInput();
      return;
    }

    if (
      messageComposer.selectedField === "message" &&
      !data.startsWith("\x1b")
    ) {
      if (!messageComposer.messageEditing) {
        updateMessageComposer({
          messageCursorIndex: messageComposer.message.length,
          messageEditing: true,
          status: "",
        });
      }

      appendComposerInput(data);
      return;
    }

    if (/^[\x20-\x7E]+$/.test(data)) {
      appendComposerInput(data);
    }
  };

  const openMessageComposer = (rawMessage = "") => {
    if (!messageEndpoint) {
      return [
        "Message endpoint is not configured.",
        "Set VITE_MESSAGE_ENDPOINT to your Cloudflare Worker URL.",
      ];
    }

    messageComposer = {
      captcha: createCaptchaChallenge(),
      captchaAnswer: "",
      message: rawMessage,
      messageCursorIndex: rawMessage.length,
      messageEditing: false,
      name: "",
      selectedField: rawMessage ? "name" : "message",
      sending: false,
      status: "Fill required fields, solve captcha, then Send.",
    };

    terminal?.write("\x1b[?1049h\x1b[?25l");
    renderMessageComposer();

    return [];
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

  const commands: Record<string, Command> = {
    help: {
      description: "List available commands",
      run: () => [
        "Available commands:",
        ...Object.entries(commands).map(([name, { description }]) => {
          return `  ${name.padEnd(8)} ${description}`;
        }),
      ],
    },
    about: {
      description: "Print a short profile",
      run: () => ["Eray Ateş ░░░░░▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓"],
    },
    links: {
      description: "Show profile links",
      run: () =>
        Object.entries(links).map(([name, link]) => {
          return `${name.padEnd(8)} ${link}`;
        }),
    },
    open: {
      description: "Open github, linkedin, or wiki",
      run: ([target]) => {
        if (!target || !links[target]) {
          return ["Usage: open <github|linkedin|wiki>"];
        }

        window.open(links[target], "_blank", "noopener,noreferrer");
        return [`Opening ${target}...`];
      },
    },
    msg: {
      description: "Open the message TUI with name and captcha",
      run: (_args, rawArgs = "") => openMessageComposer(rawArgs),
    },
    whoami: {
      description: "Print current visitor",
      run: () => ["visitor"],
    },
    date: {
      description: "Print browser date",
      run: () => [new Date().toString()],
    },
    clear: {
      description: "Clear terminal output",
      run: () => [],
    },
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
      const [, name = "", rawArgs = ""] =
        rawCommand.trim().match(/^(\S+)(?:\s+([\s\S]*))?$/) || [];
      const args = rawArgs ? rawArgs.split(/\s+/) : [];

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

      const output = await command.run(args, rawArgs);

      if (output?.length) {
        writeLines(output);
      }

      if (!messageComposer) {
        writePrompt();
      }
    } finally {
      commandRunning = false;
    }
  };

  const handleInput = (data: string) => {
    if (!terminal) {
      return;
    }

    if (messageComposer) {
      handleComposerInput(data);
      return;
    }

    if (commandRunning) {
      return;
    }

    if (data === "\r") {
      rememberCommand(currentInput);
      void runCommand(currentInput);
      currentInput = "";
      return;
    }

    if (data === "\x1b[A") {
      showPreviousCommand();
      return;
    }

    if (data === "\x1b[B") {
      showNextCommand();
      return;
    }

    if (data.startsWith("\x1b")) {
      return;
    }

    if (data === "\t") {
      completeInput();
      return;
    }

    if (data === "\u007F") {
      if (currentInput.length > 0) {
        resetHistorySearch();
        redrawInput(currentInput.slice(0, -1));
      }

      return;
    }

    if (data === "\u0003") {
      terminal.write("^C");
      currentInput = "";
      resetHistorySearch();
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
      resetHistorySearch();
      currentInput += data;
      terminal.write(data);
    }
  };

  const writeIntro = () => {
    writePrompt();
  };

  const focusTerminal = () => {
    terminal?.focus();
  };

  const openLink = (event: MouseEvent, uri: string) => {
    event.preventDefault();
    event.stopPropagation();

    const openedWindow = window.open(uri, "_blank", "noopener,noreferrer");

    if (openedWindow) {
      openedWindow.opener = null;
    }
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
      cursorStyle: "bar",
      fontFamily: terminalFontFamily,
      fontSize: getTerminalFontSize(),
      lineHeight: 1.25,
      reflowCursorLine: true,
      rows: 14,
      scrollback: 200,
      smoothScrollDuration: 80,
      theme: {
        background: "#050505",
        black: "#050505",
        blue: "#38bdf8",
        brightBlack: "#6b7280",
        brightWhite: "#ffffff",
        cursor: "#79cd88",
        foreground: "#f8fafc",
        green: "#86efac",
        red: "#f87171",
        selectionBackground: "#79cd8855",
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

      if (messageComposer) {
        renderMessageComposer();
      }
    };
    const scheduleFit = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(fitTerminal);
    };
    const resizeObserver = new ResizeObserver(scheduleFit);

    resizeObserver.observe(terminalElement);
    window.addEventListener("resize", scheduleFit);
    document.fonts?.ready.then(scheduleFit).catch(() => undefined);
    fitTerminal();

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

<div class="terminal-shell">
  <div class="terminal-titlebar">
    <div class="terminal-title-tab">Web Terminal</div>
    <a
      class="terminal-wiki-link border-l border-t border-r border-black bg-yellow-50 px-2 py-1 hover:bg-yellow-100"
      href="https://wiki.rytsh.io"
    >
      Personal Wiki
    </a>
  </div>
  <div
    aria-label="Interactive terminal"
    bind:this={terminalElement}
    class="terminal-screen h-[calc(100dvh-12rem)] min-h-[16rem] w-full min-w-0 max-w-full border border-black bg-black p-2"
  ></div>
</div>

<style>
  .terminal-shell {
    max-width: 100%;
    min-width: 0;
    width: 100%;
  }

  .terminal-titlebar {
    align-items: flex-end;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .terminal-title-tab {
    background-color: #f3f4f6;
    border: 1px solid #000;
    border-bottom: 0;
    border-right: 0;
    color: #000;
    flex: 0 1 auto;
    font-family: "JetBrains Mono", "SFMono-Regular", "Cascadia Mono",
      "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", monospace;
    font-size: 0.875rem;
    line-height: 1;
    min-width: 0;
    padding: 0.45rem 1.25rem 0.45rem 0.65rem;
    position: relative;
    white-space: nowrap;
  }

  .terminal-title-tab::after {
    background-color: #000;
    content: "";
    height: calc(100% + 1px);
    left: 100%;
    position: absolute;
    top: -1px;
    transform: skewX(30deg);
    transform-origin: top left;
    width: 1px;
  }

  .terminal-wiki-link {
    flex: 0 0 auto;
    line-height: 1.1;
    position: relative;
    z-index: 2;
  }

  .terminal-screen {
    box-shadow: none;
    max-width: 100%;
    overflow: hidden;
  }

  .terminal-screen :global(.xterm) {
    font-family: "JetBrains Mono", "SFMono-Regular", "Cascadia Mono",
      "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", monospace !important;
    height: 100%;
    max-width: 100%;
  }

  .terminal-screen :global(.xterm-viewport) {
    background-color: transparent !important;
    overflow-y: auto;
  }
</style>
