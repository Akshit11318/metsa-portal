import { useState, useEffect, useRef } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Search, UserPlus, FileDown, FileUp, Edit2, Trash2, Upload } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS, getCsrfToken } from '@/lib/api';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

interface Member {
  id: number;
  name: string;
  rollNo?: string;
  program: string;
  joinYear: string;
  gradYear: string;
}

interface MemberFormData {
  name: string;
  rollNo: string;
  program: string;
  joinYear: string;
  gradYear: string;
}

export default function Members() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showUploadCSV, setShowUploadCSV] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [uploadingCSV, setUploadingCSV] = useState(false);

  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    rollNo: '',
    program: 'B.Tech',
    joinYear: '2024',
    gradYear: '2028',
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiGet(getApiUrl(API_ENDPOINTS.MEMBERS));
      if (response.success) {
        setMembers(response.data);
        setFilteredMembers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    let filtered = members;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.program.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply program filter
    if (filterProgram !== 'all') {
      filtered = filtered.filter((member) => member.program === filterProgram);
    }

    setFilteredMembers(filtered);
    setSelectedIds([]); // Clear selection when filters change
  }, [searchTerm, filterProgram, members]);

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.program || !formData.joinYear) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingMember) {
        const response = await apiPatch(`${getApiUrl(API_ENDPOINTS.MEMBERS)}/${editingMember.id}`, formData);
        if (response.success) {
          toast.success('Member updated successfully');
          fetchMembers();
          setShowAddMember(false);
          setEditingMember(null);
        }
      } else {
        const response = await apiPost(getApiUrl(API_ENDPOINTS.MEMBERS), formData);
        if (response.success) {
          toast.success('Member added successfully');
          fetchMembers();
          setShowAddMember(false);
        }
      }
      setFormData({ name: '', rollNo: '', program: 'B.Tech', joinYear: '2024', gradYear: '2028' });
    } catch (error) {
      console.error('Failed to save member:', error);
      toast.error('Failed to save member');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const response = await apiDelete(`${getApiUrl(API_ENDPOINTS.MEMBERS)}/${id}`);
      if (response.success) {
        toast.success('Member deleted successfully');
        fetchMembers();
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
      toast.error('Failed to delete member');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error('No members selected');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} member(s)?`)) return;

    try {
      let deletedCount = 0;
      for (const id of selectedIds) {
        const response = await apiDelete(`${getApiUrl(API_ENDPOINTS.MEMBERS)}/${id}`);
        if (response.success) deletedCount++;
      }
      toast.success(`${deletedCount} member(s) deleted successfully`);
      setSelectedIds([]);
      fetchMembers();
    } catch (error) {
      console.error('Failed to delete members:', error);
      toast.error('Failed to delete some members');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Roll No', 'Program', 'Join Year', 'Grad Year'];
    const csvData = filteredMembers.map((member) => [
      member.name, member.rollNo || '', member.program, member.joinYear, member.gradYear
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Members exported to CSV');
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      setUploadingCSV(true);
      const formData = new FormData();
      formData.append('file', file);
      const { token } = useAuthStore.getState();
      const csrfToken = getCsrfToken();

      const response = await fetch(`${getApiUrl(API_ENDPOINTS.MEMBERS)}/upload-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        fetchMembers();
        setShowUploadCSV(false);
      } else {
        toast.error(result.message || 'Failed to upload CSV');
      }
    } catch (error) {
      console.error('Failed to upload CSV:', error);
      toast.error('Failed to upload CSV');
    } finally {
      setUploadingCSV(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      rollNo: member.rollNo || '',
      program: member.program,
      joinYear: member.joinYear,
      gradYear: member.gradYear,
    });
    setShowAddMember(true);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Members Directory</h1>
            <p className="text-sm text-muted-foreground">
              Student members • {filteredMembers.length} total
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, roll no, or program..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterProgram} onValueChange={setFilterProgram}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="M.Tech">M.Tech</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowAddMember(true)} className="bg-gradient-primary">
                    <UserPlus className="h-4 w-4 mr-2" />Add Member
                  </Button>
                  <Button variant="outline" onClick={handleExportCSV}>
                    <FileDown className="h-4 w-4 mr-2" />Export CSV
                  </Button>
                  <Button variant="outline" onClick={() => setShowUploadCSV(true)}>
                    <FileUp className="h-4 w-4 mr-2" />Import CSV
                  </Button>
                  {selectedIds.length > 0 && (
                    <Button variant="destructive" onClick={handleDeleteSelected}>
                      <Trash2 className="h-4 w-4 mr-2" />Delete Selected ({selectedIds.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && (
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                          onChange={handleSelectAll}
                          className="cursor-pointer"
                        />
                      </TableHead>
                    )}
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Join Year</TableHead>
                    <TableHead>Grad Year</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell></TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
                  ) : (
                    filteredMembers.map((member, index) => (
                      <motion.tr key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className="hover:bg-muted/50">
                        {isAdmin && (
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(member.id)}
                              onChange={() => handleSelectOne(member.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{member.rollNo || '-'}</TableCell>
                        <TableCell><Badge variant="outline">{member.program}</Badge></TableCell>
                        <TableCell className="text-sm">{member.joinYear}</TableCell>
                        <TableCell className="text-sm">{member.gradYear || '-'}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditMember(member)}><Edit2 className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input id="rollNo" value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} placeholder="e.g., 2024MME001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program <span className="text-red-500">*</span></Label>
              <Select value={formData.program} onValueChange={(value) => setFormData({ ...formData, program: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech">B.Tech</SelectItem>
                  <SelectItem value="M.Tech">M.Tech</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="joinYear">Join Year <span className="text-red-500">*</span></Label>
                <Input id="joinYear" value={formData.joinYear} onChange={(e) => setFormData({ ...formData, joinYear: e.target.value })} placeholder="2024" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradYear">Grad Year</Label>
                <Input id="gradYear" value={formData.gradYear} onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })} placeholder="2028" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowAddMember(false); setEditingMember(null); setFormData({ name: '', rollNo: '', program: 'B.Tech', joinYear: '2024', gradYear: '2028' }); }}>Cancel</Button>
              <Button type="submit" className="bg-gradient-primary">{editingMember ? 'Update' : 'Add'} Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadCSV} onOpenChange={setShowUploadCSV}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Import Members from CSV</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">CSV file should have columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>name</strong> (required)</li>
                <li><strong>rollNo</strong></li>
                <li><strong>program</strong> (required)</li>
                <li><strong>joinYear</strong> (required)</li>
                <li><strong>gradYear</strong></li>
              </ul>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">{uploadingCSV ? 'Uploading...' : 'Click to upload CSV file'}</p>
              </label>
            </div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setShowUploadCSV(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
