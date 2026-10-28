#!/usr/bin/env node
/** Validate the built main/preload modules instead of relying on a package collector's layout. */
import { readFile } from 'node:fs/promises'
import { isBuiltin } from 'node:module'
import ts from 'typescript'

const files = process.argv.slice(2)
if (!files.length) files.push('apps/desktop/out/main/index.js', 'apps/desktop/out/preload/index.js')

for (const file of files) {
  const source = ts.createSourceFile(file, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const errors = []
  let references = 0
  function check(argument) {
    references += 1
    if (!argument || !ts.isStringLiteral(argument)) {
      errors.push('dynamic module reference')
      return
    }
    const name = argument.text
    if (name !== 'electron' && !isBuiltin(name)) errors.push(name)
  }
  function visit(node) {
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression) && node.expression.text === 'require') check(node.arguments[0])
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) check(node.arguments[0])
    }
    if (ts.isImportDeclaration(node) || (ts.isExportDeclaration(node) && node.moduleSpecifier)) {
      check(node.moduleSpecifier)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (errors.length) throw new Error(`${file}: unresolved runtime dependencies: ${[...new Set(errors)].join(', ')}`)
  console.log(`✓ ${file}: ${references} external references use Electron/Node builtins only`)
}
