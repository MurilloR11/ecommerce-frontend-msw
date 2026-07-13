import type { JsonBodyType } from 'msw'
import { HttpResponse } from 'msw'

export interface ApiErrorBody extends Record<string, unknown> {
  error: {
    code: string
    message: string
  }
}

/**
 * Return type is intentionally widened to `HttpResponse<JsonBodyType>` (not
 * `HttpResponse<TBody>`): every handler branches between a success payload
 * and `jsonError`'s ApiErrorBody, and MSW's resolver signature only accepts
 * one concrete response type per handler — widening here is what lets both
 * branches share it instead of the two payload shapes fighting each other.
 */
export function jsonOk(body: JsonBodyType): HttpResponse<JsonBodyType> {
  return HttpResponse.json(body)
}

export function jsonError(
  status: number,
  code: string,
  message: string,
): HttpResponse<JsonBodyType> {
  const body: ApiErrorBody = { error: { code, message } }
  return HttpResponse.json(body, { status })
}
