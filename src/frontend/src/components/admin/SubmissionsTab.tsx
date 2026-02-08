import { useState } from 'react';
import { useGetAllSubmissions, useApproveSubmission, useRejectSubmission } from '../../hooks/useAdminDashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X } from 'lucide-react';
import { SubmissionStatus } from '../../backend';
import { formatGBP } from '../../utils/gbpMoney';
import SoldArtworkImage from '../artworks/SoldArtworkImage';
import ArtworkLightbox from '../images/ArtworkLightbox';

interface SubmissionsTabProps {
  pendingOnly?: boolean;
}

export default function SubmissionsTab({ pendingOnly = false }: SubmissionsTabProps) {
  const { data: submissions, isLoading } = useGetAllSubmissions();
  const { mutate: approve, isPending: approving } = useApproveSubmission();
  const { mutate: reject, isPending: rejecting } = useRejectSubmission();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; sold: boolean } | null>(null);

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case SubmissionStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case SubmissionStatus.pending:
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleImageClick = (src: string, alt: string, sold: boolean) => {
    setSelectedImage({ src, alt, sold });
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter submissions if pendingOnly mode is enabled
  const displayedSubmissions = pendingOnly
    ? submissions?.filter((sub) => sub.status === SubmissionStatus.pending) || []
    : submissions || [];

  if (displayedSubmissions.length === 0) {
    const emptyMessage = pendingOnly
      ? 'There are no pending artwork submissions at this time.'
      : 'There are no artwork submissions yet.';

    return (
      <Card>
        <CardHeader>
          <CardTitle>{pendingOnly ? 'No Pending Submissions' : 'No Submissions'}</CardTitle>
          <CardDescription>{emptyMessage}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{pendingOnly ? 'Pending Submissions' : 'Artwork Submissions'}</CardTitle>
          <CardDescription>
            {pendingOnly ? 'Review pending artwork submissions' : 'Review and manage artwork submissions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artwork</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Price</TableHead>
                  {!pendingOnly && <TableHead>Status</TableHead>}
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSubmissions.map((submission) => (
                  <TableRow key={Number(submission.id)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                          onClick={() => handleImageClick(submission.artwork.imageUrl, submission.artwork.title, submission.artwork.sold)}
                        >
                          <SoldArtworkImage
                            src={submission.artwork.imageUrl}
                            alt={submission.artwork.title}
                            sold={submission.artwork.sold}
                            className="w-full h-full object-cover"
                            aspectClassName="w-16 h-16"
                            watermarkSize="sm"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{submission.artwork.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {submission.artwork.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{submission.artist.publicSiteUsername}</TableCell>
                    <TableCell>{formatGBP(submission.artwork.price)}</TableCell>
                    {!pendingOnly && <TableCell>{getStatusBadge(submission.status)}</TableCell>}
                    <TableCell>
                      {new Date(Number(submission.submittedAt) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {submission.status === SubmissionStatus.pending && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approve(submission.id)}
                            disabled={approving || rejecting}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reject(submission.id)}
                            disabled={approving || rejecting}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedImage && (
        <ArtworkLightbox
          src={selectedImage.src}
          alt={selectedImage.alt}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          sold={selectedImage.sold}
        />
      )}
    </>
  );
}
