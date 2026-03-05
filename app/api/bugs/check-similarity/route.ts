import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function cosineSimilarity(a:number[], b:number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot / (magA * magB)
}

export async function POST(req:Request) {

  const { title, description, bugs } = await req.json()

  const text = `${title} ${description}`

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  })

  const userVector = embedding.data[0].embedding

  let bestMatch = null
  let bestScore = 0

  for (const bug of bugs) {

    const bugEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: bug.title + " " + bug.description
    })

    const score = cosineSimilarity(
      userVector,
      bugEmbedding.data[0].embedding
    )

    if (score > bestScore) {
      bestScore = score
      bestMatch = bug
    }
  }

  return NextResponse.json({
    similar: bestScore > 0.85,
    bug: bestMatch,
    score: bestScore
  })
}