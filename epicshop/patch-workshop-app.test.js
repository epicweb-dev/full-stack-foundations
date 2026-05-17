import assert from 'node:assert/strict'
import test from 'node:test'
import { patchServerBuild } from './patch-workshop-app.js'

const fixture = `
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: ErrorBoundary$7,
  default: $,
  loader: loader$L
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "routes": { "routes/$": { "id": "routes/$", "parentId": "root", "path": "*", "hasAction": false, "hasLoader": true } } };
const routes = {
  "routes/$": {
    id: "routes/$",
    parentId: "root",
    path: "*",
    module: route1
  }
};
`

test('patches the workshop app catch-all route with an action', () => {
	const result = patchServerBuild(fixture)

	assert.equal(result.patchedRouteAction, true)
	assert.equal(result.patchedManifest, true)
	assert.match(result.contents, /action: loader\$L,\n  loader: loader\$L/)
	assert.match(result.contents, /"routes\/\$": \{[^}]*"hasAction": true/)
})

test('leaves an already patched catch-all route unchanged', () => {
	const once = patchServerBuild(fixture)
	const twice = patchServerBuild(once.contents)

	assert.equal(twice.patchedRouteAction, false)
	assert.equal(twice.contents, once.contents)
})
