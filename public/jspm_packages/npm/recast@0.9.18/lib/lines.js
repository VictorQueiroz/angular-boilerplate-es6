/* */ 
var assert = require("assert");
var sourceMap = require("source-map");
var normalizeOptions = require("./options").normalize;
var secretKey = require("private").makeUniqueKey();
var types = require("./types");
var isString = types.builtInTypes.string;
var comparePos = require("./util").comparePos;
var Mapping = require("./mapping");
function getSecret(lines) {
  return lines[secretKey];
}
function Lines(infos, sourceFileName) {
  assert.ok(this instanceof Lines);
  assert.ok(infos.length > 0);
  if (sourceFileName) {
    isString.assert(sourceFileName);
  } else {
    sourceFileName = null;
  }
  Object.defineProperty(this, secretKey, {value: {
      infos: infos,
      mappings: [],
      name: sourceFileName,
      cachedSourceMap: null
    }});
  if (sourceFileName) {
    getSecret(this).mappings.push(new Mapping(this, {
      start: this.firstPos(),
      end: this.lastPos()
    }));
  }
}
exports.Lines = Lines;
var Lp = Lines.prototype;
Object.defineProperties(Lp, {
  length: {get: function() {
      return getSecret(this).infos.length;
    }},
  name: {get: function() {
      return getSecret(this).name;
    }}
});
function copyLineInfo(info) {
  return {
    line: info.line,
    indent: info.indent,
    sliceStart: info.sliceStart,
    sliceEnd: info.sliceEnd
  };
}
var fromStringCache = {};
var hasOwn = fromStringCache.hasOwnProperty;
var maxCacheKeyLen = 10;
function countSpaces(spaces, tabWidth) {
  var count = 0;
  var len = spaces.length;
  for (var i = 0; i < len; ++i) {
    switch (spaces.charCodeAt(i)) {
      case 9:
        assert.strictEqual(typeof tabWidth, "number");
        assert.ok(tabWidth > 0);
        var next = Math.ceil(count / tabWidth) * tabWidth;
        if (next === count) {
          count += tabWidth;
        } else {
          count = next;
        }
        break;
      case 11:
      case 12:
      case 13:
      case 0xfeff:
        break;
      case 32:
      default:
        count += 1;
        break;
    }
  }
  return count;
}
exports.countSpaces = countSpaces;
var leadingSpaceExp = /^\s*/;
function fromString(string, options) {
  if (string instanceof Lines)
    return string;
  string += "";
  var tabWidth = options && options.tabWidth;
  var tabless = string.indexOf("\t") < 0;
  var cacheable = !options && tabless && (string.length <= maxCacheKeyLen);
  assert.ok(tabWidth || tabless, "No tab width specified but encountered tabs in string\n" + string);
  if (cacheable && hasOwn.call(fromStringCache, string))
    return fromStringCache[string];
  var lines = new Lines(string.split("\n").map(function(line) {
    var spaces = leadingSpaceExp.exec(line)[0];
    return {
      line: line,
      indent: countSpaces(spaces, tabWidth),
      sliceStart: spaces.length,
      sliceEnd: line.length
    };
  }), normalizeOptions(options).sourceFileName);
  if (cacheable)
    fromStringCache[string] = lines;
  return lines;
}
exports.fromString = fromString;
function isOnlyWhitespace(string) {
  return !/\S/.test(string);
}
Lp.toString = function(options) {
  return this.sliceString(this.firstPos(), this.lastPos(), options);
};
Lp.getSourceMap = function(sourceMapName, sourceRoot) {
  if (!sourceMapName) {
    return null;
  }
  var targetLines = this;
  function updateJSON(json) {
    json = json || {};
    isString.assert(sourceMapName);
    json.file = sourceMapName;
    if (sourceRoot) {
      isString.assert(sourceRoot);
      json.sourceRoot = sourceRoot;
    }
    return json;
  }
  var secret = getSecret(targetLines);
  if (secret.cachedSourceMap) {
    return updateJSON(secret.cachedSourceMap.toJSON());
  }
  var smg = new sourceMap.SourceMapGenerator(updateJSON());
  var sourcesToContents = {};
  secret.mappings.forEach(function(mapping) {
    var sourceCursor = mapping.sourceLines.skipSpaces(mapping.sourceLoc.start) || mapping.sourceLines.lastPos();
    var targetCursor = targetLines.skipSpaces(mapping.targetLoc.start) || targetLines.lastPos();
    while (comparePos(sourceCursor, mapping.sourceLoc.end) < 0 && comparePos(targetCursor, mapping.targetLoc.end) < 0) {
      var sourceChar = mapping.sourceLines.charAt(sourceCursor);
      var targetChar = targetLines.charAt(targetCursor);
      assert.strictEqual(sourceChar, targetChar);
      var sourceName = mapping.sourceLines.name;
      smg.addMapping({
        source: sourceName,
        original: {
          line: sourceCursor.line,
          column: sourceCursor.column
        },
        generated: {
          line: targetCursor.line,
          column: targetCursor.column
        }
      });
      if (!hasOwn.call(sourcesToContents, sourceName)) {
        var sourceContent = mapping.sourceLines.toString();
        smg.setSourceContent(sourceName, sourceContent);
        sourcesToContents[sourceName] = sourceContent;
      }
      targetLines.nextPos(targetCursor, true);
      mapping.sourceLines.nextPos(sourceCursor, true);
    }
  });
  secret.cachedSourceMap = smg;
  return smg.toJSON();
};
Lp.bootstrapCharAt = function(pos) {
  assert.strictEqual(typeof pos, "object");
  assert.strictEqual(typeof pos.line, "number");
  assert.strictEqual(typeof pos.column, "number");
  var line = pos.line,
      column = pos.column,
      strings = this.toString().split("\n"),
      string = strings[line - 1];
  if (typeof string === "undefined")
    return "";
  if (column === string.length && line < strings.length)
    return "\n";
  if (column >= string.length)
    return "";
  return string.charAt(column);
};
Lp.charAt = function(pos) {
  assert.strictEqual(typeof pos, "object");
  assert.strictEqual(typeof pos.line, "number");
  assert.strictEqual(typeof pos.column, "number");
  var line = pos.line,
      column = pos.column,
      secret = getSecret(this),
      infos = secret.infos,
      info = infos[line - 1],
      c = column;
  if (typeof info === "undefined" || c < 0)
    return "";
  var indent = this.getIndentAt(line);
  if (c < indent)
    return " ";
  c += info.sliceStart - indent;
  if (c === info.sliceEnd && line < this.length)
    return "\n";
  if (c >= info.sliceEnd)
    return "";
  return info.line.charAt(c);
};
Lp.stripMargin = function(width, skipFirstLine) {
  if (width === 0)
    return this;
  assert.ok(width > 0, "negative margin: " + width);
  if (skipFirstLine && this.length === 1)
    return this;
  var secret = getSecret(this);
  var lines = new Lines(secret.infos.map(function(info, i) {
    if (info.line && (i > 0 || !skipFirstLine)) {
      info = copyLineInfo(info);
      info.indent = Math.max(0, info.indent - width);
    }
    return info;
  }));
  if (secret.mappings.length > 0) {
    var newMappings = getSecret(lines).mappings;
    assert.strictEqual(newMappings.length, 0);
    secret.mappings.forEach(function(mapping) {
      newMappings.push(mapping.indent(width, skipFirstLine, true));
    });
  }
  return lines;
};
Lp.indent = function(by) {
  if (by === 0)
    return this;
  var secret = getSecret(this);
  var lines = new Lines(secret.infos.map(function(info) {
    if (info.line) {
      info = copyLineInfo(info);
      info.indent += by;
    }
    return info;
  }));
  if (secret.mappings.length > 0) {
    var newMappings = getSecret(lines).mappings;
    assert.strictEqual(newMappings.length, 0);
    secret.mappings.forEach(function(mapping) {
      newMappings.push(mapping.indent(by));
    });
  }
  return lines;
};
Lp.indentTail = function(by) {
  if (by === 0)
    return this;
  if (this.length < 2)
    return this;
  var secret = getSecret(this);
  var lines = new Lines(secret.infos.map(function(info, i) {
    if (i > 0 && info.line) {
      info = copyLineInfo(info);
      info.indent += by;
    }
    return info;
  }));
  if (secret.mappings.length > 0) {
    var newMappings = getSecret(lines).mappings;
    assert.strictEqual(newMappings.length, 0);
    secret.mappings.forEach(function(mapping) {
      newMappings.push(mapping.indent(by, true));
    });
  }
  return lines;
};
Lp.getIndentAt = function(line) {
  assert.ok(line >= 1, "no line " + line + " (line numbers start from 1)");
  var secret = getSecret(this),
      info = secret.infos[line - 1];
  return Math.max(info.indent, 0);
};
Lp.guessTabWidth = function() {
  var secret = getSecret(this);
  if (hasOwn.call(secret, "cachedTabWidth")) {
    return secret.cachedTabWidth;
  }
  var counts = [];
  var lastIndent = 0;
  for (var line = 1,
      last = this.length; line <= last; ++line) {
    var info = secret.infos[line - 1];
    var sliced = info.line.slice(info.sliceStart, info.sliceEnd);
    if (isOnlyWhitespace(sliced)) {
      continue;
    }
    var diff = Math.abs(info.indent - lastIndent);
    counts[diff] = ~~counts[diff] + 1;
    lastIndent = info.indent;
  }
  var maxCount = -1;
  var result = 2;
  for (var tabWidth = 1; tabWidth < counts.length; tabWidth += 1) {
    if (hasOwn.call(counts, tabWidth) && counts[tabWidth] > maxCount) {
      maxCount = counts[tabWidth];
      result = tabWidth;
    }
  }
  return secret.cachedTabWidth = result;
};
Lp.isOnlyWhitespace = function() {
  return isOnlyWhitespace(this.toString());
};
Lp.isPrecededOnlyByWhitespace = function(pos) {
  var secret = getSecret(this);
  var info = secret.infos[pos.line - 1];
  var indent = Math.max(info.indent, 0);
  var diff = pos.column - indent;
  if (diff <= 0) {
    return true;
  }
  var start = info.sliceStart;
  var end = Math.min(start + diff, info.sliceEnd);
  var prefix = info.line.slice(start, end);
  return isOnlyWhitespace(prefix);
};
Lp.getLineLength = function(line) {
  var secret = getSecret(this),
      info = secret.infos[line - 1];
  return this.getIndentAt(line) + info.sliceEnd - info.sliceStart;
};
Lp.nextPos = function(pos, skipSpaces) {
  var l = Math.max(pos.line, 0),
      c = Math.max(pos.column, 0);
  if (c < this.getLineLength(l)) {
    pos.column += 1;
    return skipSpaces ? !!this.skipSpaces(pos, false, true) : true;
  }
  if (l < this.length) {
    pos.line += 1;
    pos.column = 0;
    return skipSpaces ? !!this.skipSpaces(pos, false, true) : true;
  }
  return false;
};
Lp.prevPos = function(pos, skipSpaces) {
  var l = pos.line,
      c = pos.column;
  if (c < 1) {
    l -= 1;
    if (l < 1)
      return false;
    c = this.getLineLength(l);
  } else {
    c = Math.min(c - 1, this.getLineLength(l));
  }
  pos.line = l;
  pos.column = c;
  return skipSpaces ? !!this.skipSpaces(pos, true, true) : true;
};
Lp.firstPos = function() {
  return {
    line: 1,
    column: 0
  };
};
Lp.lastPos = function() {
  return {
    line: this.length,
    column: this.getLineLength(this.length)
  };
};
Lp.skipSpaces = function(pos, backward, modifyInPlace) {
  if (pos) {
    pos = modifyInPlace ? pos : {
      line: pos.line,
      column: pos.column
    };
  } else if (backward) {
    pos = this.lastPos();
  } else {
    pos = this.firstPos();
  }
  if (backward) {
    while (this.prevPos(pos)) {
      if (!isOnlyWhitespace(this.charAt(pos)) && this.nextPos(pos)) {
        return pos;
      }
    }
    return null;
  } else {
    while (isOnlyWhitespace(this.charAt(pos))) {
      if (!this.nextPos(pos)) {
        return null;
      }
    }
    return pos;
  }
};
Lp.trimLeft = function() {
  var pos = this.skipSpaces(this.firstPos(), false, true);
  return pos ? this.slice(pos) : emptyLines;
};
Lp.trimRight = function() {
  var pos = this.skipSpaces(this.lastPos(), true, true);
  return pos ? this.slice(this.firstPos(), pos) : emptyLines;
};
Lp.trim = function() {
  var start = this.skipSpaces(this.firstPos(), false, true);
  if (start === null)
    return emptyLines;
  var end = this.skipSpaces(this.lastPos(), true, true);
  assert.notStrictEqual(end, null);
  return this.slice(start, end);
};
Lp.eachPos = function(callback, startPos, skipSpaces) {
  var pos = this.firstPos();
  if (startPos) {
    pos.line = startPos.line, pos.column = startPos.column;
  }
  if (skipSpaces && !this.skipSpaces(pos, false, true)) {
    return ;
  }
  do
    callback.call(this, pos);
 while (this.nextPos(pos, skipSpaces));
};
Lp.bootstrapSlice = function(start, end) {
  var strings = this.toString().split("\n").slice(start.line - 1, end.line);
  strings.push(strings.pop().slice(0, end.column));
  strings[0] = strings[0].slice(start.column);
  return fromString(strings.join("\n"));
};
Lp.slice = function(start, end) {
  if (!end) {
    if (!start) {
      return this;
    }
    end = this.lastPos();
  }
  var secret = getSecret(this);
  var sliced = secret.infos.slice(start.line - 1, end.line);
  if (start.line === end.line) {
    sliced[0] = sliceInfo(sliced[0], start.column, end.column);
  } else {
    assert.ok(start.line < end.line);
    sliced[0] = sliceInfo(sliced[0], start.column);
    sliced.push(sliceInfo(sliced.pop(), 0, end.column));
  }
  var lines = new Lines(sliced);
  if (secret.mappings.length > 0) {
    var newMappings = getSecret(lines).mappings;
    assert.strictEqual(newMappings.length, 0);
    secret.mappings.forEach(function(mapping) {
      var sliced = mapping.slice(this, start, end);
      if (sliced) {
        newMappings.push(sliced);
      }
    }, this);
  }
  return lines;
};
function sliceInfo(info, startCol, endCol) {
  var sliceStart = info.sliceStart;
  var sliceEnd = info.sliceEnd;
  var indent = Math.max(info.indent, 0);
  var lineLength = indent + sliceEnd - sliceStart;
  if (typeof endCol === "undefined") {
    endCol = lineLength;
  }
  startCol = Math.max(startCol, 0);
  endCol = Math.min(endCol, lineLength);
  endCol = Math.max(endCol, startCol);
  if (endCol < indent) {
    indent = endCol;
    sliceEnd = sliceStart;
  } else {
    sliceEnd -= lineLength - endCol;
  }
  lineLength = endCol;
  lineLength -= startCol;
  if (startCol < indent) {
    indent -= startCol;
  } else {
    startCol -= indent;
    indent = 0;
    sliceStart += startCol;
  }
  assert.ok(indent >= 0);
  assert.ok(sliceStart <= sliceEnd);
  assert.strictEqual(lineLength, indent + sliceEnd - sliceStart);
  if (info.indent === indent && info.sliceStart === sliceStart && info.sliceEnd === sliceEnd) {
    return info;
  }
  return {
    line: info.line,
    indent: indent,
    sliceStart: sliceStart,
    sliceEnd: sliceEnd
  };
}
Lp.bootstrapSliceString = function(start, end, options) {
  return this.slice(start, end).toString(options);
};
Lp.sliceString = function(start, end, options) {
  if (!end) {
    if (!start) {
      return this;
    }
    end = this.lastPos();
  }
  options = normalizeOptions(options);
  var infos = getSecret(this).infos;
  var parts = [];
  var tabWidth = options.tabWidth;
  for (var line = start.line; line <= end.line; ++line) {
    var info = infos[line - 1];
    if (line === start.line) {
      if (line === end.line) {
        info = sliceInfo(info, start.column, end.column);
      } else {
        info = sliceInfo(info, start.column);
      }
    } else if (line === end.line) {
      info = sliceInfo(info, 0, end.column);
    }
    var indent = Math.max(info.indent, 0);
    var before = info.line.slice(0, info.sliceStart);
    if (options.reuseWhitespace && isOnlyWhitespace(before) && countSpaces(before, options.tabWidth) === indent) {
      parts.push(info.line.slice(0, info.sliceEnd));
      continue;
    }
    var tabs = 0;
    var spaces = indent;
    if (options.useTabs) {
      tabs = Math.floor(indent / tabWidth);
      spaces -= tabs * tabWidth;
    }
    var result = "";
    if (tabs > 0) {
      result += new Array(tabs + 1).join("\t");
    }
    if (spaces > 0) {
      result += new Array(spaces + 1).join(" ");
    }
    result += info.line.slice(info.sliceStart, info.sliceEnd);
    parts.push(result);
  }
  return parts.join("\n");
};
Lp.isEmpty = function() {
  return this.length < 2 && this.getLineLength(1) < 1;
};
Lp.join = function(elements) {
  var separator = this;
  var separatorSecret = getSecret(separator);
  var infos = [];
  var mappings = [];
  var prevInfo;
  function appendSecret(secret) {
    if (secret === null)
      return ;
    if (prevInfo) {
      var info = secret.infos[0];
      var indent = new Array(info.indent + 1).join(" ");
      var prevLine = infos.length;
      var prevColumn = Math.max(prevInfo.indent, 0) + prevInfo.sliceEnd - prevInfo.sliceStart;
      prevInfo.line = prevInfo.line.slice(0, prevInfo.sliceEnd) + indent + info.line.slice(info.sliceStart, info.sliceEnd);
      prevInfo.sliceEnd = prevInfo.line.length;
      if (secret.mappings.length > 0) {
        secret.mappings.forEach(function(mapping) {
          mappings.push(mapping.add(prevLine, prevColumn));
        });
      }
    } else if (secret.mappings.length > 0) {
      mappings.push.apply(mappings, secret.mappings);
    }
    secret.infos.forEach(function(info, i) {
      if (!prevInfo || i > 0) {
        prevInfo = copyLineInfo(info);
        infos.push(prevInfo);
      }
    });
  }
  function appendWithSeparator(secret, i) {
    if (i > 0)
      appendSecret(separatorSecret);
    appendSecret(secret);
  }
  elements.map(function(elem) {
    var lines = fromString(elem);
    if (lines.isEmpty())
      return null;
    return getSecret(lines);
  }).forEach(separator.isEmpty() ? appendSecret : appendWithSeparator);
  if (infos.length < 1)
    return emptyLines;
  var lines = new Lines(infos);
  getSecret(lines).mappings = mappings;
  return lines;
};
exports.concat = function(elements) {
  return emptyLines.join(elements);
};
Lp.concat = function(other) {
  var args = arguments,
      list = [this];
  list.push.apply(list, args);
  assert.strictEqual(list.length, args.length + 1);
  return emptyLines.join(list);
};
var emptyLines = fromString("");
