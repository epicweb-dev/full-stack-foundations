import { type HandleDocumentRequestFunction } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { renderToString } from 'react-dom/server'
import { getEnv } from './utils/env.server.ts'

global.ENV = getEnv()

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

export default async function handleRequest(...args: DocRequestArgs) {
	const [request, responseStatusCode, responseHeaders, remixContext] = args
	const markup = renderToString(
		// @ts-expect-error https://github.com/remix-run/remix/issues/7239
		<RemixServer context={remixContext} url={request.url} />,
	)

	responseHeaders.set('Content-Type', 'text/html')

	return new Response('<!DOCTYPE html>' + markup, {
		status: responseStatusCode,
		headers: responseHeaders,
	})
}
