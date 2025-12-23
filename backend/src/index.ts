import express, { Request, Response } from 'express'
import multer from 'multer'
import dotenv from "dotenv"
import cors from "cors"
import { analyzeResume, HTTP_STATUS_CODE } from './utils/helper'
import pdf from 'pdf-parse-new'

dotenv.config()

const app = express()
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const PORT = process.env.PORT || 3000
const { FRONTEND_BASE_URI } = process.env

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env");
}

app.use(express.json()); // for parsing JSON
app.use(cors({
    origin: FRONTEND_BASE_URI
}))

const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    }
})

app.get('/', (req, res) => {
    res.send('hii')
})

/**
 * POST /api/analyze-resume
 * Form-data:
 *   - resume: (file, PDF)
 *   - jobDescription: (text, optional)
 */
app.post('/api/analyze-resume', upload.single('resume'), async (req: Request, res: Response) => {
    const file = req.file
    const jobDescription = req.body.jobDescription?.trim()

    if (!file) {
        return res
            .status(HTTP_STATUS_CODE.BAD_REQUEST)
            .json({ success: false, error: "PDF file is required" })
    }

    if (file.mimetype !== "application/pdf") {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ success: false, error: "Only PDF files are supported." });
    }

    try {
        const resumeText: string = (await pdf(file.buffer)).text
        if (!resumeText || resumeText.trim().length < 50) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                error: "Could not extract enough text from the PDF."
            })
        }
        const response = await analyzeResume({
            resumeText,
            jobDescription,
            apiKey: GEMINI_API_KEY,
        })
        res.json({
            success: true,
            data: response ? JSON.parse(response) : ''
        })
    }
    catch (error) {
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: `Failed to process PDF: ${error instanceof Error ? error?.message : "Unknown error"}`,
        })
    }
})

app.listen(3000, () => {
    console.log(`🚀 Server started successfully at port no. ${PORT}...`)
})