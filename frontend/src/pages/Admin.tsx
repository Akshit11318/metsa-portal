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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Megaphone,
  Users,
  StickyNote,
  Archive,
  TrendingUp,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  UserCog,
  BarChart3,
  Shield,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/apiClient';
import { API_ENDPOINTS, getApiUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface AdminUpdate {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  year: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  username: string;
  role: 'admin' | 'core' | 'member';
  core?: string;
  year: string;
  createdAt: string;
  updatedAt: string;
}

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
  creator?: {
    username: string;
    role: string;
    core?: string;
  };
}

interface Stats {
  totalUsers: number;
  totalMembers: number;
  totalNotes: number;
  totalTransactions: number;
  totalEvents: number;
  totalSponsors: number;
  pendingTransactions: number;
  upcomingEvents: number;
  financial: {
    totalInflow: number;
    totalOutflow: number;
    balance: number;
  };
}

export default function Admin() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);

  // Updates state
  const [updates, setUpdates] = useState<AdminUpdate[]>([]);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<AdminUpdate | null>(null);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    role: 'member' as 'admin' | 'core' | 'member',
    core: '',
    year: '2025',
  });

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesFilter, setNotesFilter] = useState({
    core: '',
    relatedType: '',
    status: '',
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'update' | 'user' | 'note';
    id: number;
  }>({ open: false, type: 'update', id: 0 });

  // Archive state
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveSummary, setArchiveSummary] = useState('');

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiGet(getApiUrl(API_ENDPOINTS.ADMIN_STATS));
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch updates
  const fetchUpdates = async () => {
    try {
      const response = await apiGet(getApiUrl(API_ENDPOINTS.ADMIN_UPDATES));
      if (response.success) {
        setUpdates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error);
      toast.error('Failed to load updates');
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await apiGet(getApiUrl(API_ENDPOINTS.ADMIN_USERS));
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  };

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (notesFilter.status) params.append('status', notesFilter.status);
      if (notesFilter.relatedType) params.append('relatedType', notesFilter.relatedType);

      const url = `${getApiUrl(API_ENDPOINTS.NOTES)}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiGet(url);
      if (response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast.error('Failed to load notes');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      fetchUpdates();
      fetchUsers();
      fetchNotes();
    }
  }, [user]);

  // Handle create/update announcement
  const handleSubmitUpdate = async () => {
    if (!updateForm.title.trim() || !updateForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      if (editingUpdate) {
        const response = await apiPatch(
          `${getApiUrl(API_ENDPOINTS.ADMIN_UPDATES)}/${editingUpdate.id}`,
          updateForm
        );
        if (response.success) {
          toast.success('Update edited successfully');
          fetchUpdates();
        }
      } else {
        const response = await apiPost(getApiUrl(API_ENDPOINTS.ADMIN_UPDATES), updateForm);
        if (response.success) {
          toast.success('Update posted successfully');
          fetchUpdates();
        }
      }
      setShowUpdateDialog(false);
      setEditingUpdate(null);
      setUpdateForm({ title: '', content: '', priority: 'normal' });
    } catch (error) {
      console.error('Failed to submit update:', error);
      toast.error('Failed to post update');
    }
  };

  // Handle update user
  const handleSubmitUser = async () => {
    if (!editingUser) return;

    try {
      const response = await apiPatch(
        `${getApiUrl(API_ENDPOINTS.ADMIN_USERS)}/${editingUser.id}`,
        userForm
      );
      if (response.success) {
        toast.success('User updated successfully');
        fetchUsers();
        setShowUserDialog(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (deleteDialog.type === 'update') {
        await apiDelete(`${getApiUrl(API_ENDPOINTS.ADMIN_UPDATES)}/${deleteDialog.id}`);
        toast.success('Update deleted successfully');
        fetchUpdates();
      } else if (deleteDialog.type === 'user') {
        await apiDelete(`${getApiUrl(API_ENDPOINTS.ADMIN_USERS)}/${deleteDialog.id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } else if (deleteDialog.type === 'note') {
        await apiDelete(`${getApiUrl(API_ENDPOINTS.NOTES)}/${deleteDialog.id}`);
        toast.success('Note deleted successfully');
        fetchNotes();
      }
      setDeleteDialog({ open: false, type: 'update', id: 0 });
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete item');
    }
  };

  // Handle note status update
  const handleUpdateNoteStatus = async (noteId: number, status: string) => {
    try {
      const response = await apiPatch(`${getApiUrl(API_ENDPOINTS.NOTES)}/${noteId}`, {
        status,
      });
      if (response.success) {
        toast.success('Note status updated');
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'normal':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'low':
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getRoleBadgeColor = (role: string) => {
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

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Portal management and oversight</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'updates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('updates')}
            className="flex items-center gap-2"
          >
            <Megaphone className="h-4 w-4" />
            Updates
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === 'notes' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notes')}
            className="flex items-center gap-2"
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </Button>
          <Button
            variant={activeTab === 'archive' ? 'default' : 'outline'}
            onClick={() => setActiveTab('archive')}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMembers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.upcomingEvents} upcoming
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Inflow</span>
                    <span className="font-medium text-green-600">
                      ₹{stats.financial.totalInflow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Outflow</span>
                    <span className="font-medium text-red-600">
                      ₹{stats.financial.totalOutflow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Balance</span>
                    <span className="font-bold text-lg">
                      ₹{stats.financial.balance.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portal Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Notes</span>
                    <span className="font-medium">{stats.totalNotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Transactions</span>
                    <span className="font-medium">{stats.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Sponsors</span>
                    <span className="font-medium">{stats.totalSponsors}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab('updates');
                      setShowUpdateDialog(true);
                    }}
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('users')}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('archive')}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Year
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Global Updates</h2>
              <Button
                onClick={() => {
                  setEditingUpdate(null);
                  setUpdateForm({ title: '', content: '', priority: 'normal' });
                  setShowUpdateDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Update
              </Button>
            </div>

            <div className="space-y-4">
              {updates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No updates posted yet</p>
                  </CardContent>
                </Card>
              ) : (
                updates.map((update) => (
                  <Card key={update.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{update.title}</CardTitle>
                            <Badge className={getPriorityColor(update.priority)}>
                              {update.priority}
                            </Badge>
                          </div>
                          <CardDescription>
                            Posted on {new Date(update.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUpdate(update);
                              setUpdateForm({
                                title: update.title,
                                content: update.content,
                                priority: update.priority,
                              });
                              setShowUpdateDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                type: 'update',
                                id: update.id,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{update.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Access Management</h2>
              <Button onClick={fetchUsers}>Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Core</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(u.role)}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.core || '-'}</TableCell>
                        <TableCell>{u.year}</TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser(u);
                                setUserForm({
                                  role: u.role,
                                  core: u.core || '',
                                  year: u.year,
                                });
                                setShowUserDialog(true);
                              }}
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={u.id === user?.id}
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  type: 'user',
                                  id: u.id,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Portal Notes Overview</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Related Type</Label>
                    <Select
                      value={notesFilter.relatedType}
                      onValueChange={(value) => {
                        setNotesFilter({ ...notesFilter, relatedType: value });
                        fetchNotes();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="sponsor">Sponsor</SelectItem>
                        <SelectItem value="transaction">Transaction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={notesFilter.status}
                      onValueChange={(value) => {
                        setNotesFilter({ ...notesFilter, status: value });
                        fetchNotes();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchNotes} className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getRoleBadgeColor(note.role)}>
                            {note.creator?.username || 'Unknown'}
                          </Badge>
                          {note.relatedType && (
                            <Badge variant="outline">{note.relatedType}</Badge>
                          )}
                          <Badge
                            className={
                              note.status === 'complete'
                                ? 'bg-green-500/20 text-green-600'
                                : note.status === 'archived'
                                  ? 'bg-gray-500/20 text-gray-600'
                                  : 'bg-yellow-500/20 text-yellow-600'
                            }
                          >
                            {note.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {new Date(note.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {note.status !== 'complete' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateNoteStatus(note.id, 'complete')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              type: 'note',
                              id: note.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    {note.followUpDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Follow-up: {new Date(note.followUpDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Year Continuity & Archival</CardTitle>
                <CardDescription>
                  Archive the current year's data and prepare for the next academic year
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-600">Important Notice</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Archiving will preserve all current year data and prepare the system
                        for a new academic year. This action should be done at the end of
                        each academic year.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Current Year Statistics</h4>
                    {stats && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Members:</span>
                          <span className="font-medium">{stats.totalMembers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Events:</span>
                          <span className="font-medium">{stats.totalEvents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Transactions:</span>
                          <span className="font-medium">{stats.totalTransactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Notes:</span>
                          <span className="font-medium">{stats.totalNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Archive Options</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="export-data" defaultChecked />
                        <label htmlFor="export-data">Export data to CSV</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="generate-report" defaultChecked />
                        <label htmlFor="generate-report">Generate year-end report</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notify-users" defaultChecked />
                        <label htmlFor="notify-users">Notify all users</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="archive-summary">Year Summary Notes</Label>
                  <Textarea
                    id="archive-summary"
                    placeholder="Enter a summary of the year's activities, achievements, and notes for future reference..."
                    value={archiveSummary}
                    onChange={(e) => setArchiveSummary(e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={() => setShowArchiveDialog(true)}
                  className="w-full"
                  variant="destructive"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Current Year
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Admin Features</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Database backup and restore</p>
                  <p>• Bulk user imports from CSV</p>
                  <p>• Email notification system</p>
                  <p>• Activity audit logs</p>
                  <p>• Custom report generation</p>
                  <p>• Portal theme customization</p>
                  <p>• Automated reminders and deadlines</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUpdate ? 'Edit Update' : 'Post New Update'}</DialogTitle>
            <DialogDescription>
              Create a global announcement for all portal users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="update-title">Title</Label>
              <Input
                id="update-title"
                value={updateForm.title}
                onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                placeholder="Update title"
              />
            </div>
            <div>
              <Label htmlFor="update-content">Content</Label>
              <Textarea
                id="update-content"
                value={updateForm.content}
                onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                placeholder="Update content"
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="update-priority">Priority</Label>
              <Select
                value={updateForm.priority}
                onValueChange={(value: any) =>
                  setUpdateForm({ ...updateForm, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUpdate}>
              {editingUpdate ? 'Update' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Access</DialogTitle>
            <DialogDescription>
              Update user role and permissions for {editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {userForm.role === 'core' && (
              <div>
                <Label htmlFor="user-core">Core Team</Label>
                <Select
                  value={userForm.core}
                  onValueChange={(value) => setUserForm({ ...userForm, core: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select core" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="outreach">Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="user-year">Year</Label>
              <Select
                value={userForm.year}
                onValueChange={(value) => setUserForm({ ...userForm, year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              {deleteDialog.type === 'update'
                ? 'update'
                : deleteDialog.type === 'user'
                  ? 'user account'
                  : 'note'}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Current Year?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive all current year data and prepare the system for the next
              academic year. Make sure you have backed up all important data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success('Archive feature coming soon');
                setShowArchiveDialog(false);
              }}
              className="bg-destructive"
            >
              Archive Year
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
