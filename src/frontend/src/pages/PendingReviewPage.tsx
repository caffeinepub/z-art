import SubmissionsTab from '../components/admin/SubmissionsTab';

export default function PendingReviewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif text-foreground">Pending Review</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve or reject pending artwork submissions
        </p>
      </div>
      <SubmissionsTab pendingOnly />
    </div>
  );
}
