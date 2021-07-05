// ==UserScript==
// @name         Invisible Text
// @namespace    https://thao.pw
// @version      0.4
// @description  FB Messenger invisible text
// @author       T-Rekt
// @match        https://*.facebook.com/*
// @match        https://*.messenger.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  // Thank you zws

  const PADDING = "\u200c";

  const CHARS = [
    // "\u200d",
    "\u{e0061}",
    "\u{e0062}",
    "\u{e0063}",
    "\u{e0064}",
    "\u{e0065}",
    "\u{e0066}",
    "\u{e0067}",
    "\u{e0068}",
    "\u{e0069}",
    "\u{e006a}",
    "\u{e006b}",
    "\u{e006c}",
    "\u{e006d}",
    "\u{e006e}",
    "\u{e006f}",
    "\u{e0070}",
    "\u{e0071}",
    "\u{e0072}",
    "\u{e0073}",
    "\u{e0074}",
    "\u{e0075}",
    "\u{e0076}",
    "\u{e0077}",
    "\u{e0078}",
    "\u{e0079}",
    "\u{e007a}",
    "\u{e007f}",
  ];

  const CHARS_MAP = CHARS.reduce((curr, val, i) => {
    curr[val] = i;

    return curr;
  }, {});

  const lenCalc = (base, chars) => {
    var len = 0;

    var curr = 1;

    while (curr < chars) {
      curr *= base;
      len++;
    }

    return len;
  };

  const UNICODE_CHARS = 1114112;
  const BASE = CHARS.length;
  const LEN = lenCalc(BASE, UNICODE_CHARS);

  const charConvert = (char) => {
    let charCode = char.codePointAt(0);
    let arr = [];

    while (charCode > 0) {
      arr.push(charCode % BASE);
      charCode = ~~(charCode / BASE);
    }

    while (arr.length < LEN) {
      arr.push(0);
    }

    return arr.reverse();
  };

  const charEncode = (convertedChar) => {
    return convertedChar.reduce((curr, digit) => curr + CHARS[digit], "");
  };

  const encode = (s) => {
    let converted = [];

    for (let c of s) {
      converted.push(charConvert(c));
    }

    let res = converted.map(charEncode);

    return PADDING + res.join("");
  };

  const decodeChar = (encodedChar) => {
    encodedChar = encodedChar.reverse();

    let curr = 1;
    let charCode = 0;

    for (let digit of encodedChar) {
      charCode += digit * curr;
      curr *= BASE;
    }

    return String.fromCodePoint(charCode);
  };

  const decode = (s) => {
    s = s.substr(1);

    let curr = [];
    let res = "";

    for (let c of s) {
      curr.push(CHARS_MAP[c]);

      if (curr.length >= LEN) {
        res += decodeChar(curr);
        curr = [];
      }
    }

    return res;
  };

  const checkEncode = (s) => {
    if (s[0] != PADDING) return false;

    s = s.substr(1);

    for (let c of s) if (CHARS_MAP[c] === undefined) return false;

    return true;
  };

  requireLazy(
    [
      "MWChatBubbleBAF.bs",
      "MWChatBubbleSolid.bs",
      "MWChatOutgoingMessageDefaultRenderer.bs",
      "MqttProtocolClient",
    ],
    (BAF, solid, outgoing, protocolClient) => {
      // Reply
      const makeOrigBAF = BAF.make;
      BAF.make = function (a) {
        if (a?.content?.props?.children?.props?.text) {
          // a.content.props.children.props.text = "Patched reply message";

          let text = a.content.props.children.props.text;

          if (checkEncode(text))
            a.content.props.children.props.text = decode(text);
        }

        return makeOrigBAF.apply(this, arguments);
      };

      // Incoming
      const makeOrigSolid = solid.make;
      solid.make = function (a) {
        if (a?.content?.props?.text) {
          // a.content.props.text = "Patched incoming message";

          let text = a.content.props.text;

          if (checkEncode(text)) a.content.props.text = decode(text);
        }

        return makeOrigSolid.apply(this, arguments);
      };

      // Outgoing
      const makeOrigOutGoing = outgoing.make;
      outgoing.make = function (a) {
        if (a?.children?.props?.text) {
          // a.children.props.text = "Patched outgoing message";

          let text = a.children.props.text;

          if (checkEncode(text)) a.children.props.text = decode(text);
        }

        return makeOrigOutGoing.apply(this, arguments);
      };

      // Message publish
      const publishOrig = protocolClient.prototype.publish;
      protocolClient.prototype.publish = function () {
        let b = arguments[1];

        if (b && b.includes('\\\\\\"text\\\\\\":')) {
          (function () {
            b = JSON.parse(b);

            if (!b || !b.payload) return;

            let payload = JSON.parse(b.payload);

            if (!payload || !payload.tasks) return;

            payload.tasks = payload.tasks.map((task) => {
              let payload = JSON.parse(task.payload);

              if (!payload || !payload.text) return task;

              if (payload.text.length > 1 && payload.text[0] === '>') {
                payload.text = encode(payload.text.substr(1));
              }

              task.payload = JSON.stringify(payload);

              return task;
            });

            b.payload = JSON.stringify(payload);

            b = JSON.stringify(b);
          })();

          arguments[1] = b;
        }

        return publishOrig.apply(this, arguments);
      };
    }
  );
})();
