# Prescription Flow: User Frontend

This document explains how prescriptions are handled in the consumer-facing application, including upload, review simulation, and checkout.

## 1. Upload Process
Located in `/apps/frontend/src/app/prescription/page.tsx`, the upload flow handles:
- **Form Data**: Patient name, contact info, and notes.
- **File Handling**: Up to 5 files (PDF, JPG, PNG) are read as `DataURL` strings using `readFilesAsDataUrls`.
- **API Call**: Submits to `POST /api/prescriptions` via the `useUploadPrescription` hook.

## 2. Viewing Prescriptions
Located in `/apps/frontend/src/app/prescriptions/page.tsx`, the listing page:
- **Data Fetching**: Uses the `usePrescriptions` hook to pull real-time data from the backend database (migrated from localStorage).
- **Status Mapping**: Displays status pills (Under Review, Available, etc.) based on the backend response.

## 3. Pharmacist Review (Simulation)
Because the Admin Dashboard is still in development, a **"Demo: Verify Now"** button is integrated into the `PrescriptionCard`:
- **Simulated Action**: Updates the prescription status to `available` and sets a random `estimatedPrice`.
- **API Integration**: Uses `useUpdatePrescriptionStatus` to call the backend `PUT /api/prescriptions/:id/status` endpoint.

## 4. Checkout Integration
Once a prescription is marked as **"Available"**:
- **Pricing**: The `estimatedPrice` becomes visible.
- **Cart Session**: Clicking "Proceed to Payment" stores the prescription ID in `localStorage` to link it to the checkout session.
- **Automatic Clearing**: After the order is placed, the checkout session is cleared.

## Key Files
- `src/app/prescription/page.tsx`: Upload UI.
- `src/app/prescriptions/page.tsx`: Management List UI.
- `src/hooks/usePrescriptions.ts`: Data fetching and mutation hooks.
- `src/services/api.ts`: API service definition.
