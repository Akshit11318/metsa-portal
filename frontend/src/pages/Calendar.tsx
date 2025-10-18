import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Trash2, Edit, Calendar as CalendarIcon, List } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';

interface Event {
    id: number;
    name: string;
    description?: string;
    date: string;
    venue?: string;
    core?: string;
    status?: string;
    budget?: number;
}

interface EventFormData {
    name: string;
    description: string;
    date: string;
    venue: string;
    core: string;
    budget: string;
}

export default function Calendar() {
    const { user } = useAuthStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    const [formData, setFormData] = useState<EventFormData>({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        venue: '',
        core: 'tech',
        budget: '',
    });

    const isAdmin = user?.role === 'admin';
    const canManage = isAdmin || user?.role === 'core';

    // Check if user can edit/delete a specific event
    const canManageEvent = (event: Event) => {
        if (isAdmin) return true; // Admin can manage any event
        if (user?.role === 'core' && user?.core === event.core) return true; // Core user can manage their core's events
        return false;
    };

    // Fetch events
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await apiGet(getApiUrl(API_ENDPOINTS.EVENTS));
            if (response.success) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Generate 6 months of calendar
    const generateSixMonths = () => {
        const months = [];
        const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        for (let i = 0; i < 6; i++) {
            const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
            months.push(month);
        }

        return months;
    };

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date | null) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => event.date.startsWith(dateStr));
    };

    // Check if date is today
    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Handle navigation
    const goToPreviousMonths = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1));
    };

    const goToNextMonths = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Handle add/edit event
    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.core || !formData.date) {
            toast.error('Please fill in required fields (Name, Core, Date)');
            return;
        }

        try {
            const eventData: any = {
                name: formData.name,
                description: formData.description,
                core: formData.core,
                date: new Date(formData.date).toISOString(),
            };

            if (formData.venue) eventData.venue = formData.venue;
            if (formData.budget) eventData.budget = parseFloat(formData.budget);

            if (editingEvent) {
                const response = await apiPatch(`${getApiUrl(API_ENDPOINTS.EVENTS)}/${editingEvent.id}`, eventData);
                if (response.success) {
                    toast.success('Event updated successfully');
                }
            } else {
                const response = await apiPost(getApiUrl(API_ENDPOINTS.EVENTS), eventData);
                if (response.success) {
                    toast.success('Event created successfully');
                }
            }

            fetchEvents();
            setShowAddEvent(false);
            setEditingEvent(null);
            setFormData({
                name: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                venue: '',
                core: 'tech',
                budget: '',
            });
        } catch (error) {
            console.error('Failed to save event:', error);
            toast.error('Failed to save event');
        }
    };

    // Handle delete event
    const handleDeleteEvent = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const response = await apiDelete(`${getApiUrl(API_ENDPOINTS.EVENTS)}/${id}`);
            if (response.success) {
                toast.success('Event deleted successfully');
                fetchEvents();
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
            toast.error('Failed to delete event');
        }
    };

    // Handle edit event
    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        const eventDate = new Date(event.date);
        setFormData({
            name: event.name,
            description: event.description || '',
            date: eventDate.toISOString().split('T')[0],
            venue: event.venue || '',
            core: event.core || 'tech',
            budget: event.budget?.toString() || '',
        });
        setShowAddEvent(true);
    };

    // Get event color by core
    const getEventColor = (core?: string) => {
        switch (core) {
            case 'tech':
                return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
            case 'design':
                return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
            case 'content':
                return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
            case 'management':
                return 'bg-green-500/20 text-green-600 border-green-500/30';
            case 'outreach':
                return 'bg-pink-500/20 text-pink-600 border-pink-500/30';
            default:
                return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
        }
    };

    const months = generateSixMonths();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
                        <p className="text-sm text-muted-foreground">6-month event calendar view</p>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 space-y-6">
                {/* Calendar Controls */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {viewMode === 'calendar' && (
                                <>
                                    <Button variant="outline" size="icon" onClick={goToPreviousMonths}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" onClick={goToToday}>
                                        Today
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={goToNextMonths}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <span className="text-lg font-semibold ml-2">
                                        {months[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} -{' '}
                                        {months[5].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                </>
                            )}
                            {viewMode === 'list' && (
                                <span className="text-lg font-semibold">All Events</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
                                    className={viewMode === 'calendar' ? 'bg-gradient-primary' : ''}
                                >
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    Calendar
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={viewMode === 'list' ? 'bg-gradient-primary' : ''}
                                >
                                    <List className="h-4 w-4 mr-1" />
                                    List
                                </Button>
                            </div>
                            {canManage && (
                                <Button onClick={() => setShowAddEvent(true)} className="bg-gradient-primary">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Event
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {months.map((month, monthIndex) => {
                            const days = getDaysInMonth(month);

                            return (
                                <Card key={monthIndex} className="p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-center">
                                        {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>

                                    {/* Week day headers */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {weekDays.map((day) => (
                                            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar days */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {days.map((day, dayIndex) => {
                                            const dayEvents = getEventsForDate(day);
                                            const isTodayDate = isToday(day);

                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`min-h-[60px] p-1 rounded-md border transition-colors ${day
                                                        ? isTodayDate
                                                            ? 'bg-primary/10 border-primary cursor-pointer hover:bg-primary/20'
                                                            : 'border-border cursor-pointer hover:bg-muted/50'
                                                        : 'border-transparent'
                                                        }`}
                                                    onClick={() => day && setSelectedDate(day.toISOString().split('T')[0])}
                                                >
                                                    {day && (
                                                        <>
                                                            <div className={`text-sm font-medium text-center mb-1 ${isTodayDate ? 'text-primary font-bold' : 'text-foreground'
                                                                }`}>
                                                                {day.getDate()}
                                                            </div>
                                                            {dayEvents.length > 0 && (
                                                                <div className="space-y-0.5">
                                                                    {dayEvents.slice(0, 2).map((event) => (
                                                                        <div
                                                                            key={event.id}
                                                                            className={`text-[10px] px-1 py-0.5 rounded truncate border ${getEventColor(event.core)}`}
                                                                            title={event.name}
                                                                        >
                                                                            {event.name}
                                                                        </div>
                                                                    ))}
                                                                    {dayEvents.length > 2 && (
                                                                        <div className="text-[9px] text-muted-foreground text-center">
                                                                            +{dayEvents.length - 2} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <Card className="p-6">
                        <div className="space-y-4">
                            {events.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No events found</p>
                            ) : (
                                events
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map((event) => {
                                        const eventDate = new Date(event.date);
                                        const isPast = eventDate < new Date();
                                        const isTodayEvent = isToday(eventDate);

                                        return (
                                            <div
                                                key={event.id}
                                                className={`p-4 rounded-lg border transition-colors ${isTodayEvent
                                                        ? 'border-primary bg-primary/5'
                                                        : isPast
                                                            ? 'border-border bg-muted/30 opacity-60'
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="text-lg font-semibold">{event.name}</h4>
                                                            <Badge variant="outline" className={getEventColor(event.core)}>
                                                                {event.core}
                                                            </Badge>
                                                            {isTodayEvent && (
                                                                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                                                                    Today
                                                                </Badge>
                                                            )}
                                                            {isPast && (
                                                                <Badge variant="outline" className="bg-gray-500/20 text-gray-600 border-gray-500/30">
                                                                    Past
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4" />
                                                                {eventDate.toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </span>
                                                            {event.venue && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-4 w-4" />
                                                                    {event.venue}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {event.description && (
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                        {event.budget && (
                                                            <p className="text-sm font-medium text-foreground">
                                                                Budget: ₹{event.budget.toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {canManageEvent(event) && (
                                                        <div className="flex gap-2 ml-4">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditEvent(event)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteEvent(event.id)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </Card>
                )}

                {/* Today's Events Highlight */}
                {events.filter(event => isToday(new Date(event.date))).length > 0 && (
                    <Card className="p-6 border-primary/50 bg-primary/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="h-3 w-1 bg-primary rounded-full" />
                            Today's Events
                        </h3>
                        <div className="space-y-3">
                            {events
                                .filter(event => isToday(new Date(event.date)))
                                .map(event => (
                                    <div key={event.id} className="flex items-start justify-between p-3 bg-background rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{event.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Core: <span className="font-medium">{event.core}</span>
                                            </p>
                                            {event.venue && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.venue}
                                                </p>
                                            )}
                                        </div>
                                        {canManageEvent(event) && (
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </Card>
                )}
            </main>

            {/* Add/Edit Event Dialog */}
            <Dialog open={showAddEvent} onOpenChange={(open) => {
                setShowAddEvent(open);
                if (!open) {
                    setEditingEvent(null);
                    setFormData({
                        name: '',
                        description: '',
                        date: new Date().toISOString().split('T')[0],
                        venue: '',
                        core: 'tech',
                        budget: '',
                    });
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEvent} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Event Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Event name"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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

                            <div className="space-y-2">
                                <Label htmlFor="core">
                                    Core <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="core"
                                    value={formData.core}
                                    onChange={(e) => setFormData({ ...formData, core: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                    required
                                >
                                    <option value="tech">Tech</option>
                                    <option value="design">Design</option>
                                    <option value="content">Content</option>
                                    <option value="management">Management</option>
                                    <option value="outreach">Outreach</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="venue">Venue</Label>
                            <Input
                                id="venue"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                placeholder="Event venue"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget (₹)</Label>
                            <Input
                                id="budget"
                                type="number"
                                step="0.01"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Event description..."
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddEvent(false);
                                    setEditingEvent(null);
                                    setFormData({
                                        name: '',
                                        description: '',
                                        date: new Date().toISOString().split('T')[0],
                                        venue: '',
                                        core: 'tech',
                                        budget: '',
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-primary">
                                {editingEvent ? 'Update Event' : 'Add Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Selected Date Events Dialog */}
            {selectedDate && (
                <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                Events on {new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            {getEventsForDate(new Date(selectedDate)).length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No events on this date</p>
                            ) : (
                                getEventsForDate(new Date(selectedDate)).map(event => (
                                    <div key={event.id} className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium">{event.name}</h4>
                                            <Badge variant="outline" className={getEventColor(event.core)}>
                                                {event.core}
                                            </Badge>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                        )}
                                        {event.venue && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {event.venue}
                                            </p>
                                        )}
                                        {event.budget && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Budget: ₹{event.budget.toLocaleString()}
                                            </p>
                                        )}
                                        {canManageEvent(event) && (
                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedDate(null);
                                                        handleEditEvent(event);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        handleDeleteEvent(event.id);
                                                        setSelectedDate(null);
                                                    }}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
