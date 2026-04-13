import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, CheckCircle, XCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface ChefAvailability {
  id: number;
  chefId: number;
  date: string;
  isAvailable: boolean;
  isBooked: boolean;
  notes?: string;
}

interface AvailabilityCalendarProps {
  chefId: number;
}

export function AvailabilityCalendar({ chefId }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  
  const queryClient = useQueryClient();

  // Fetch availability for current month
  const { data: availability = [] } = useQuery({
    queryKey: ['/api/chef-availability', chefId, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`/api/chef-availability/${chefId}?start=${start}&end=${end}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    }
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: { date: string; isAvailable: boolean; notes?: string }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/chef-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          chefId,
          date: data.date,
          isAvailable: data.isAvailable,
          notes: data.notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to update availability');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chef-availability', chefId] });
      setIsDialogOpen(false);
      setNotes("");
      setSelectedDate(undefined);
    },
  });

  const getAvailabilityForDate = (date: Date) => {
    return availability.find((avail: ChefAvailability) => 
      isSameDay(new Date(avail.date), date)
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    const existing = getAvailabilityForDate(date);
    if (existing) {
      setIsAvailable(existing.isAvailable);
      setNotes(existing.notes || "");
    } else {
      setIsAvailable(true);
      setNotes("");
    }
    setIsDialogOpen(true);
  };

  const handleSaveAvailability = () => {
    if (!selectedDate) return;
    
    updateAvailabilityMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      isAvailable,
      notes: notes.trim() || undefined,
    });
  };

  // Create array of days in current month with their availability status
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const modifiers = {
    available: daysInMonth.filter(date => {
      const avail = getAvailabilityForDate(date);
      return avail?.isAvailable && !avail?.isBooked;
    }),
    booked: daysInMonth.filter(date => {
      const avail = getAvailabilityForDate(date);
      return avail?.isBooked;
    }),
    unavailable: daysInMonth.filter(date => {
      const avail = getAvailabilityForDate(date);
      return avail && !avail.isAvailable;
    }),
  };

  const modifiersStyles = {
    available: { backgroundColor: '#dcfce7', color: '#166534' },
    booked: { backgroundColor: '#fef3c7', color: '#92400e' },
    unavailable: { backgroundColor: '#fee2e2', color: '#dc2626' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Availability Calendar
        </CardTitle>
        <CardDescription>
          Manage your availability for bookings. Click on any date to set availability or mark as booked.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
        </div>

        {/* Availability Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Set Availability for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="availability-switch">Available for bookings</Label>
                <Switch
                  id="availability-switch"
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this date..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAvailability}
                  disabled={updateAvailabilityMutation.isPending}
                >
                  {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              // Set entire month as available
              const days = eachDayOfInterval({
                start: startOfMonth(currentMonth),
                end: endOfMonth(currentMonth),
              });
              days.forEach(date => {
                if (date >= new Date()) { // Only future dates
                  updateAvailabilityMutation.mutate({
                    date: format(date, 'yyyy-MM-dd'),
                    isAvailable: true,
                  });
                }
              });
            }}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Month Available
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              // Set entire month as unavailable
              const days = eachDayOfInterval({
                start: startOfMonth(currentMonth),
                end: endOfMonth(currentMonth),
              });
              days.forEach(date => {
                if (date >= new Date()) { // Only future dates
                  updateAvailabilityMutation.mutate({
                    date: format(date, 'yyyy-MM-dd'),
                    isAvailable: false,
                  });
                }
              });
            }}>
              <XCircle className="w-4 h-4 mr-1" />
              Mark Month Unavailable
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}