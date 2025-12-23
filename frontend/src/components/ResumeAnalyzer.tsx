import React, { useState } from 'react';
import { Upload, FileText, Briefcase, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalysisResult {
    overall_summary: string;
    seniority_level: "junior" | "mid" | "senior" | "lead" | "unknown";
    key_skills: string[];
    missing_skills: string[];
    strengths: string[];
    weaknesses: string[];
    ats_score: number;
    suggestions: string[];
}
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function ResumeAnalyzer() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5 MB');
                setResumeFile(null);
                return;
            }
            setResumeFile(file);
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile) {
            setError('Please upload a resume');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('resume', resumeFile);
        if (jobDescription.trim()) {
            formData.append('jobDescription', jobDescription);
        }

        try {
            const response = await fetch(`${apiUrl}/api/analyze-resume`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const { data } = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze resume');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getSeniorityBadge = (level: string) => {
        const colors: Record<string, string> = {
            junior: 'bg-blue-100 text-blue-800',
            mid: 'bg-purple-100 text-purple-800',
            senior: 'bg-orange-100 text-orange-800',
            lead: 'bg-red-100 text-red-800',
            unknown: 'bg-gray-100 text-gray-800',
        };
        return colors[level] || colors.unknown;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Resume Analyzer</h1>
                    <p className="text-gray-600">Upload your resume and get AI-powered insights</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="inline w-4 h-4 mr-1" />
                                Resume (PDF - Max 5MB)
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    name="resume"
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer block">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        {resumeFile ? resumeFile.name : 'Click to upload resume'}
                                    </p>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                <Briefcase className="inline w-4 h-4 mr-1" />
                                Job Description (Optional)
                            </label>
                            <textarea
                                id="jobDescription"
                                name="jobDescription"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here to get tailored insights..."
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !resumeFile}
                        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Resume'}
                    </button>
                </div>

                {result && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getSeniorityBadge(result.seniority_level)}`}>
                                        {result.seniority_level.charAt(0).toUpperCase() + result.seniority_level.slice(1)} Level
                                    </span>
                                </div>
                                <div className="text-center">
                                    <div className={`text-5xl font-bold ${getScoreColor(result.ats_score)}`}>
                                        {result.ats_score}
                                    </div>
                                    <div className="text-sm text-gray-600">ATS Score</div>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{result.overall_summary}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                    Key Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.key_skills.map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <XCircle className="w-5 h-5 mr-2 text-red-600" />
                                    Missing Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing_skills.length > 0 ? (
                                        result.missing_skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No missing skills identified</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                    Strengths
                                </h3>
                                <ul className="space-y-2">
                                    {result.strengths.map((strength, idx) => (
                                        <li key={idx} className="text-gray-700 flex items-start">
                                            <span className="text-blue-600 mr-2">•</span>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                                    Areas for Improvement
                                </h3>
                                <ul className="space-y-2">
                                    {result.weaknesses.map((weakness, idx) => (
                                        <li key={idx} className="text-gray-700 flex items-start">
                                            <span className="text-orange-600 mr-2">•</span>
                                            <span>{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggestions</h3>
                            <ul className="space-y-3">
                                {result.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="text-gray-700 p-3 bg-indigo-50 rounded-lg flex items-start">
                                        <span className="text-indigo-600 font-bold mr-3">{idx + 1}.</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}