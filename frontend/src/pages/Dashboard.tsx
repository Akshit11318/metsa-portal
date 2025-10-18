import { Users, Wallet, Calendar, Handshake } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fundData = [
  { month: 'Jan', inflow: 15000, outflow: 8000 },
  { month: 'Feb', inflow: 22000, outflow: 12000 },
  { month: 'Mar', inflow: 18000, outflow: 15000 },
  { month: 'Apr', inflow: 25000, outflow: 10000 },
  { month: 'May', inflow: 20000, outflow: 14000 },
];

const eventData = [
  { month: 'Jan', events: 3 },
  { month: 'Feb', events: 5 },
  { month: 'Mar', events: 4 },
  { month: 'Apr', events: 7 },
  { month: 'May', events: 6 },
];

const quickActions = [
  { label: 'Add Member', variant: 'default' as const },
  { label: 'Upload Bill', variant: 'outline' as const },
  { label: 'Create Event', variant: 'outline' as const },
];

const recentNotes = [
  { id: 1, core: 'Events', text: 'Follow up with venue for annual fest', color: 'bg-blue-500' },
  { id: 2, core: 'Sponsorship', text: 'Contact potential sponsors by Friday', color: 'bg-purple-500' },
  { id: 3, core: 'FinOps', text: 'Submit expense report for March', color: 'bg-green-500' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your overview</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Members"
            value="156"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            index={0}
          />
          <StatCard
            title="Available Funds"
            value="₹2.4L"
            icon={Wallet}
            trend={{ value: 8, isPositive: true }}
            index={1}
          />
          <StatCard
            title="Upcoming Events"
            value="8"
            icon={Calendar}
            trend={{ value: 3, isPositive: false }}
            index={2}
          />
          <StatCard
            title="Active Sponsors"
            value="12"
            icon={Handshake}
            trend={{ value: 15, isPositive: true }}
            index={3}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {quickActions.map((action, index) => (
                <Button key={index} variant={action.variant} className="shadow-sm">
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Fund Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={fundData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="inflow" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="outflow" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Events per Month</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={eventData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="events" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Notes Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Notes & Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className={`w-1 h-full ${note.color} rounded-full`} />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{note.core}</p>
                    <p className="text-sm text-foreground">{note.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
