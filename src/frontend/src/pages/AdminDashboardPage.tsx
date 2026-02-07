import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubmissionsTab from '../components/admin/SubmissionsTab';
import InquiriesTab from '../components/admin/InquiriesTab';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage artwork submissions and purchase inquiries
        </p>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="inquiries">Purchase Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <SubmissionsTab />
        </TabsContent>

        <TabsContent value="inquiries">
          <InquiriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

