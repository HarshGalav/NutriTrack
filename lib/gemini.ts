import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeMealFromImage(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt = `
    Analyze this food image and provide nutritional information in JSON format.
    Return ONLY a valid JSON object with this exact structure:
    {
      "name": "food name",
      "description": "brief description",
      "calories": number,
      "protein": number (in grams),
      "carbs": number (in grams),
      "fat": number (in grams),
      "fiber": number (in grams),
      "sugar": number (in grams),
      "sodium": number (in mg),
      "quantity": number,
      "unit": "serving/cup/piece/etc"
    }
    
    Estimate portion size based on visual cues. Be as accurate as possible with nutritional values.
  `

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      }
    ])

    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error analyzing meal:", error)
    throw new Error("Failed to analyze meal image")
  }
}

export async function analyzeMealFromText(description: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt = `
    Analyze this food description and provide nutritional information in JSON format: "${description}"
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "name": "food name",
      "description": "brief description",
      "calories": number,
      "protein": number (in grams),
      "carbs": number (in grams),
      "fat": number (in grams),
      "fiber": number (in grams),
      "sugar": number (in grams),
      "sodium": number (in mg),
      "quantity": number,
      "unit": "serving/cup/piece/etc"
    }
    
    Use standard serving sizes and be as accurate as possible with nutritional values.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error analyzing meal:", error)
    throw new Error("Failed to analyze meal description")
  }
}