// ==UserScript==
// @name         FB Invisible Message
// @namespace    https://thao.pw
// @version      2.0
// @description  FB Messenger invisible text
// @author       T-Rekt
// @match        https://*.facebook.com/*
// @match        https://*.messenger.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  // Thank you zws

  const PADDING_START = "\u200c";
  const PADDING_END = "\u{e0061}";

  const CHARS = [
    // "\u200d",
    // "\u{e0061}",
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

  const shouldEncodePattern = / *>(.+?)< */;
  const encodedPattern = new RegExp(`${PADDING_START}([${CHARS.join('')}]+?)${PADDING_END}`);

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

    return PADDING_START + res.join("") + PADDING_END;
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
    s = encodedPattern.exec(s)[1];

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
    //console.log(s);

    return encodedPattern.exec(s);
  };

  requireLazy(
    ["MWUnvaultedText", "MAWSecureComposerText"],
    (MWUnvaultedText, MAWSecureComposerText) => {
    //   console.log({ MWUnvaultedText, MAWSecureComposerText });

      const useMWUnvaultedTextOrig = MWUnvaultedText.useMWUnvaultedText;

      MWUnvaultedText.useMWUnvaultedText = function(isSecure, vaultedText) {
        let text = useMWUnvaultedTextOrig(isSecure, vaultedText);

        if (checkEncode(text)) {
            text = `Encrypted message: ${text.replace(encodedPattern, `>${decode(text)}<`)}`;
        }

        // console.log({ text });
        return text;
      };

      const getTextFromEditorStateOrig = MAWSecureComposerText.getTextFromEditorState;

      MAWSecureComposerText.getTextFromEditorState = function(editorState) {
        // console.log({ editorState });

        let text = getTextFromEditorStateOrig.call(this, editorState);
        
        let matches = shouldEncodePattern.exec(text);

        if (text.length > 1 && matches) {
            text = text.replace(shouldEncodePattern, ` ${encode(matches[1])}`);
        }

        return text;
      }
    }
  );
})();
