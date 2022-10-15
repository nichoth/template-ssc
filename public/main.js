"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/@socketsupply/ssc-node/index.cjs
var require_ssc_node = __commonJS({
  "node_modules/@socketsupply/ssc-node/index.cjs"(exports, module2) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name((target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toCommonJS = /* @__PURE__ */ __name((mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var ssc_node_exports = {};
    __export(ssc_node_exports, {
      default: () => ssc_node_default,
      system: () => system2
    });
    module2.exports = __toCommonJS(ssc_node_exports);
    var import_util = require("util");
    var import_fs = require("fs");
    var AUTO_CLOSE = process.env.AUTO_CLOSE;
    var MAX_MESSAGE_KB = 512 * 1024;
    function isObject(o) {
      return o && typeof o === "object" && !Array.isArray(o);
    }
    __name(isObject, "isObject");
    var write = /* @__PURE__ */ __name((s) => {
      if (s.includes("\n")) {
        throw new Error("invalid write()");
      }
      if (s.length > MAX_MESSAGE_KB) {
        const len = Math.ceil(s.length / 1024);
        process.stderr.write("WARNING: Sending large message to webview: " + len + "kb\n");
        process.stderr.write("RAW MESSAGE: " + s.slice(0, 512) + "...\n");
      }
      return new Promise((resolve) => process.stdout.write(s + "\n", resolve));
    }, "write");
    console.log = (...args) => {
      const s = args.map((v) => (0, import_util.format)(v)).join(" ");
      const enc = encodeURIComponent(s);
      write(`ipc://stdout?value=${enc}`);
    };
    console.error = console.log;
    process.on("exit", (exitCode) => {
      const seq = String(ipc.nextSeq++);
      let value = new URLSearchParams({
        index: "0",
        seq,
        value: String(exitCode)
      }).toString();
      value = value.replace(/\+/g, "%20");
      (0, import_fs.writeSync)(1, `ipc://exit?${value}
`);
      try {
        (0, import_fs.fsyncSync)(1);
      } catch (_) {
      }
    });
    var ipc = { nextSeq: 0 };
    ipc.resolve = async (seq, state, value) => {
      const method = !Number(state) ? "resolve" : "reject";
      if (!ipc[seq] || !ipc[seq][method])
        return;
      try {
        await ipc[seq][method](value);
      } finally {
        delete ipc[seq];
      }
    };
    ipc.request = async (cmd, opts) => {
      const seq = ipc.nextSeq++;
      let value = "";
      const promise = new Promise((resolve, reject) => {
        ipc[seq] = {
          resolve,
          reject
        };
      });
      try {
        if (typeof opts.value === "object") {
          opts.value = JSON.stringify(opts.value);
        }
        value = new URLSearchParams({
          ...opts,
          index: opts.window || "0",
          seq,
          value: opts.value || "0"
        }).toString();
        value = value.replace(/\+/g, "%20");
      } catch (err) {
        console.error(`Cannot encode request ${err.message} (${value})`);
        return Promise.reject(err);
      }
      await write(`ipc://${cmd}?${value}`);
      return promise;
    };
    ipc.send = async (o) => {
      try {
        o = JSON.parse(JSON.stringify(o));
      } catch (err) {
        console.error(`Cannot encode data to send via IPC:
${err.message}`);
        return Promise.reject(err);
      }
      if (typeof o.value === "object") {
        o.value = JSON.stringify(o.value);
      }
      let s = new URLSearchParams({
        event: o.event,
        index: o.window || "0",
        value: o.value
      }).toString();
      s = s.replace(/\+/g, "%20");
      await write(`ipc://send?${s}`);
    };
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    var buf = "";
    async function handleMessage(data) {
      const messages = data.split("\n");
      if (messages.length === 1) {
        buf += data;
        return;
      }
      const firstMsg = buf + messages[0];
      parse(firstMsg);
      for (let i = 1; i < messages.length - 1; i++) {
        parse(messages[i]);
      }
      buf = messages[messages.length - 1];
    }
    __name(handleMessage, "handleMessage");
    async function receiveOpNode(_command, value) {
      if (value?.method === "testUncaught") {
        const opts = value.arguments[0];
        console.error("Got an uncaught in test", opts);
        process.nextTick(() => {
          throw new Error("FRONTEND TEST UNCAUGHT: " + opts.err.message);
        });
      } else if (value?.method === "testConsole") {
        const opts = value.arguments[0];
        const args = JSON.parse(opts.args);
        const firstArg = args[0];
        console.log(...args);
        if (typeof firstArg !== "string") {
          return {};
        }
        let exitCode = -1;
        if (firstArg.indexOf("# ok") === 0) {
          exitCode = 0;
        } else if (firstArg.indexOf("# fail ") === 0) {
          exitCode = 1;
        }
        if (exitCode !== -1 && AUTO_CLOSE !== "false") {
          setTimeout(() => {
            api.exit({ value: exitCode });
          }, 50);
        }
        return {};
      }
    }
    __name(receiveOpNode, "receiveOpNode");
    async function parse(data) {
      let cmd = "";
      let index = "0";
      let seq = "0";
      let state = "0";
      let value = "";
      if (data.length > MAX_MESSAGE_KB) {
        const len = Math.ceil(data.length / 1024);
        process.stderr.write("WARNING: Receiving large message from webview: " + len + "kb\n");
        process.stderr.write("RAW MESSAGE: " + data.slice(0, 512) + "...\n");
      }
      try {
        const u = new URL(data);
        const o = Object.fromEntries(u.searchParams);
        cmd = u.host;
        seq = o.seq;
        index = o.index;
        state = o.state || "0";
        if (o.value) {
          value = JSON.parse(o.value);
        }
      } catch (err) {
        const dataStart = data.slice(0, 100);
        const dataEnd = data.slice(data.length - 100);
        console.error(`Unable to parse stdin message ${err.code} ${err.message.slice(0, 100)} (${dataStart}...${dataEnd})`);
        throw new Error(`Unable to parse stdin message ${err.code} ${err.message.slice(0, 20)}`);
      }
      if (cmd === "resolve") {
        return ipc.resolve(seq, state, value);
      }
      let resultObj;
      let result = "";
      try {
        if (isObject(value) && Reflect.get(value, "api") === "ssc-node") {
          resultObj = await receiveOpNode(cmd, value);
        } else {
          resultObj = await api.receive(cmd, value);
        }
      } catch (err) {
        resultObj = {
          err: { message: err.message }
        };
        state = "1";
      }
      if (resultObj === void 0) {
        resultObj = null;
      }
      try {
        result = JSON.stringify(resultObj);
      } catch (err) {
        state = "1";
        result = JSON.stringify({
          err: { message: err.message }
        });
      }
      let s = new URLSearchParams({
        seq,
        state,
        index,
        value: result
      }).toString();
      s = s.replace(/\+/g, "%20");
      await write(`ipc://resolve?${s}`);
    }
    __name(parse, "parse");
    process.stdin.on("data", handleMessage);
    var api = {
      show(o) {
        return ipc.request("show", o);
      },
      hide(o) {
        return ipc.request("hide", o);
      },
      navigate(o) {
        return ipc.request("navigate", o);
      },
      setTitle(o) {
        return ipc.request("title", o);
      },
      setSize(o) {
        return ipc.request("size", o);
      },
      getScreenSize() {
        return ipc.request("getScreenSize", { value: {} });
      },
      exit(o) {
        return ipc.request("exit", o);
      },
      setMenu(o) {
        const menu = o.value;
        if (typeof menu !== "string" || menu.trim().length === 0) {
          throw new Error("Menu must be a non-empty string");
        }
        const menus = menu.match(/\w+:\n/g);
        if (!menus) {
          throw new Error("Menu must have a valid format");
        }
        const menuTerminals = menu.match(/;/g);
        const delta = menus.length - (menuTerminals?.length ?? 0);
        if (delta !== 0 && delta !== -1) {
          throw new Error(`Expected ${menuTerminals.length} ';', found ${menus}.`);
        }
        const lines = menu.split("\n");
        const e = new Error();
        const frame = e.stack.split("\n")[2];
        const callerLineNo = frame.split(":").reverse()[1];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const l = Number(callerLineNo) + i;
          let errMsg;
          if (line.trim().length === 0)
            continue;
          if (/.*:\n/.test(line))
            continue;
          if (/---/.test(line))
            continue;
          if (/\w+/.test(line) && !line.includes(":")) {
            errMsg = "Missing label";
          } else if (/:\s*\+/.test(line)) {
            errMsg = "Missing accelerator";
          } else if (/\+(\n|$)/.test(line)) {
            errMsg = "Missing modifier";
          }
          if (errMsg) {
            throw new Error(`${errMsg} on line ${l}: "${line}"`);
          }
        }
        return ipc.request("menu", o);
      },
      setMenuItemEnabled(o) {
        return ipc.request("menuItemEnabled", o);
      },
      openExternal(o) {
        return ipc.request("external", o);
      },
      send(o) {
        return ipc.send(o);
      },
      restart() {
        return ipc.request("restart", {});
      },
      heartbeat() {
        return ipc.request("heartbeat", {});
      },
      receive(command, value) {
        console.error(`Receive Not Implemented.
Command: ${command}
Value: ${value}`);
        return { err: new Error("Not Implemented!") };
      }
    };
    var system2 = api;
    var ssc_node_default = api;
  }
});

// node_modules/untildify/index.js
var require_untildify = __commonJS({
  "node_modules/untildify/index.js"(exports, module2) {
    "use strict";
    var os = require("os");
    var homeDirectory = os.homedir();
    module2.exports = (pathWithTilde) => {
      if (typeof pathWithTilde !== "string") {
        throw new TypeError(`Expected a string, got ${typeof pathWithTilde}`);
      }
      return homeDirectory ? pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory) : pathWithTilde;
    };
  }
});

// src/main/index.js
var { system } = require_ssc_node();
var path = require("path");
var untildify = require_untildify();
var Env = class {
  get() {
    try {
      return {
        err: null,
        data: {
          home: untildify("~")
        }
      };
    } catch (err) {
      return { err, data: null };
    }
  }
};
__name(Env, "Env");
async function main() {
  const screen = await system.getScreenSize();
  const env = new Env();
  await system.setSize({
    window: 0,
    height: Math.min(900, screen.height * 0.8),
    width: Math.min(1440, screen.width * 0.8)
  });
  await system.show({ window: 0 });
  await system.setTitle({
    window: 0,
    value: "wooo"
  });
  system.receive = /* @__PURE__ */ __name(function _receive(command, arg) {
    if (command !== "send") {
      return {
        err: new Error("not send")
      };
    }
    if (!arg) {
      return {
        err: new Error("missing arg")
      };
    }
    if (arg.api !== "env") {
      return {
        err: new Error(`Unknown method (${arg.api}, ${arg.method})`)
      };
    }
    if (arg.method !== "get") {
      return {
        err: new Error(`Unknown method (${arg.api}, ${arg.method})`)
      };
    }
    return env.get();
  }, "_receive");
  const resourcesDirectory = path.dirname(process.argv[1]);
  const file = path.join(resourcesDirectory, "index.html");
  await system.navigate({ window: 0, value: `file://${file}` });
  system.send({ window: 0, event: "backend.ready", value: true });
}
__name(main, "main");
main().then(null, (err) => {
  process.nextTick(() => {
    throw err;
  });
});
