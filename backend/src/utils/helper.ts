import { GoogleGenAI } from "@google/genai"
import { z } from "zod"

export const HTTP_STATUS_CODE = {
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    OK: 200,
    CREATED: 201,
    PAYLOAD_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    SERVICE_UNAVAILABLE: 503,
}

const AnalyzeResumeSchema = z.object({
    resumeText: z.string().describe("Resume"),
    jobDescription: z.optional(z.string().describe("Job Description")),
    apiKey: z.string().describe('Gemini API Key')
})

type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeSchema>

const ResumeAnalysisSchema = z.object({
    overall_summary: z.string(),
    seniority_level: z.enum(["junior", "mid", "senior", "lead", "unknown"]),
    key_skills: z.array(z.string()).min(1).max(10),
    missing_skills: z.array(z.string()).max(10),
    strengths: z.array(z.string()).max(10),
    weaknesses: z.array(z.string()).max(10),
    ats_score: z.number().min(0).max(100),
    suggestions: z.array(z.string()).max(10)
})

function buildResumePrompt(
    resumeText: string,
    jobDescription?: string
): string {
    const systemTemplate = `
        You are an expert technical recruiter and ATS specialist.
        Analyze the resume and optional job description.

        STRICT RULES:
        - Output ONLY valid JSON
        - Do NOT include markdown, explanations, or comments
        - Do NOT include trailing commas
        - Keep overall_summary to MAX 2 sentences
        - Limit all array fields to MAX 6 items

        Required JSON format:
        {
            "overall_summary": string,
            "seniority_level": "junior" | "mid" | "senior" | "lead" | "unknown",
            "key_skills": string[],
            "missing_skills": string[],
            "strengths": string[],
            "weaknesses": string[],
            "ats_score": number,
            "suggestions": string[]
        }
    `
    const humanTemplate = `Analyze the following resume and job description (optional) and produce ONLY the JSON output:
        RESUME:
        -----------------
        ${resumeText}

        JOB DESCRIPTION (optional):
        -----------------
        ${jobDescription}
    `
    const prompt = systemTemplate + humanTemplate
    return prompt
}

export async function analyzeResume({ resumeText, jobDescription, apiKey }: AnalyzeResumeInput): Promise<string | undefined> {
    const ai = new GoogleGenAI({
        apiKey,
    })
    const prompt = buildResumePrompt(resumeText, jobDescription)
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: ResumeAnalysisSchema,
            },
        })
    
        const text = response?.candidates?.[0].content?.parts?.[0].text
        return text
    } 
    catch (error: any) {
        throw Error(error?.message || JSON.stringify(error))
    }
}