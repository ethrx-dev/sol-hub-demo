from pydantic import BaseModel


class InnovatorAssessRequest(BaseModel):
    problem_clarity: int = 0
    solution_clarity: int = 0
    assistance_needed: str = ""


class InnovatorAssessResponse(BaseModel):
    innovator_type: int
    label: str
    description: str
    problem: str
    solution: str
    assistance: str
