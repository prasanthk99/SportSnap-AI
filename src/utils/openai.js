import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
})

export async function generateScript(celebrityName) {
  const prompt = `Write a 1-line, engaging sports history summary of ${celebrityName}.`

  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    max_tokens: 300
  })

  return response.choices[0].message.content
}