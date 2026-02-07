import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useReplaceDataset } from '../../hooks/useReplaceDataset';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export default function ReplaceDatasetControl() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const replaceDataset = useReplaceDataset();

  const handleReplace = async () => {
    try {
      await replaceDataset.mutateAsync();
      toast.success('Dataset replaced successfully', {
        description: 'All users and artworks have been replaced with demo data.',
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to replace dataset:', error);
      toast.error('Failed to replace dataset', {
        description: error.message || 'An error occurred while replacing the dataset.',
      });
    }
  };

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold mb-2 text-destructive">
            Replace Demo Data
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This action will permanently delete all existing users, artist profiles, artworks,
            submissions, and purchase inquiries, replacing them with fresh demo data. This cannot
            be undone.
          </p>
        </div>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={replaceDataset.isPending}
              className="shrink-0"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {replaceDataset.isPending ? 'Replacing...' : 'Replace users and artworks'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all existing data
                including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All user profiles</li>
                  <li>All artist profiles</li>
                  <li>All artworks</li>
                  <li>All submissions</li>
                  <li>All purchase inquiries</li>
                </ul>
                <p className="mt-3 font-semibold">
                  The system will be reset with fresh demo data.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={replaceDataset.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReplace}
                disabled={replaceDataset.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {replaceDataset.isPending ? 'Replacing...' : 'Yes, replace all data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
