import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Plus, FileDown, TrendingUp, TrendingDown, IndianRupee,
  Calendar, Bell, CheckCircle, XCircle, Eye, Upload
} from 'lucide-react';
import { getApiUrl, API_ENDPOINTS, getBackendFileUrl } from '@/lib/api';
import { apiGet, apiPost, apiPatch } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

interface Transaction {
  id: number;
  type: 'inflow' | 'outflow';
  amount: number;
  purpose: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  date: string;
  approvedBy?: {
    username: string;
    role: string;
  };
}

interface Summary {
  totalInflow: number;
  totalOutflow: number;
  balance: number;
}

interface TransactionFormData {
  type: 'inflow' | 'outflow';
  amount: string;
  purpose: string;
  category: string;
  date: string;
  receiptFile: File | null;
}

export default function FinOps() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalInflow: 0, totalOutflow: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Form data
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'inflow',
    amount: '',
    purpose: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    receiptFile: null,
  });

  const [noteContent, setNoteContent] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiGet(getApiUrl(API_ENDPOINTS.FINOPS));
      if (response.success) {
        setTransactions(response.data.transactions);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filtered transactions
  const filteredTransactions = transactions.filter((txn) => {
    const typeMatch = filterType === 'all' || txn.type === filterType;
    const statusMatch = filterStatus === 'all' || txn.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Handle add transaction
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.purpose || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploadingReceipt(true);

      // Upload receipt file first if exists
      let receiptUrl = '';
      if (formData.receiptFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('receipt', formData.receiptFile);

        const uploadResponse = await fetch(`${getApiUrl(API_ENDPOINTS.FINOPS)}/upload-receipt`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload receipt');
        }

        const uploadData = await uploadResponse.json();
        receiptUrl = uploadData.data.receiptUrl;
      }

      // Create transaction
      const response = await apiPost(getApiUrl(API_ENDPOINTS.FINOPS), {
        type: formData.type,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        category: formData.category,
        date: formData.date,
        receiptUrl,
      });

      if (response.success) {
        toast.success('Transaction added successfully');
        fetchTransactions();
        setShowAddTransaction(false);
        setFormData({
          type: 'inflow',
          amount: '',
          purpose: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          receiptFile: null,
        });
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Handle approve/reject
  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const response = await apiPatch(`${getApiUrl(API_ENDPOINTS.FINOPS)}/${id}`, { status });
      if (response.success) {
        toast.success(`Transaction ${status}`);
        fetchTransactions();
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const response = await apiPost(getApiUrl(API_ENDPOINTS.NOTES), {
        content: noteContent,
        relatedType: 'transaction',
        relatedId: selectedTransaction?.id,
        visibility: 'all',
      });
      if (response.success) {
        toast.success('Note added successfully');
        setShowNotesDialog(false);
        setNoteContent('');
        setSelectedTransaction(null);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error('Failed to add note');
    }
  };

  // Handle set reminder
  const handleSetReminder = async () => {
    if (!reminderDate) {
      toast.error('Please select a date');
      return;
    }

    try {
      const response = await apiPost(getApiUrl(API_ENDPOINTS.NOTES), {
        content: `Follow-up for: ${selectedTransaction?.purpose}`,
        relatedType: 'transaction',
        relatedId: selectedTransaction?.id,
        followUpDate: reminderDate,
        status: 'pending',
      });
      if (response.success) {
        toast.success('Reminder set successfully');
        setShowReminderDialog(false);
        setReminderDate('');
        setSelectedTransaction(null);
      }
    } catch (error) {
      console.error('Failed to set reminder:', error);
      toast.error('Failed to set reminder');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Purpose', 'Category', 'Status', 'Approver'];
    const csvData = filteredTransactions.map((txn) => [
      new Date(txn.date).toLocaleDateString(),
      txn.type,
      txn.amount,
      txn.purpose,
      txn.category || '',
      txn.status,
      txn.approvedBy?.username || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...csvData].map((row) => row.join(',')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Transactions exported to CSV');
  };

  const isAdmin = user?.role === 'admin';
  const canManage = isAdmin || user?.role === 'core';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'inflow'
      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      : 'bg-orange-500/10 text-orange-500 border-orange-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">FinOps</h1>
            <p className="text-sm text-muted-foreground">
              Financial operations and transactions
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Inflow
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                ₹{summary.totalInflow.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Funds received</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Outflow
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                ₹{summary.totalOutflow.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Expenses made</p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${summary.balance >= 0
            ? 'from-green-500/10 to-green-600/10 border-green-500/20'
            : 'from-red-500/10 to-red-600/10 border-red-500/20'
            }`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Balance
              </CardTitle>
              <IndianRupee className={`h-5 w-5 ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{summary.balance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Available funds</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inflow">Inflow</SelectItem>
                    <SelectItem value="outflow">Outflow</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex-1"></div>

                {canManage && (
                  <div className="flex gap-3">
                    <Button onClick={() => setShowAddTransaction(true)} className="bg-gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                    <Button variant="outline" onClick={handleExportCSV}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bill</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((txn) => (
                      <TableRow key={txn.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm">
                          {new Date(txn.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(txn.type)}>
                            {txn.type === 'inflow' ? '↑ Inflow' : '↓ Outflow'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{txn.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{txn.purpose}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {txn.category || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(txn.status)}>
                            {txn.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {txn.receiptUrl ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getBackendFileUrl(txn.receiptUrl), '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {txn.approvedBy?.username || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {isAdmin && txn.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(txn.id, 'approved')}
                                  className="text-green-500 hover:text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(txn.id, 'rejected')}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setShowNotesDialog(true);
                              }}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setShowReminderDialog(true);
                              }}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Transaction Modal */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'inflow' | 'outflow') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inflow">Inflow (Income)</SelectItem>
                  <SelectItem value="outflow">Outflow (Expense)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Describe the transaction purpose..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Sponsorship, Event, Operational"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFile">Receipt/Bill (Upload File)</Label>
              <Input
                id="receiptFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, receiptFile: file });
                }}
              />
              {formData.receiptFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.receiptFile.name}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddTransaction(false);
                  setFormData({
                    type: 'inflow',
                    amount: '',
                    purpose: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    receiptFile: null,
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary" disabled={uploadingReceipt}>
                {uploadingReceipt ? 'Uploading...' : 'Add Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Transaction: <strong>{selectedTransaction?.purpose}</strong>
            </div>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter your note..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNotesDialog(false);
                setNoteContent('');
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNote} className="bg-gradient-primary">
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Transaction: <strong>{selectedTransaction?.purpose}</strong>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderDate">Follow-up Date</Label>
              <Input
                id="reminderDate"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowReminderDialog(false);
                setReminderDate('');
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSetReminder} className="bg-gradient-primary">
              Set Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
