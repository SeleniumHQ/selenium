#!/usr/bin/env node
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Generates a Closure-compatible shim from a TypeScript module.
 *
 * This script parses a TypeScript file to extract its exports and generates
 * a JavaScript shim that exposes those exports via goog.provide, allowing
 * existing Closure-based tests to continue working during the migration.
 *
 * The generated shim uses proper Closure JSDoc annotations so that the
 * Closure Compiler understands the types without needing suppressions.
 *
 * Usage: node generate-shim.js <ts-file> <closure-namespace> <compiled-js-path>
 * Example: node generate-shim.js bot.ts bot ../dist/bot.js
 */

const fs = require('fs');
const path = require('path');

// Namespace mapping: TypeScript file basename -> Closure namespace
const NAMESPACE_MAP = {
  'bot': 'bot',
  'dom': 'bot.dom',
  'domcore': 'bot.dom.core',
  'css': 'bot.locators.css',
  'action': 'bot.action',
  'mouse': 'bot.mouse',
  'keyboard': 'bot.keyboard',
  'touchscreen': 'bot.touchscreen',
  'device': 'bot.device',
  'color': 'bot.color',
  'error': 'bot',
  'response': 'bot.response',
  'events': 'bot.events',
  'userAgent': 'bot.userAgent',
  'json': 'bot.json',
  'inject': 'bot.inject',
  'frame': 'bot.frame',
  'window': 'bot.window',
};

// Dependencies mapping by file (not namespace) - which Closure modules each file requires
const FILE_DEPS_MAP = {
  'bot': [],
  'error': ['goog.utils'],  // error.ts uses goog.utils.inherits
  'response': ['bot.Error', 'bot.ErrorCode'],
  'color': [],
  'userAgent': [
    'goog.string',
    'goog.userAgent',
    'goog.userAgent.product',
    'goog.userAgent.product.isVersion',
  ],
  'json': [],
  'domcore': ['bot.Error', 'bot.ErrorCode', 'bot.userAgent'],
  'css': ['bot.Error', 'bot.ErrorCode'],
  'dom': ['bot.dom.core', 'bot.color', 'bot.userAgent', 'bot.locators.css'],
  'action': ['bot', 'bot.dom', 'bot.Error', 'bot.events'],
  'events': ['bot', 'bot.dom', 'bot.Error', 'bot.userAgent'],
};

// Export rename mapping: TypeScript export name -> Closure export name
const EXPORT_RENAME_MAP = {
  'error': {
    'BotError': 'Error',
    'State': 'Error.State',
  },
};

// Additional provides for files that need to provide multiple namespaces
const ADDITIONAL_PROVIDES_MAP = {
  'error': ['bot.Error', 'bot.ErrorCode'],
  'response': ['bot.response', 'bot.response.ResponseObject'],
};

// Import alias mapping: maps TypeScript import names to their Closure equivalents
const IMPORT_ALIAS_MAP = {
  'response': {
    'BotError': 'bot.Error',
    'ErrorCode': 'bot.ErrorCode',
  },
};

// Symbol replacement mapping for each file: local symbol -> Closure namespace symbol
// Applied when extracting code from compiled JS
const SYMBOL_REPLACEMENTS = {
  'error': {
    'State': 'bot.Error.State',
    'ErrorCode': 'bot.ErrorCode',
    'CODE_TO_STATE': 'bot.Error.CODE_TO_STATE_',
  },
  'response': {
    'BotError': 'bot.Error',
    'ErrorCode': 'bot.ErrorCode',
    'isResponseObject': 'bot.response.isResponseObject',
  },
  'domcore': {
    'BotError': 'bot.Error',
    'ErrorCode': 'bot.ErrorCode',
    'IE_DOC_PRE8': 'bot.userAgent.IE_DOC_PRE8',
    'IE_DOC_PRE9': 'bot.userAgent.IE_DOC_PRE9',
  },
  'css': {
    'BotError': 'bot.Error',
    'ErrorCode': 'bot.ErrorCode',
  },
  'dom': {
    'isElement': 'bot.dom.core.isElement',
    'isSelectable': 'bot.dom.core.isSelectable',
    'isSelected': 'bot.dom.core.isSelected',
    'getAttribute': 'bot.dom.core.getAttribute',
    'getProperty': 'bot.dom.core.getProperty',
    'standardizeColor': 'bot.color.standardizeColor',
    'IE_DOC_PRE9': 'bot.userAgent.IE_DOC_PRE9',
    'isEngineVersion': 'bot.userAgent.isEngineVersion',
    'cssSingle': 'bot.locators.css.single',
  },
};

// Defines which exports are "nested" under another export
const NESTED_EXPORTS_MAP = {
  'error': {
    'State': 'Error',
  },
};

// Private constants that need to be generated for each file
const PRIVATE_CONSTANTS_MAP = {
  'error': ['CODE_TO_STATE'],
};

// Module-level initialization code that should be included in the shim
// This handles variables and initialization blocks that functions depend on
const MODULE_INIT_MAP = {
  'bot': `
/** @type {!Window} */
var currentWindow;
try {
  currentWindow = window;
} catch (ignored) {
  currentWindow = /** @type {!Window} */ (globalThis);
}
`,
};

// Files that should use "bundle mode" - the entire compiled JS is included
// as an IIFE, and exports are assigned to the namespace
const BUNDLE_MODE_FILES = ['color', 'userAgent', 'json', 'domcore', 'css', 'dom'];

/**
 * Parses TypeScript to extract detailed export information.
 */
function parseExports(tsContent) {
  const exports = {
    functions: [],
    constants: [],
    enums: [],
    classes: [],
    interfaces: [],
    privateConstants: [],
  };

  // Parse enums (including const enum)
  const enumRegex = /export\s+(?:const\s+)?enum\s+(\w+)\s*\{([^}]+)\}/g;
  let match;
  while ((match = enumRegex.exec(tsContent)) !== null) {
    const enumName = match[1];
    const enumBody = match[2];
    const hasStringValues = enumBody.includes("'") || enumBody.includes('"');
    const members = [];

    const memberRegex = /(\w+)\s*=\s*([^,\n]+)/g;
    let memberMatch;
    while ((memberMatch = memberRegex.exec(enumBody)) !== null) {
      members.push({
        name: memberMatch[1],
        value: memberMatch[2].trim(),
      });
    }

    exports.enums.push({
      name: enumName,
      type: hasStringValues ? 'string' : 'number',
      members: members,
    });
  }

  // Parse classes
  const classRegex = /export\s+class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g;
  while ((match = classRegex.exec(tsContent)) !== null) {
    const className = match[1];
    const extendsClass = match[2] || null;
    const classStart = match.index;
    const classBody = extractBracedBlock(tsContent, classStart);
    const constructorParams = parseConstructorParams(classBody);
    const classProperties = parseClassProperties(classBody);

    exports.classes.push({
      name: className,
      extends: extendsClass,
      constructorParams: constructorParams,
      properties: classProperties,
    });
  }

  // Parse functions
  const functionRegex =
    /export\s+function\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{/g;
  while ((match = functionRegex.exec(tsContent)) !== null) {
    exports.functions.push({
      name: match[1],
      params: parseParameters(match[2]),
      returnType: match[3] ? match[3].trim() : 'void',
    });
  }

  // Parse exported constants
  const constRegex = /export\s+const\s+(\w+)\s*(?::\s*([^=]+))?\s*=/g;
  while ((match = constRegex.exec(tsContent)) !== null) {
    exports.constants.push({
      name: match[1],
      type: match[2] ? match[2].trim() : null,
    });
  }

  // Parse private (non-exported) constants
  const privateConstRegex = /^const\s+(\w+)\s*(?::\s*([^=]+))?\s*=\s*(\{[^}]+\}|[^;]+);/gm;
  while ((match = privateConstRegex.exec(tsContent)) !== null) {
    // Skip if it's an export const
    if (tsContent.substring(match.index - 10, match.index).includes('export')) {
      continue;
    }
    exports.privateConstants.push({
      name: match[1],
      type: match[2] ? match[2].trim() : null,
      value: match[3].trim(),
    });
  }

  // Parse interfaces
  const interfaceRegex = /export\s+interface\s+(\w+)\s*\{([^}]+)\}/g;
  while ((match = interfaceRegex.exec(tsContent)) !== null) {
    exports.interfaces.push({
      name: match[1],
      fields: parseInterfaceFields(match[2]),
    });
  }

  return exports;
}

/**
 * Extracts a braced block starting from the given position.
 */
function extractBracedBlock(content, startPos) {
  let braceCount = 0;
  let started = false;
  let blockStart = startPos;

  for (let i = startPos; i < content.length; i++) {
    if (content[i] === '{') {
      if (!started) {
        blockStart = i;
        started = true;
      }
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        return content.substring(blockStart, i + 1);
      }
    }
  }
  return content.substring(blockStart);
}

/**
 * Parses constructor parameters from a class body.
 */
function parseConstructorParams(classBody) {
  const constructorMatch = classBody.match(/constructor\s*\(([^)]*)\)/);
  if (!constructorMatch) {
    return [];
  }
  return parseParameters(constructorMatch[1]);
}

/**
 * Parses class properties from a class body.
 */
function parseClassProperties(classBody) {
  const properties = [];
  const propRegex = /^\s*(\w+)\s*:\s*([^;=]+);/gm;
  let match;
  while ((match = propRegex.exec(classBody)) !== null) {
    properties.push({
      name: match[1],
      type: match[2].trim(),
    });
  }
  return properties;
}

/**
 * Parses a parameter list string into structured data.
 */
function parseParameters(paramsStr) {
  if (!paramsStr.trim()) {
    return [];
  }

  const params = [];
  const paramParts = splitParameters(paramsStr);

  for (const part of paramParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const paramMatch = trimmed.match(/(\w+)(\?)?(?:\s*:\s*(.+))?/);
    if (paramMatch) {
      params.push({
        name: paramMatch[1],
        optional: !!paramMatch[2],
        type: paramMatch[3] ? paramMatch[3].trim() : 'any',
      });
    }
  }
  return params;
}

/**
 * Splits parameter string respecting nested brackets.
 */
function splitParameters(paramsStr) {
  const result = [];
  let current = '';
  let depth = 0;

  for (const char of paramsStr) {
    if (char === '<' || char === '(' || char === '{' || char === '[') {
      depth++;
      current += char;
    } else if (char === '>' || char === ')' || char === '}' || char === ']') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    result.push(current);
  }
  return result;
}

/**
 * Parses interface fields.
 */
function parseInterfaceFields(interfaceBody) {
  const fields = [];
  // Match fields with or without trailing semicolons
  const fieldRegex = /(\w+)(\?)?:\s*([^;\n}]+);?/g;
  let match;
  while ((match = fieldRegex.exec(interfaceBody)) !== null) {
    const fieldType = match[3].trim();
    if (fieldType) {
      fields.push({
        name: match[1],
        optional: !!match[2],
        type: fieldType,
      });
    }
  }
  return fields;
}

/**
 * Converts a TypeScript type to a Closure type.
 */
function tsTypeToClosureType(tsType, nullable = false) {
  if (!tsType) return '*';

  // Handle TypeScript type predicates (e.g., "value is ResponseObject" -> boolean)
  if (tsType.includes(' is ')) {
    return 'boolean';
  }

  // Handle inline object types like { message: string } - just use Object
  if (tsType.includes('{') && tsType.includes('}')) {
    return '*';
  }

  // Handle union types with undefined/null
  if (tsType.includes('|')) {
    const parts = tsType.split('|').map((p) => p.trim());
    const nonNullParts = parts.filter((p) => p !== 'undefined' && p !== 'null');
    if (parts.length !== nonNullParts.length) {
      if (nonNullParts.length === 1) {
        return '?' + tsTypeToClosureType(nonNullParts[0]);
      }
    }
    // For complex union types, just use *
    if (parts.length > 1) {
      return '*';
    }
  }

  const typeMap = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'void': 'void',
    'undefined': 'undefined',
    'null': 'null',
    'any': '*',
    'unknown': '*',
    'object': '!Object',
    'Object': '!Object',
    'Error': '!Error',
    'ErrorCode': 'bot.ErrorCode',
    'BotError': '!bot.Error',
    'State': 'bot.Error.State',
    'ResponseObject': 'bot.response.ResponseObject',
  };

  const mapped = typeMap[tsType];
  if (mapped) {
    return nullable ? '?' + mapped : mapped;
  }

  if (tsType.endsWith('[]')) {
    const elementType = tsType.slice(0, -2);
    return '!Array<' + tsTypeToClosureType(elementType) + '>';
  }

  if (tsType.startsWith('Record<')) {
    return '!Object';
  }

  return nullable ? '?' + tsType : '!' + tsType;
}

/**
 * Applies symbol replacements to code.
 */
function applySymbolReplacements(code, replacements) {
  let result = code;
  for (const [symbol, replacement] of Object.entries(replacements)) {
    // Use word boundary to avoid partial matches
    result = result.replace(new RegExp(`\\b${symbol}\\b`, 'g'), replacement);
  }
  return result;
}

/**
 * Generates the dom module shim with proper JSDoc annotations for Closure Compiler.
 * This is special because the dom module has many functions that need type info.
 */
function generateDomModuleShim(shimHeader, namespace, exports, moduleCode) {
  let shim = shimHeader;

  // Define a private namespace for the implementation
  const implNamespace = 'bot.dom.impl_';

  // Wrap the implementation in an IIFE that attaches to a private namespace
  shim += `/** @private */\n`;
  shim += `${implNamespace} = {};\n\n`;
  shim += `(function() {\n`;

  const lines = moduleCode.split('\n');
  lines.forEach((line) => {
    shim += `  ${line}\n`;
  });

  shim += '\n';

  // Assign functions to the private implementation namespace
  exports.functions.forEach((fn) => {
    shim += `  ${implNamespace}${fn.name} = ${fn.name};\n`;
  });

  // Assign constants to the private implementation namespace
  exports.constants.forEach((c) => {
    shim += `  ${implNamespace}${c.name} = ${c.name};\n`;
  });

  // Also export OverflowState enum
  shim += `  ${implNamespace}OverflowState = OverflowState;\n`;

  shim += `})();\n\n`;

  // Now generate properly-typed wrapper functions
  // Each function gets full JSDoc and delegates to the implementation

  // Type mappings for dom functions
  const domFunctionTypes = {
    getActiveElement: {
      params: [{ name: 'nodeOrWindow', type: '(!Node|!Window)' }],
      returns: '?Element',
    },
    isInteractable: {
      params: [{ name: 'element', type: '!Element' }],
      returns: 'boolean',
    },
    isFocusable: {
      params: [{ name: 'element', type: '!Element' }],
      returns: 'boolean',
    },
    isEnabled: {
      params: [{ name: 'el', type: '!Element' }],
      returns: 'boolean',
    },
    isTextual: {
      params: [{ name: 'element', type: '!Element' }],
      returns: 'boolean',
    },
    isFileInput: {
      params: [{ name: 'element', type: '!Element' }],
      returns: 'boolean',
    },
    isInputType: {
      params: [{ name: 'element', type: '!Element' }, { name: 'inputType', type: 'string' }],
      returns: 'boolean',
    },
    isContentEditable: {
      params: [{ name: 'element', type: '!Element' }],
      returns: 'boolean',
    },
    isEditable: {
      params: [{ name: 'element', type: '!Element' }],
      returns: 'boolean',
    },
    getParentElement: {
      params: [{ name: 'node', type: '!Node' }],
      returns: '?Element',
    },
    getInlineStyle: {
      params: [{ name: 'elem', type: '!Element' }, { name: 'styleName', type: 'string' }],
      returns: 'string',
    },
    getEffectiveStyle: {
      params: [{ name: 'elem', type: '!Element' }, { name: 'propertyName', type: 'string' }],
      returns: '?string',
    },
    isShown: {
      params: [{ name: 'elem', type: '!Element' }, { name: 'opt_ignoreOpacity', type: 'boolean=', optional: true }],
      returns: 'boolean',
    },
    getOverflowState: {
      params: [{ name: 'elem', type: '!Element' }, { name: 'opt_region', type: '(goog.math.Coordinate|goog.math.Rect)=', optional: true }],
      returns: 'bot.dom.OverflowState',
    },
    getClientRect: {
      params: [{ name: 'elem', type: '!Element' }],
      returns: '!goog.math.Rect',
    },
    getClientRegion: {
      params: [{ name: 'elem', type: '!Element' }, { name: 'opt_region', type: '(goog.math.Coordinate|goog.math.Rect)=', optional: true }],
      returns: '!goog.math.Box',
    },
    getVisibleText: {
      params: [{ name: 'elem', type: '!Element' }],
      returns: 'string',
    },
    getOpacity: {
      params: [{ name: 'elem', type: '!Element' }],
      returns: 'number',
    },
    getParentNodeInComposedDom: {
      params: [{ name: 'node', type: '!Node' }],
      returns: '?Node',
    },
    isNodeDistributedIntoShadowDom: {
      params: [{ name: 'node', type: '!Node' }],
      returns: 'boolean',
    },
  };

  // Generate wrapper functions with JSDoc
  for (const fn of exports.functions) {
    const typeInfo = domFunctionTypes[fn.name];
    if (!typeInfo) {
      // Unknown function, just assign directly
      shim += `${namespace}.${fn.name} = ${implNamespace}${fn.name};\n`;
      continue;
    }

    shim += `/**\n`;
    for (const param of typeInfo.params) {
      shim += ` * @param {${param.type}} ${param.name}\n`;
    }
    shim += ` * @return {${typeInfo.returns}}\n`;
    shim += ` */\n`;

    const paramNames = typeInfo.params.map((p) => p.name).join(', ');
    shim += `${namespace}.${fn.name} = function(${paramNames}) {\n`;
    shim += `  return ${implNamespace}${fn.name}(${paramNames});\n`;
    shim += `};\n\n`;
  }

  // Generate constants
  for (const c of exports.constants) {
    shim += `/** @const */\n`;
    shim += `${namespace}.${c.name} = ${implNamespace}${c.name};\n\n`;
  }

  // Generate OverflowState enum
  shim += `/**\n`;
  shim += ` * @enum {string}\n`;
  shim += ` */\n`;
  shim += `${namespace}.OverflowState = ${implNamespace}OverflowState;\n\n`;

  // Re-export functions from bot.dom.core for backward compatibility
  shim += `// Re-export functions from bot.dom.core for backward compatibility\n`;
  shim += `/** @const */\n`;
  shim += `bot.dom.isElement = bot.dom.core.isElement;\n\n`;
  shim += `/** @const */\n`;
  shim += `bot.dom.isSelectable = bot.dom.core.isSelectable;\n\n`;
  shim += `/** @const */\n`;
  shim += `bot.dom.isSelected = bot.dom.core.isSelected;\n\n`;
  shim += `/** @const */\n`;
  shim += `bot.dom.getAttribute = bot.dom.core.getAttribute;\n\n`;
  shim += `/** @const */\n`;
  shim += `bot.dom.getProperty = bot.dom.core.getProperty;\n`;

  return shim;
}

/**
 * Generates a bundle-mode shim that includes the entire compiled JS
 * wrapped in an IIFE, with exports assigned to the namespace.
 */
function generateBundleModeShim(shimHeader, namespace, exports, compiledJs, basename) {
  let shim = shimHeader;

  // Get symbol replacements for this file
  const symbolReplacements = SYMBOL_REPLACEMENTS[basename] || {};

  // Strip the ES module import/export and source map comment from compiled JS
  let moduleCode = compiledJs
    .replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\s*$/gm, '')  // Remove import statements
    .replace(/^export\s+\{[^}]+\};?\s*$/gm, '')  // Remove re-export statements
    .replace(/^export\s+/gm, '')
    .replace(/\/\/# sourceMappingURL=.*$/m, '')
    .trim();

  // Apply symbol replacements for imported symbols
  moduleCode = applySymbolReplacements(moduleCode, symbolReplacements);

  // For 'dom' module, use a different strategy: create namespace wrapper functions
  // with JSDoc that delegate to the internal implementation
  if (basename === 'dom') {
    return generateDomModuleShim(shim, namespace, exports, moduleCode);
  }

  // Wrap in IIFE to create a scope for the private symbols
  shim += `(function() {\n`;

  // Include the module code (constants, helper functions, etc.)
  const lines = moduleCode.split('\n');
  lines.forEach((line) => {
    shim += `  ${line}\n`;
  });

  shim += '\n';

  // Assign exported functions to the namespace
  exports.functions.forEach((fn) => {
    shim += `  ${namespace}.${fn.name} = ${fn.name};\n`;
  });

  // Assign exported constants to the namespace
  exports.constants.forEach((c) => {
    shim += `  ${namespace}.${c.name} = ${c.name};\n`;
  });

  shim += `})();\n`;

  // Special handling for userAgent: delegate version functions to Closure
  // This ensures consistency with goog.userAgent.product.VERSION used by tests
  if (basename === 'userAgent') {
    shim += `
// Override version functions to use Closure's implementation for consistency
// with tests that compare against goog.userAgent.product.VERSION
/**
 * @param {string|number} version
 * @return {boolean}
 */
bot.userAgent.isEngineVersion = function(version) {
  if (goog.userAgent.IE) {
    return goog.string.compareVersions(
        /** @type {number} */ (goog.userAgent.DOCUMENT_MODE), version) >= 0;
  }
  return goog.userAgent.isVersionOrHigher(version);
};

/**
 * @param {string|number} version
 * @return {boolean}
 */
bot.userAgent.isProductVersion = function(version) {
  if (goog.userAgent.product.ANDROID) {
    return goog.string.compareVersions(
        bot.userAgent.ANDROID_VERSION_, version) >= 0;
  }
  return goog.userAgent.product.isVersion(version);
};
`;
  }

  return shim;
}

function generateShim(tsFile, namespace, compiledJsPath) {
  const tsContent = fs.readFileSync(tsFile, 'utf-8');
  const exports = parseExports(tsContent);
  const basename = path.basename(tsFile, '.ts');

  const exportRenames = EXPORT_RENAME_MAP[basename] || {};
  const symbolReplacements = SYMBOL_REPLACEMENTS[basename] || {};
  const nestedExports = NESTED_EXPORTS_MAP[basename] || {};
  const privateConstantNames = PRIVATE_CONSTANTS_MAP[basename] || [];

  // Separate nested enums from top-level enums
  const topLevelEnums = [];
  const nestedEnums = [];
  exports.enums.forEach((e) => {
    if (nestedExports[e.name]) {
      nestedEnums.push(e);
    } else {
      topLevelEnums.push(e);
    }
  });

  // Generate provides
  const additionalProvides = ADDITIONAL_PROVIDES_MAP[basename] || [];
  const provides =
    additionalProvides.length > 0 ? [...additionalProvides] : [namespace];

  topLevelEnums.forEach((e) => {
    const renamed = exportRenames[e.name];
    if (!renamed) {
      const enumProvide = `${namespace}.${e.name}`;
      if (!provides.includes(enumProvide)) {
        provides.push(enumProvide);
      }
    }
  });

  const requires = FILE_DEPS_MAP[basename] || [];

  let shim = `// Auto-generated Closure-compatible shim for ${namespace}
// Source: ${path.basename(tsFile)}
// DO NOT EDIT - This file is generated by scripts/generate-shim.js

`;

  provides.forEach((p) => {
    shim += `goog.provide('${p}');\n`;
  });
  shim += '\n';

  if (requires.length > 0) {
    requires.forEach((req) => {
      shim += `goog.require('${req}');\n`;
    });
    shim += '\n';
  }

  const compiledJs = readCompiledJs(compiledJsPath);

  // Bundle mode: include entire compiled JS and assign exports to namespace
  if (BUNDLE_MODE_FILES.includes(basename)) {
    return generateBundleModeShim(shim, namespace, exports, compiledJs, basename);
  }

  // 0. Include module-level initialization code if needed
  const moduleInit = MODULE_INIT_MAP[basename];
  if (moduleInit) {
    shim += moduleInit.trim() + '\n\n';
  }

  // 1. Generate top-level enums first
  topLevelEnums.forEach((e) => {
    const closureName = exportRenames[e.name] || e.name;
    const fullName = `${namespace}.${closureName}`;

    shim += `/**\n * @enum {${e.type}}\n */\n`;
    shim += `${fullName} = {\n`;
    e.members.forEach((m, i) => {
      const comma = i < e.members.length - 1 ? ',' : '';
      shim += `  ${m.name}: ${m.value}${comma}\n`;
    });
    shim += `};\n\n`;
  });

  // 2. Generate classes
  exports.classes.forEach((cls) => {
    const closureName = exportRenames[cls.name] || cls.name;
    const fullName = `${namespace}.${closureName}`;

    shim += `/**\n`;
    cls.constructorParams.forEach((p) => {
      const closureType = tsTypeToClosureType(p.type, p.optional);
      const paramName = p.optional ? 'opt_' + p.name : p.name;
      shim += ` * @param {${closureType}} ${paramName}\n`;
    });
    shim += ` * @constructor\n`;
    if (cls.extends) {
      shim += ` * @extends {${cls.extends}}\n`;
    }
    shim += ` */\n`;

    const paramNames = cls.constructorParams.map((p) =>
      p.optional ? 'opt_' + p.name : p.name
    );
    shim += `${fullName} = function(${paramNames.join(', ')}) {\n`;

    // Generate constructor body
    const constructorBody = extractClassConstructorBody(cls.name, compiledJs, symbolReplacements, paramNames);
    shim += constructorBody;

    shim += `};\n`;

    if (cls.extends) {
      shim += `goog.utils.inherits(${fullName}, ${cls.extends});\n`;
    }
    shim += '\n';
  });

  // 3. Generate nested enums AFTER the class
  nestedEnums.forEach((e) => {
    const closureName = exportRenames[e.name] || e.name;
    const fullName = `${namespace}.${closureName}`;

    shim += `/**\n * @enum {${e.type}}\n */\n`;
    shim += `${fullName} = {\n`;
    e.members.forEach((m, i) => {
      const comma = i < e.members.length - 1 ? ',' : '';
      shim += `  ${m.name}: ${m.value}${comma}\n`;
    });
    shim += `};\n\n`;
  });

  // 4. Generate private constants needed by the class (after both class and nested enums)
  const neededPrivateConstants = exports.privateConstants.filter(
    (c) => privateConstantNames.includes(c.name)
  );
  neededPrivateConstants.forEach((c) => {
    const closureName = symbolReplacements[c.name] || `${namespace}.${c.name}_`;
    shim += `/**\n * @private {!Object<number, bot.Error.State>}\n */\n`;

    // Extract the constant value from compiled JS and apply replacements
    const value = extractConstant(c.name, compiledJs);
    const processedValue = applySymbolReplacements(value, symbolReplacements);
    shim += `${closureName} = ${processedValue};\n\n`;
  });

  // 5. Generate interfaces as @record types
  exports.interfaces.forEach((iface) => {
    const fullName = `${namespace}.${iface.name}`;
    shim += `/**\n * @record\n */\n`;
    shim += `${fullName} = function() {};\n`;
    iface.fields.forEach((f) => {
      const closureType = tsTypeToClosureType(f.type, f.optional);
      shim += `/** @type {${closureType}} */\n`;
      shim += `${fullName}.prototype.${f.name};\n`;
    });
    shim += '\n';
  });

  // 6. Generate functions
  exports.functions.forEach((fn) => {
    const closureName = exportRenames[fn.name] || fn.name;
    const fullName = `${namespace}.${closureName}`;

    shim += `/**\n`;
    fn.params.forEach((p) => {
      const closureType = tsTypeToClosureType(p.type, p.optional);
      const paramName = p.optional ? 'opt_' + p.name : p.name;
      shim += ` * @param {${closureType}} ${paramName}\n`;
    });
    const returnType = tsTypeToClosureType(fn.returnType);
    shim += ` * @return {${returnType}}\n`;
    shim += ` */\n`;

    const funcBody = extractFunctionBody(fn.name, compiledJs, symbolReplacements);
    shim += `${fullName} = function${funcBody};\n\n`;
  });

  // 7. Generate constants
  exports.constants.forEach((c) => {
    const closureName = exportRenames[c.name] || c.name;
    const fullName = `${namespace}.${closureName}`;
    const closureType = c.type ? tsTypeToClosureType(c.type) : '*';

    shim += `/** @const {${closureType}} */\n`;
    const value = extractConstant(c.name, compiledJs);
    shim += `${fullName} = ${applySymbolReplacements(value, symbolReplacements)};\n\n`;
  });

  return shim;
}

/**
 * Reads the compiled JavaScript file.
 */
function readCompiledJs(compiledJsPath) {
  let resolvedPath = compiledJsPath;

  if (resolvedPath.startsWith('bazel-out/')) {
    const match = resolvedPath.match(/bazel-out\/[^\/]+\/bin\/(.*)/);
    if (match) {
      resolvedPath = match[1];
    }
  }

  const possiblePaths = [
    resolvedPath,
    compiledJsPath,
    path.join(process.cwd(), resolvedPath),
  ];

  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      return fs.readFileSync(tryPath, 'utf-8');
    }
  }

  console.error('Warning: Compiled JS file not found:', compiledJsPath);
  return '';
}

/**
 * Extracts class constructor body from compiled JS.
 */
function extractClassConstructorBody(className, compiledJs, replacements, paramNames) {
  const classRegex = new RegExp(`class\\s+${className}[^{]*\\{`, 'g');
  const classMatch = classRegex.exec(compiledJs);

  if (!classMatch) {
    return '  // Constructor body not found\n';
  }

  const classBody = extractBracedBlock(compiledJs, classMatch.index);
  const constructorMatch = classBody.match(/constructor\s*\([^)]*\)\s*\{/);

  if (!constructorMatch) {
    return '  // No constructor found\n';
  }

  const constructorStart = classBody.indexOf(constructorMatch[0]);
  const constructorBlock = extractBracedBlock(classBody, constructorStart);

  const bodyStart = constructorBlock.indexOf('{') + 1;
  const bodyEnd = constructorBlock.lastIndexOf('}');
  let body = constructorBlock.substring(bodyStart, bodyEnd);

  // Replace 'super(' with parent class call using proper parameter name
  // Also add explicit this.message assignment since Error.call doesn't set it in all browsers
  const messageParam = paramNames.find((p) => p.includes('message')) || "''";
  body = body.replace(
    /super\s*\(\s*message\s*\|\|\s*''\s*\)/g,
    `Error.call(this, ${messageParam} || '');\n    /** @override */\n    this.message = ${messageParam} || ''`
  );
  body = body.replace(/super\s*\(/g, 'Error.call(this, ');

  // Apply symbol replacements
  body = applySymbolReplacements(body, replacements);

  // Clean up and indent
  const lines = body
    .split('\n')
    .map((line) => '  ' + line.trimEnd())
    .filter((line) => line.trim() !== '');

  return lines.join('\n') + '\n';
}

/**
 * Extracts a function body (params and block) from compiled JS.
 */
function extractFunctionBody(funcName, compiledJs, replacements) {
  const funcRegex = new RegExp(
    `function\\s+${funcName}\\s*(\\([^)]*\\))\\s*\\{`,
    'g'
  );
  const match = funcRegex.exec(compiledJs);

  if (match) {
    const params = match[1];
    const startIndex = match.index + match[0].length - 1; // Position of the opening brace
    const block = extractBracedBlock(compiledJs, startIndex - 1);

    // Get just the block part (the { ... })
    const braceStart = match[0].lastIndexOf('{');
    const fullBlock = extractBracedBlock(compiledJs, match.index + braceStart);

    let processed = applySymbolReplacements(fullBlock, replacements);
    return params + ' ' + processed;
  }

  return `() { throw new Error('Function ${funcName} not found'); }`;
}

/**
 * Extracts a constant value from compiled JS.
 */
function extractConstant(constName, compiledJs) {
  // Handle multi-line object constants
  const constStartRegex = new RegExp(`(?:const|var)\\s+${constName}\\s*=\\s*`);
  const match = constStartRegex.exec(compiledJs);

  if (match) {
    const valueStart = match.index + match[0].length;
    const firstChar = compiledJs[valueStart];

    if (firstChar === '{') {
      // It's an object, extract the full block
      const block = extractBracedBlock(compiledJs, valueStart);
      return block;
    } else if (firstChar === '[') {
      // It's an array, extract the full block
      let depth = 0;
      let end = valueStart;
      for (let i = valueStart; i < compiledJs.length; i++) {
        if (compiledJs[i] === '[') depth++;
        else if (compiledJs[i] === ']') {
          depth--;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
      return compiledJs.substring(valueStart, end);
    } else {
      // Simple value, find the semicolon
      const semicolon = compiledJs.indexOf(';', valueStart);
      return compiledJs.substring(valueStart, semicolon).trim();
    }
  }

  return 'undefined';
}

/**
 * Infers the Closure namespace from a TypeScript filename.
 */
function inferNamespace(tsFile) {
  const basename = path.basename(tsFile, '.ts');
  return NAMESPACE_MAP[basename] || `bot.${basename}`;
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      'Usage: node generate-shim.js <ts-file> [closure-namespace] [compiled-js-path]'
    );
    console.error('Example: node generate-shim.js bot.ts bot ./bot.js');
    process.exit(1);
  }

  const tsFile = args[0];
  const namespace = args[1] || inferNamespace(tsFile);
  const compiledJsPath = args[2] || `./${path.basename(tsFile, '.ts')}.js`;

  if (!fs.existsSync(tsFile)) {
    console.error(`Error: TypeScript file not found: ${tsFile}`);
    process.exit(1);
  }

  const shim = generateShim(tsFile, namespace, compiledJsPath);
  console.log(shim);
}

main();
