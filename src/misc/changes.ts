export const changes = {
  changelog: [
    "feat: add jspdf and jspdf-autotable dependencies, and include Aptos font files and images",
    "feat: implement SignatureInput component for drawing and uploading signatures; update TermsAndConditions structure and add jsPDF type definitions",
    "feat: enhance client addition process with parent client validation and improve account executive data structure",
    `feat: add conforme document generation and management features

- Implemented DocumentPage component for rendering document layout with header and footer.
- Created PaymentTab component for managing payment terms and methods.
- Added GenerateConformeButton for configuring print options before generating PDF.
- Developed AcknowledgementSection to display signatories' information.
- Introduced LesseeSection for displaying lessee details.
- Created SitesSection to manage and display site information with financial calculations.
- Added SitesTab for handling site items and their images.
- Implemented TermsTab for managing additional terms and conditions.
- Updated view.tsx to include conditional rendering for user actions.
- Refactored Conforme component to lazy load GenerateConforme for improved performance.`,
  ],
};
