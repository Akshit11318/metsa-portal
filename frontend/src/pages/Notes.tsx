import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  StickyNote,
  Plus,
  Edit,
  Trash2,
  Filter,
  CheckCircle,
  Clock,
  User,
  Tag,
  Calendar,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/apiClient';
import { API_ENDPOINTS, getApiUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Note {
  id: number;
  content: string;
  createdBy: number;
  role: string;
  visibility: string;
  relatedType?: string;
  relatedId?: number;
  status: string;
  followUpDate?: string;
  year: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    username: string;
    role: string;
    core?: string;
  };
}

interface NoteFormData {
  content: string;
  visibility: 'all' | 'core' | 'admin';
  relatedType: string;
  relatedId: string;
  status: 'pending' | 'complete' | 'archived';
  followUpDate: string;
}

export default function Notes() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    relatedType: 'all',
    visibility: 'all_visibility',
    search: '',
  });

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number }>({
    open: false,
    id: 0,
  });

  // Form state
  const [formData, setFormData] = useState<NoteFormData>({
    content: '',
    visibility: 'all',
    relatedType: '',
    relatedId: '',
    status: 'pending',
    followUpDate: '',
  });

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await apiGet(getApiUrl(API_ENDPOINTS.NOTES));
      if (response.success) {
        setNotes(response.data);
        setFilteredNotes(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...notes];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((note) => note.status === filters.status);
    }

    if (filters.relatedType && filters.relatedType !== 'all') {
      filtered = filtered.filter((note) => note.relatedType === filters.relatedType);
    }

    if (filters.visibility && filters.visibility !== 'all_visibility') {
      filtered = filtered.filter((note) => note.visibility === filters.visibility);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(searchLower) ||
          note.creator?.username.toLowerCase().includes(searchLower)
      );
    }

    setFilteredNotes(filtered);
  }, [filters, notes]);

  // Handle add/edit note
  const handleSubmitNote = async () => {
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      const noteData: any = {
        content: formData.content,
        visibility: formData.visibility,
        status: formData.status,
      };

      if (formData.relatedType) noteData.relatedType = formData.relatedType;
      if (formData.relatedId) noteData.relatedId = parseInt(formData.relatedId);
      if (formData.followUpDate) noteData.followUpDate = formData.followUpDate;

      if (editingNote) {
        const response = await apiPatch(
          `${getApiUrl(API_ENDPOINTS.NOTES)}/${editingNote.id}`,
          noteData
        );
        if (response.success) {
          toast.success('Note updated successfully');
          fetchNotes();
        }
      } else {
        const response = await apiPost(getApiUrl(API_ENDPOINTS.NOTES), noteData);
        if (response.success) {
          toast.success('Note created successfully');
          fetchNotes();
        }
      }

      setShowAddDialog(false);
      setEditingNote(null);
      resetForm();
    } catch (error) {
      console.error('Failed to submit note:', error);
      toast.error('Failed to save note');
    }
  };

  // Handle delete note
  const handleDeleteNote = async () => {
    try {
      const response = await apiDelete(`${getApiUrl(API_ENDPOINTS.NOTES)}/${deleteDialog.id}`);
      if (response.success) {
        toast.success('Note deleted successfully');
        fetchNotes();
      }
      setDeleteDialog({ open: false, id: 0 });
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Handle edit note
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      content: note.content,
      visibility: note.visibility as 'all' | 'core' | 'admin',
      relatedType: note.relatedType || '',
      relatedId: note.relatedId?.toString() || '',
      status: note.status as 'pending' | 'complete' | 'archived',
      followUpDate: note.followUpDate
        ? new Date(note.followUpDate).toISOString().split('T')[0]
        : '',
    });
    setShowAddDialog(true);
  };

  // Handle mark complete
  const handleMarkComplete = async (noteId: number) => {
    try {
      const response = await apiPatch(`${getApiUrl(API_ENDPOINTS.NOTES)}/${noteId}`, {
        status: 'complete',
      });
      if (response.success) {
        toast.success('Note marked as complete');
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      visibility: 'all',
      relatedType: '',
      relatedId: '',
      status: 'pending',
      followUpDate: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
      case 'core':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'member':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'admin':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'core':
        return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'all':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const canEditNote = (note: Note) => {
    if (user?.role === 'admin') return true;
    if (note.createdBy === user?.id) return true;
    return false;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notes & Reminders</h1>
            <p className="text-sm text-muted-foreground">
              Manage notes across all modules ({filteredNotes.length} notes)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Filters</CardTitle>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content or creator..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Related Type</Label>
                <Select
                  value={filters.relatedType}
                  onValueChange={(value) => setFilters({ ...filters, relatedType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="transaction">Transaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select
                  value={filters.visibility}
                  onValueChange={(value) => setFilters({ ...filters, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_visibility">All Visibility</SelectItem>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="core">Core Only</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(filters.search || filters.status !== 'all' || filters.relatedType !== 'all' || filters.visibility !== 'all_visibility') && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({ status: 'all', relatedType: 'all', visibility: 'all_visibility', search: '' })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="col-span-full">
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading notes...</p>
                </CardContent>
              </Card>
            ) : filteredNotes.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notes found</p>
                  <Button onClick={() => setShowAddDialog(true)} className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="hover:shadow-lg transition-shadow duration-200 relative"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getRoleColor(note.role)}>
                            <User className="h-3 w-3 mr-1" />
                            {note.creator?.username || 'Unknown'}
                          </Badge>
                          <Badge className={getStatusColor(note.status)}>{note.status}</Badge>
                        </div>
                        {note.relatedType && (
                          <Badge variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {note.relatedType}
                          </Badge>
                        )}
                      </div>
                      {canEditNote(note) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, id: note.id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap mb-4">{note.content}</p>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge className={getVisibilityColor(note.visibility)} variant="outline">
                          Visible to: {note.visibility}
                        </Badge>
                        {note.creator?.core && (
                          <Badge variant="outline">{note.creator.core}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                      {note.followUpDate && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Clock className="h-3 w-3" />
                          Follow-up: {new Date(note.followUpDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {note.status === 'pending' && canEditNote(note) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => handleMarkComplete(note.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading notes...
                      </TableCell>
                    </TableRow>
                  ) : filteredNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No notes found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className={getRoleColor(note.role)} variant="outline">
                              {note.creator?.username || 'Unknown'}
                            </Badge>
                            {note.creator?.core && (
                              <span className="text-xs text-muted-foreground">
                                {note.creator.core}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2 text-sm">{note.content}</p>
                        </TableCell>
                        <TableCell>
                          {note.relatedType ? (
                            <Badge variant="outline">{note.relatedType}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(note.status)}>{note.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getVisibilityColor(note.visibility)}>
                            {note.visibility}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {note.followUpDate ? (
                            <span className="text-sm">
                              {new Date(note.followUpDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {note.status === 'pending' && canEditNote(note) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkComplete(note.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {canEditNote(note) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditNote(note)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialog({ open: true, id: note.id })}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add/Edit Note Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
            <DialogDescription>
              Create a note or reminder for tracking important information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter note content..."
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="core">Core Only</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="relatedType">Related To (Optional)</Label>
                <Select
                  value={formData.relatedType}
                  onValueChange={(value) => setFormData({ ...formData, relatedType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="transaction">Transaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="relatedId">Related ID (Optional)</Label>
                <Input
                  id="relatedId"
                  type="number"
                  value={formData.relatedId}
                  onChange={(e) => setFormData({ ...formData, relatedId: e.target.value })}
                  placeholder="Enter ID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingNote(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitNote}>
              {editingNote ? 'Update Note' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
