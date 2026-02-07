import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface SubmissionConfirmationProps {
  submissionId: bigint;
}

export default function SubmissionConfirmation({ submissionId }: SubmissionConfirmationProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="font-display text-3xl">Submission Received!</CardTitle>
            <CardDescription>
              Thank you for submitting your artwork to Z'art
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Your artwork has been submitted for review. Our team will review your submission and you'll be notified once it's approved.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Submission ID: {submissionId.toString()}
              </p>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  Status: Pending Review
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: '/submit' })}
              >
                Submit Another
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate({ to: '/gallery' })}
              >
                Browse Gallery
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
