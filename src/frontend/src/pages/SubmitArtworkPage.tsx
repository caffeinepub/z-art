import { useState } from 'react';
import SubmitArtworkForm from '../components/submissions/SubmitArtworkForm';
import SubmissionConfirmation from '../components/submissions/SubmissionConfirmation';
import { clearDraft } from '../utils/submitArtworkDraft';

export default function SubmitArtworkPage() {
  const [submissionId, setSubmissionId] = useState<bigint | null>(null);

  const handleSuccess = (id: bigint) => {
    clearDraft();
    setSubmissionId(id);
  };

  if (submissionId !== null) {
    return <SubmissionConfirmation submissionId={submissionId} />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Submit Artwork</h1>
          <p className="text-lg text-muted-foreground">
            Share your creative work with our community. All submissions are reviewed before being added to the gallery.
          </p>
        </div>

        <SubmitArtworkForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
