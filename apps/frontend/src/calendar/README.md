# Enhanced Dental Practice Calendar System

## Overview

A fully-integrated, professional calendar system designed specifically for multi-dental practices. This calendar replaces the rough implementation with a production-ready solution that seamlessly integrates with PocketBase and provides an exceptional user experience for managing appointments.

## Key Features

### ✅ **Full PocketBase Integration**
- Real-time synchronization with the `appointments` collection
- Automatic conflict detection across dentist schedules
- Live updates when other users make changes
- Proper error handling and validation

### ✅ **Multi-Dentist Support**
- Week view with dentist filtering
- Color-coded appointments by treatment type
- Separate lanes for each practitioner
- Quick dentist switching

### ✅ **Rich Appointment Dialog**
- **Patient Search**: Fuzzy search by name, email, or phone
- **Dentist Selection**: Dropdown with all active dentists
- **Treatment Type**: Visual grid with color coding for all dental procedures
- **Duration Presets**: Quick select (15, 30, 45, 60, 90, 120 minutes)
- **Date/Time Picker**: Intuitive datetime controls
- **Status Management**: Track appointment lifecycle (scheduled → confirmed → completed)
- **Room/Chair Assignment**: Support for multi-chair practices
- **Notes**: Additional appointment details
- **Conflict Warnings**: Real-time visual alerts for scheduling conflicts

### ✅ **Interactive Calendar Views**

#### Day View
- Hour-by-hour grid (24 hours)
- Drag-and-drop to reschedule
- Resize appointments from bottom edge
- Click empty slots to create appointments
- Drag to select time ranges
- "Now" indicator for current time
- Hover preview of time slots
- Today highlighting

#### Week View
- 7-day grid layout
- Filter by dentist or view all
- Quick appointment overview
- Click any day to add appointments
- Mobile-responsive design

### ✅ **Smart Features**
- **Conflict Detection**: Warns when appointments overlap for the same dentist
- **Snapping**: 15-minute grid snapping for clean scheduling
- **Auto-scroll**: Calendar follows drag operations
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Loading States**: Professional loading indicators
- **Error Handling**: Graceful error messages

### ✅ **Color Coding**
Appointments are automatically color-coded by treatment type:

| Treatment Type | Color |
|---------------|-------|
| Checkup | 🟢 Green |
| Cleaning | 🔵 Blue |
| Filling | 🟡 Amber |
| Extraction | 🔴 Red |
| Root Canal | 🟣 Purple |
| Crown | 🌸 Pink |
| Consultation | 🔵 Cyan |
| Emergency | ⚠️ Dark Red |
| Other | ⚪ Gray |

### ✅ **Status Indicators**
Appointments display different opacity levels based on status:
- **Scheduled/Confirmed**: Full opacity (vibrant)
- **Completed**: 50% opacity (muted)
- **Cancelled**: 30% opacity (very faded)
- **No Show**: 40% opacity (faded)

## Architecture

### File Structure

```
apps/frontend/src/calendar/
├── lib/
│   ├── appointments-integration.ts  # PocketBase integration layer
│   ├── calStore.ts                  # Global calendar state
│   ├── types.ts                     # TypeScript type definitions
│   ├── timeGrid.ts                  # Time calculation utilities
│   ├── lanes.ts                     # Event collision detection
│   ├── dragPreview.ts               # Drag operation state
│   ├── autoScroll.ts                # Auto-scroll during drag
│   ├── eventUpdates.ts              # Event transformation logic
│   └── pointer.ts                   # Pointer event utilities
├── CalendarNav.tsx                  # Top navigation bar
├── DayView.tsx                      # Single-day calendar view
├── WeekView.tsx                     # 7-day week view
├── AppointmentDialog.tsx            # Appointment create/edit modal
├── EventBlock.tsx                   # Individual appointment block
├── TimeGrid.tsx                     # Time grid component
├── SelectionOverlay.tsx             # Visual selection feedback
├── HoverIndicator.tsx               # Time hover indicator
└── NowIndicator.tsx                 # Current time line
```

### Data Flow

```
PocketBase (appointments) 
    ↓ (loadAppointments)
Calendar Store (state.events)
    ↓ (filters, view mode)
DayView / WeekView
    ↓ (user interactions)
AppointmentDialog
    ↓ (create/update/delete)
PocketBase API
    ↓ (real-time subscriptions)
Calendar Store (updates)
```

## Usage

### Opening the Calendar

Navigate to `/appointments` in your application. The calendar automatically loads appointments for the current view.

### Creating Appointments

**Method 1: Nav Button**
1. Click "New Appointment" in the top navigation
2. Fill in the appointment details
3. Click "Save Appointment"

**Method 2: Click Empty Slot (Day View)**
1. Click on any empty time slot
2. Or click-and-drag to select a time range
3. Appointment dialog opens pre-filled with the selected time

**Method 3: Add Button (Week View)**
1. Click the "+ Add Appointment" button on any day
2. Dialog opens with 9:00 AM - 10:00 AM default

### Editing Appointments

1. Click any appointment block
2. Modify details in the dialog
3. Click "Save Appointment"

**Or drag-and-drop:**
- Drag the appointment to a new time
- Drag the bottom edge to resize duration

### Deleting Appointments

1. Click the appointment to open the dialog
2. Click "Delete" button (bottom-left)
3. Confirm deletion

### Switching Views

- **Day View**: Click the 📋 Day button in the top-right
- **Week View**: Click the 📆 Week button in the top-right

### Filtering (Week View)

Click dentist filter buttons to show only appointments for specific dentists.

## Configuration

### Business Hours

Update `state.dayStartHour` in `calStore.ts` to change the first visible hour:

```typescript
dayStartHour: 8,  // Start at 8:00 AM
```

### Snap Interval

Change the snapping increment in `lib/timeGrid.ts`:

```typescript
export const SNAP_MIN = 15  // 15-minute increments
```

### Week Start Day

Users can change this in the calendar navigation dropdown, or set a default:

```typescript
weekStartsOn: 1,  // 0 = Sunday, 1 = Monday, etc.
```

## Integration with Your Database

The calendar expects these PocketBase collections:

### `appointments`
- `patient` (relation to patients)
- `dentist` (relation to users)
- `start_time` (ISO datetime)
- `duration` (number, in minutes)
- `status` (picklist: scheduled, confirmed, completed, cancelled, no_show)
- `type` (picklist: checkup, cleaning, filling, extraction, root_canal, crown, consultation, emergency, other)
- `room` (text, optional)
- `notes` (text, optional)
- `treatmentPlan` (relation, optional)

### `patients`
- `firstName` (text)
- `lastName` (text)
- `email` (email)
- `phone` (text)

### `users`
- `name` (text)
- `role` (text, should include "dentist")

## Keyboard Shortcuts

### Day View
- **Ctrl + ↑/↓**: Navigate between appointments
- **Enter**: Open appointment dialog
- **Delete/Backspace**: Delete appointment
- **↑/↓**: Nudge start time by 15 minutes
- **←/→**: Adjust duration by 15 minutes

## Real-Time Collaboration

The calendar automatically subscribes to PocketBase real-time updates. When another user:
- Creates an appointment → It appears instantly
- Updates an appointment → Changes reflect immediately  
- Deletes an appointment → It disappears from the view

No refresh needed!

## Mobile Support

The calendar is fully responsive:
- **Desktop**: Full day/week views with all features
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Simplified week view, swipe-friendly navigation

## Performance

- **Lazy Loading**: Only loads appointments for visible date range
- **Efficient Rendering**: Smart diffing prevents unnecessary re-renders
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Collision Detection**: O(n log n) algorithm for lane assignment

## Troubleshooting

### Appointments not loading
- Check PocketBase connection in browser console
- Verify `appointments` collection exists
- Ensure user has read permissions

### Conflicts not detecting
- Verify `status` field excludes cancelled/no_show
- Check that `dentist` field is set correctly

### Real-time not working
- Ensure PocketBase WebSocket connection is active
- Check browser console for subscription errors
- Verify PocketBase version supports real-time (v0.8+)

## Future Enhancements

Potential improvements for future versions:

- [ ] Recurring appointments (weekly, monthly)
- [ ] Drag between dentists in week view
- [ ] Print/export schedule
- [ ] SMS/Email appointment reminders
- [ ] Waitlist management
- [ ] Resource allocation (operatory/equipment)
- [ ] Multi-practice/multi-location support
- [ ] Advanced filtering (by treatment, insurance, etc.)
- [ ] Appointment templates
- [ ] Time block reservations (lunch, meetings)

## Credits

Built with:
- **SolidJS**: Reactive UI framework
- **PocketBase**: Backend and real-time database
- **date-fns**: Date manipulation utilities
- **TanStack Router**: Client-side routing

---

**Version**: 2.0.0  
**Last Updated**: 2025-11-24  
**Maintained by**: Zahrawi Dental Clinic Development Team
