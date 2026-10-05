import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Placement AI & RAG Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    required_skills: List[str]

class QuestionGenerationRequest(BaseModel):
    company_name: str
    role_title: str
    stage: str
    skills: List[str]

@app.get("/")
def read_root():
    return {"status": "ok", "service": "FastAPI AI Placement Microservice"}

@app.post("/api/ai/analyze-resume")
def analyze_resume(req: ResumeAnalysisRequest):
    """
    RAG / LLM Endpoint for scoring resume text against JD and required competencies.
    """
    resume_upper = req.resume_text.upper()
    matched_skills = [s for s in req.required_skills if s.upper() in resume_upper]
    missing_skills = [s for s in req.required_skills if s.upper() not in resume_upper]
    
    total_skills = len(req.required_skills)
    skill_ratio = (len(matched_skills) / total_skills) if total_skills > 0 else 1.0
    score = int(skill_ratio * 70) + 25 # Base weighted ATS score
    score = min(100, max(30, score))
    
    strengths = []
    if matched_skills:
        strengths.append(f"Demonstrates alignment in core competencies: {', '.join(matched_skills)}")
    if "PROJECT" in resume_upper:
        strengths.append("Structured technical project portfolio present.")
        
    recommendations = []
    if missing_skills:
        recommendations.append(f"Incorporate project work covering: {', '.join(missing_skills[:3])}")
    recommendations.append("Quantify business impact and performance benchmarks with numerical percentages.")
    
    return {
        "score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "strengths": strengths,
        "recommendations": recommendations
    }

@app.post("/api/ai/generate-mock-questions")
def generate_mock_questions(req: QuestionGenerationRequest):
    """
    Generates targeted interview preparation questions based on company profile and stage.
    """
    questions = [
        f"Explain your approach to system architecture at {req.company_name} scale.",
        f"How would you design a caching layer using {', '.join(req.skills[:2]) if req.skills else 'distributed datastores'}?",
        f"Describe a complex algorithmic challenge you encountered and how you optimized time/space complexity."
    ]
    return {
        "company": req.company_name,
        "stage": req.stage,
        "generated_questions": questions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
