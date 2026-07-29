from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from src.deps import DbSession, CurrentUser
from src.models.profile import Profile
from src.schemas.innovator import InnovatorAssessRequest, InnovatorAssessResponse

router = APIRouter(prefix="/api/innovator", tags=["innovator"])


INNOVATOR_TYPES = {
    1: {
        "label": "Explorer",
        "description": "You sense something is wrong but aren't sure what it is yet. You need help focusing, researching, and finding your direction.",
        "problem": "Feel there's a problem",
        "solution": "Vague idea of solution",
        "assistance": "Focus, research, identify",
    },
    2: {
        "label": "Definer",
        "description": "You know the problem and have a specific solution in mind. You need help defining it clearly and building a feasible business plan.",
        "problem": "Feel a problem",
        "solution": "Have a specific solution",
        "assistance": "Define & describe, feasibility & business plan",
    },
    3: {
        "label": "Resolver",
        "description": "You know the general problem and have a vague solution. You need help defining it and researching possible approaches.",
        "problem": "Know general problem",
        "solution": "Have vague solution",
        "assistance": "Define & describe, research solution(s)",
    },
    4: {
        "label": "Implementer",
        "description": "You know exactly what the problem is and have a clear solution. You need business plan review and financing options.",
        "problem": "Know specific problem",
        "solution": "Have specific solution",
        "assistance": "Business plan review, financing options",
    },
}


def _compute_innovator_type(answers: dict) -> int:
    problem_clarity = answers.get("problem_clarity", 0)
    solution_clarity = answers.get("solution_clarity", 0)
    assistance_needed = answers.get("assistance_needed", "")

    if problem_clarity <= 2 and solution_clarity <= 2:
        return 1
    if problem_clarity >= 3 and solution_clarity >= 3 and "financing" in assistance_needed:
        return 4
    if problem_clarity >= 3 and solution_clarity <= 2:
        return 3
    if problem_clarity >= 3 and solution_clarity >= 3:
        return 2

    return 1


@router.post("/assess", response_model=InnovatorAssessResponse)
async def assess_innovator(
    body: InnovatorAssessRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    if current_user.role != "innovator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only innovators can complete this assessment",
        )

    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=current_user.id, role_specific_data={})
        db.add(profile)

    innovator_type = _compute_innovator_type(body.model_dump())
    type_info = INNOVATOR_TYPES[innovator_type]

    role_data = dict(profile.role_specific_data or {})
    role_data["innovator_type"] = innovator_type
    role_data["assessment_answers"] = body.model_dump()
    profile.role_specific_data = role_data

    await db.flush()

    return InnovatorAssessResponse(
        innovator_type=innovator_type,
        label=type_info["label"],
        description=type_info["description"],
        problem=type_info["problem"],
        solution=type_info["solution"],
        assistance=type_info["assistance"],
    )
