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

// Checks that the shared accessibility corpus in common/src/web/accessibility
// is self-consistent, with no browser involved:
//
//   - every page in index.json has an .expected.json and an .expected.txt,
//     and no expectation file is left over for a page the index does not list
//   - every expectation (engine-specific ones included) validates against
//     typescript/accessibility-node.schema.json, which is what turns the
//     ADR's compatibility rule into a failing test: a removed or renamed
//     field, or a state of the wrong type, fails here before any binding
//     sees it
//   - every .txt is exactly the reference renderer's output over its .json,
//     so the text form has one source
//   - every element id in a tree is unique within that tree and the root is
//     the html element, id "root"
//
// The validator below covers the subset of JSON Schema the schema file uses.
//
// Usage: corpus-consistent.mjs <corpus dir> <schema.json> <testing/accessibility.generated.js>

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const [corpusDir, schemaPath, bundlePath] = process.argv.slice(2)
if (!corpusDir || !schemaPath || !bundlePath) {
  throw new Error('Expected the corpus directory, the schema path and the testing bundle path')
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const sandbox = { module: { exports: undefined } }
vm.runInNewContext(`module.exports = ${fs.readFileSync(bundlePath, 'utf8').trim()};`, sandbox, { filename: bundlePath })
const { toText } = sandbox.module.exports

function resolve(ref) {
  if (!ref.startsWith('#/')) {
    throw new Error(`Only local $refs are supported: ${ref}`)
  }
  return ref
    .slice(2)
    .split('/')
    .reduce((node, key) => node[key], schema)
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array'
  if (value === null) return 'null'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number'
  return typeof value
}

function validate(value, rule, at, errors) {
  if (rule.$ref) {
    return validate(value, resolve(rule.$ref), at, errors)
  }
  if (rule.oneOf) {
    const matching = rule.oneOf.filter((option) => validate(value, option, at, []))
    if (matching.length !== 1) {
      errors.push(`${at}: ${JSON.stringify(value)} matches ${matching.length} of ${rule.oneOf.length} alternatives`)
    }
    return matching.length === 1
  }
  if ('const' in rule && value !== rule.const) {
    errors.push(`${at}: expected ${JSON.stringify(rule.const)}, got ${JSON.stringify(value)}`)
    return false
  }
  if (rule.type) {
    const actual = typeOf(value)
    if (actual !== rule.type && !(rule.type === 'number' && actual === 'integer')) {
      errors.push(`${at}: expected ${rule.type}, got ${actual}`)
      return false
    }
  }
  let ok = true
  if (rule.minLength !== undefined && value.length < rule.minLength) {
    errors.push(`${at}: shorter than ${rule.minLength}`)
    ok = false
  }
  if (rule.minimum !== undefined && value < rule.minimum) {
    errors.push(`${at}: below ${rule.minimum}`)
    ok = false
  }
  if (rule.type === 'array' && rule.items) {
    value.forEach((item, i) => {
      ok = validate(item, rule.items, `${at}[${i}]`, errors) && ok
    })
  }
  if (rule.type === 'object') {
    for (const key of rule.required || []) {
      if (!(key in value)) {
        errors.push(`${at}: missing ${key}`)
        ok = false
      }
    }
    for (const [key, child] of Object.entries(value)) {
      const property = rule.properties && rule.properties[key]
      if (property) {
        ok = validate(child, property, `${at}.${key}`, errors) && ok
      } else if (rule.additionalProperties === false) {
        errors.push(`${at}: unexpected key ${key}`)
        ok = false
      } else if (rule.additionalProperties) {
        ok = validate(child, rule.additionalProperties, `${at}.${key}`, errors) && ok
      }
    }
  }
  return ok
}

function checkIds(node, seen, errors, at = 'root') {
  if (node.element !== undefined) {
    if (seen.has(node.element)) {
      errors.push(`${at}: element id "${node.element}" appears twice`)
    }
    seen.add(node.element)
  }
  node.children.forEach((child, i) => checkIds(child, seen, errors, `${at}.children[${i}]`))
}

const failures = []
const index = JSON.parse(fs.readFileSync(path.join(corpusDir, 'index.json'), 'utf8'))
const files = new Set(fs.readdirSync(corpusDir))
const covered = new Set(['index.json', 'README.md'])

for (const name of index) {
  for (const required of [`${name}.html`, `${name}.expected.json`, `${name}.expected.txt`]) {
    covered.add(required)
    if (!files.has(required)) {
      failures.push(`${name}: missing ${required}`)
    }
  }
  const variants = [...files].filter((file) => file.startsWith(`${name}.expected.`) && file.endsWith('.json'))
  for (const jsonFile of variants) {
    covered.add(jsonFile)
    const txtFile = jsonFile.replace(/\.json$/, '.txt')
    covered.add(txtFile)
    let tree
    try {
      tree = JSON.parse(fs.readFileSync(path.join(corpusDir, jsonFile), 'utf8'))
    } catch (e) {
      failures.push(`${jsonFile}: ${e.message}`)
      continue
    }
    const errors = []
    validate(tree, schema, 'root', errors)
    if (tree.role !== 'document' || tree.element !== 'root') {
      errors.push('root: expected the html element (role document, id "root")')
    }
    checkIds(tree, new Set(), errors)
    for (const error of errors) {
      failures.push(`${jsonFile}: ${error}`)
    }
    if (!files.has(txtFile)) {
      failures.push(`${jsonFile}: no matching ${txtFile}`)
    } else if (fs.readFileSync(path.join(corpusDir, txtFile), 'utf8') !== toText(tree) + '\n') {
      failures.push(`${txtFile}: not the renderer's output over ${jsonFile}; re-record it`)
    }
  }
}
for (const file of files) {
  if (!covered.has(file) && /\.expected\./.test(file)) {
    failures.push(`${file}: not listed in index.json`)
  }
}

if (failures.length) {
  console.error(`Corpus is inconsistent:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log(`Corpus consistent: ${index.length} pages, every expectation valid against the schema and its text up to date.`)
