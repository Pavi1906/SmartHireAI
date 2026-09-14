# Phase 7 Implementation Plan: Sourcing Campaigns Integration

## 1. Goal
Integrate the existing `SourcingCampaigns.tsx` frontend page with the existing `/api/v1/campaigns` backend endpoints, removing reliance on Redux and `localStorage` for campaign persistence, and ensuring data flows directly from the authoritative database.

## 2. Existing Architecture
- **Backend:** `backend/app/api/v1/campaigns.py` exposes fully functional, authenticated, and company-isolated CRUD endpoints.
- **Frontend:** `SourcingCampaigns.tsx` manages a rich interactive matching engine but saves state to Redux and `localStorage`.

## 3. Files to Modify
- `frontend/src/pages/recruiter/SourcingCampaigns.tsx`

## 4. Files to Create
- `frontend/src/services/campaignService.ts`
- `frontend/src/types/campaign.ts` (if not already extracted)

## 5. Backend Changes
NONE. The backend is verified to be sufficient.

## 6. Frontend Service Changes
Implement `campaignService.ts` with:
- `listCampaigns()` (GET `/api/v1/campaigns`)
- `createCampaign(data)` (POST `/api/v1/campaigns`)
- `updateCampaign(id, data)` (PUT `/api/v1/campaigns/{id}`)
- `deleteCampaign(id)` (DELETE `/api/v1/campaigns/{id}`)

## 7. Type Changes
Create or update TypeScript interfaces matching `CampaignResponse`, `CampaignCreate`, and `CampaignUpdate` DTOs.

## 8. UI Changes
- Preserve existing deterministic matching engine logic (`calculateMatchScore`).
- Replace `dispatch(addCampaign)` etc., with pessimistic `campaignService` API calls.
- Add robust loading indicators (`setIsLoading`) while awaiting API responses.
- Implement error handling toasts or banners.

## 9. Routing/Navigation Changes
NONE. The page is already correctly routed at `/recruiter/campaigns`.

## 10. State-Management Strategy
- Migrate from Redux (`campaigns` array) to React local state (`useState`, `useEffect`).
- Fetch campaigns on component mount.
- On mutations (create/update/delete), await the API response and update local state to reflect the authoritative backend data.

## 11. Loading/Error Handling
Use boolean loading flags during async operations and string states for error messages, rendering them safely in the UI.

## 12. Authentication Strategy
Use the shared `apiClient` which automatically handles JWT headers.

## 13. Company-Isolation Considerations
Rely completely on the backend `ctx.company_id` enforcement. Do not pass recruiter IDs or company IDs from the frontend request body.

## 14. Testing Strategy
- Run `npm run lint` to catch TypeScript/React issues.
- Direct authenticated API requests to confirm the backend functions.

## 15. E2E Verification Strategy
Since browser automation via Playwright is currently blocked by environment constraints, perform direct API verifications for campaign creation/updating and rely on manual UI codebase inspection, similar to Phase 6.

## 16. Risks
- Shortlisting candidates in the Sourcing view modifies `candidates` array. We will need to ensure `candidateService` or equivalent is used to update the pipeline stage correctly on the backend, removing the legacy Redux `updateCandidateStage` completely.

## 17. Explicit list of things that must NOT be changed
- Do NOT change backend endpoints or DTOs.
- Do NOT change database schema.
- Do NOT redesign the Sourcing matching logic algorithm (`calculateMatchScore`).
- Do NOT rewrite CSS/Tailwind classes.
- Do NOT introduce new third-party form or state management libraries.
