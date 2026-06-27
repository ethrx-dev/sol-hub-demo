"use client";

import { SubmissionWizard } from "@/src/components/forms/submission-wizard";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit New Project</h1>
        <p className="mt-1 text-muted-foreground">
          Follow the steps below to submit your project for review.
        </p>
      </div>
      <SubmissionWizard />
    </div>
  );
}
