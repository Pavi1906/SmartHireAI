# Phase 7 Audit: Sourcing Campaigns Integration

## 1. Identified Feature for Phase 7
**Recommended Phase 7 Feature**: Sourcing Campaigns (`frontend/src/pages/recruiter/SourcingCampaigns.tsx`)

## 2. Why This Feature Is Next
The `SourcingCampaigns.tsx` page is a critical recruiter module responsible for semantic candidate matching and talent discovery. However, inspection reveals it is completely detached from the backend API:
- It relies on Redux state (`useSelector`, `useDispatch`) for all state management.
- It uses a legacy `localStorage` persistence helper (`persistRecruiterState`).
- Meanwhile, a fully functional backend API (`backend/app/api/v1/campaigns.py`) and service (`SourcingService`) already exist to manage campaigns securely.

## 3. Current State (Frontend vs Backend)
- **Frontend State**: The UI is robust. It allows creating campaigns, setting match thresholds, running deterministic matching (`calculateMatchScore`), toggling campaign status, and deleting campaigns. However, it mutates global Redux state and persists to `localStorage`.
- **Backend State**: The backend provides standard CRUD operations (`GET`, `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`) on `/api/v1/campaigns`.

## 4. Operation Mapping Table

| Frontend Operation | Current Implementation | Backend Endpoint | Method | Auth | Company Isolation | Sufficient? |
|---|---|---|---|---|---|---|
| **List Campaigns** | Redux state (`useSelector`) | `/api/v1/campaigns` | `GET` | ✅ | ✅ (ctx.company_id) | ✅ YES |
| **Create Campaign** | Redux `addCampaign` | `/api/v1/campaigns` | `POST` | ✅ | ✅ (ctx.company_id) | ✅ YES |
| **Toggle Status** | Redux `toggleCampaignStatus` | `/api/v1/campaigns/{id}` | `PUT` | ✅ | ✅ (ctx.company_id) | ✅ YES |
| **Delete Campaign** | Redux `deleteCampaign` | `/api/v1/campaigns/{id}` | `DELETE` | ✅ | ✅ (ctx.company_id) | ✅ YES |
| **Candidate Shortlist** | Redux `updateCandidateStage` | `/api/v1/applications/{id}/stage` (via applications/candidates logic) | `PUT` | ✅ | ✅ | ⚠️ Need to check application flow |

## 5. Data Contract Audit
**Frontend `Campaign` Interface:**
```typescript
export interface Campaign {
  id: string;
  name: string;
  jobId?: string;
  status: 'active' | 'completed';
  criteria?: { minScore: number };
  results: string[];
  createdAt: string;
  updatedAt: string;
}
```
**Backend `CampaignResponse` DTO:**
```python
class CampaignResponse(BaseModel):
    id: str
    name: str
    jobId: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    status: str
    results: List[str] = Field(default_factory=list)
    createdAt: str
    updatedAt: str
```
**Conclusion:** The schemas align perfectly. No renaming or mapping changes required.

## 6. Authentication Audit
The existing SmartHireAI frontend uses a centralized `apiClient` Axios instance configured with a request interceptor to inject the JWT `Authorization: Bearer <token>` header on every request. The integration will leverage this securely without custom auth logic.

## 7. Company Isolation Audit
**VERIFIED:** The backend router `campaigns.py` uses the `get_current_recruiter` dependency to inject the `RecruiterContext`. The `ctx.company_id` is passed directly into the `SourcingService` for all operations, safely isolating campaigns per company.

## 8. Integration Gap Analysis
- **A. Already integrated**: N/A
- **B. Frontend integration required**: Sourcing Campaigns page requires full refactoring to replace Redux/localStorage with React local state and backend API calls using `apiClient`.
- **C. Backend modification required**: NONE.
- **D. Data/schema modification required**: NONE.
- **E. UI-only improvement**: Need to add loading states for API transactions.

## 9. Required Changes Summary
- **Frontend:** Remove `persistRecruiterState` and Redux mutations for campaigns.
- **Services:** Create `frontend/src/services/campaignService.ts` utilizing `apiClient`.
- **Types:** Extract `Campaign` to `frontend/src/types/campaign.ts`.
- **Backend:** NONE
- **Database:** NONE
- **New Endpoints:** NONE
