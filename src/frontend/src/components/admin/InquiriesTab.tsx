import { useGetAllPurchaseInquiries } from '../../hooks/useAdminDashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatGBP } from '../../utils/gbpMoney';
import ArtworkImage from '../images/ArtworkImage';

export default function InquiriesTab() {
  const { data: inquiries, isLoading } = useGetAllPurchaseInquiries();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Inquiries</CardTitle>
          <CardDescription>There are no purchase inquiries yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Inquiries</CardTitle>
        <CardDescription>View all purchase inquiries from potential buyers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artwork</TableHead>
                <TableHead>Buyer Name</TableHead>
                <TableHead>Buyer Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={Number(inquiry.id)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex-shrink-0">
                        <ArtworkImage
                          src={inquiry.artwork.imageUrl}
                          alt={inquiry.artwork.title}
                          className="w-12 h-12 object-cover rounded"
                          aspectClassName="w-12 h-12"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{inquiry.artwork.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatGBP(inquiry.artwork.price)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{inquiry.buyerName}</TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${inquiry.buyerEmail}`}
                      className="text-primary hover:underline"
                    >
                      {inquiry.buyerEmail}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs line-clamp-2">{inquiry.message || '—'}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(Number(inquiry.createdAt) / 1000000).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
