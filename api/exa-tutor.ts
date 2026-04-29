import { createExaTutorResponse } from '../src/server/exaTutor'

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ title: 'FlowLang Tutor', body: 'Only POST requests are supported.', source: 'local' }, { status: 405 })
  }

  const apiKey = process.env.EXA_API_KEY
  const body = await request.json()
  const data = await createExaTutorResponse(body, apiKey)

  return Response.json(data)
}
