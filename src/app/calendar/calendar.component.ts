import { Component, ViewChild, OnInit } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/core';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Appointment } from './calendar.model';
import { FormDialogComponent } from './dialogs/form-dialog/form-dialog.component';
import { CalendarService } from './calendar.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { Direction } from '@angular/cdk/bidi';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
//import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { SharedModule } from '@shared';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MatButtonModule,
    MatCheckboxModule,
    FullCalendarModule,
   // OwlDateTimeModule,
    //OwlNativeDateTimeModule,
    SharedModule,
  ],
})
export class CalendarComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  @ViewChild('calendar', { static: false })
  calendar: Appointment | null;
  public addCusForm: UntypedFormGroup;
  dialogTitle: string;
  filterOptions = 'All';
  appointmentData!: Appointment;
  filterItems: string[] = ['Consultation', 'Follow-up', 'Emergency', 'Others'];

  public filters: Array<{ name: string; value: string; checked: boolean }> = [
    { name: 'Consultation', value: 'Consultation', checked: true },
    { name: 'Follow-up', value: 'Follow-up', checked: true },
    { name: 'Emergency', value: 'Emergency', checked: true },
    { name: 'Others', value: 'Others', checked: true },
  ];

  calendarEvents?: EventInput[];
  tempEvents?: EventInput[];

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    public calendarService: CalendarService,
    private snackBar: MatSnackBar
  ) {
    super();
    this.dialogTitle = 'Add New Appointment';
    const blankObject = {} as Appointment;
    this.calendar = new Appointment(blankObject);
    this.addCusForm = this.createAppointmentForm(this.calendar);
  }

  public ngOnInit(): void {
    this.calendarService.getAllCalendars().pipe(
      map((appointments: Appointment[]) => {
        return appointments.map(appointment => ({
          id: appointment.id,
          title: appointment.description,
          start: appointment.startDate,
          end: appointment.endDate,
          className: this.getClassNameValue(appointment.type),
          groupId: appointment.type,
          extendedProps: {
            description: appointment.description,
            status: appointment.status,
            patientId: appointment.patientId,
            serviceStaffId: appointment.serviceStaffId,
          },
        }));
      })
    ).subscribe({
      next: (events) => {
        this.calendarEvents = events;
        this.tempEvents = this.calendarEvents;
        this.calendarOptions.events = this.calendarEvents;
      },
      error: (err) => console.error('Failed to load appointments:', err),
    });
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
  };


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDateSelect(selectInfo: DateSelectArg) {
    this.addNewAppointment();
  }

  addNewAppointment() {
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        appointment: this.calendar,
        action: 'add',
      },
      direction: tempDirection,
    });

    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 'submit') {
        this.appointmentData = this.calendarService.getDialogData();
        this.calendarEvents = this.calendarEvents?.concat({
          id: this.appointmentData.id,
          title: this.appointmentData.description,
          start: this.appointmentData.startDate,
          end: this.appointmentData.endDate,
          className: this.getClassNameValue(this.appointmentData.type),
          groupId: this.appointmentData.type,
          extendedProps: {
            description: this.appointmentData.description,
            status: this.appointmentData.status,
            patientId: this.appointmentData.patientId,
            serviceStaffId: this.appointmentData.serviceStaffId,
          },
        });
        this.calendarOptions.events = this.calendarEvents;
        this.addCusForm.reset();
        this.showNotification(
          'snackbar-success',
          'Appointment Added Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }

  changeCategory(event: MatCheckboxChange, filter: { name: string }) {
    if (event.checked) {
      this.filterItems.push(filter.name);
    } else {
      this.filterItems.splice(this.filterItems.indexOf(filter.name), 1);
    }
    this.filterEvent(this.filterItems);
  }

  filterEvent(element: string[]) {
    const list = this.calendarEvents?.filter((x) =>
      element.map((y?: string) => y).includes(x.groupId)
    );
    this.calendarOptions.events = list;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.eventClick(clickInfo);
  }

  eventClick(row: EventClickArg) {
    const appointmentData = {
      id: row.event.id,
      description: row.event.extendedProps['description'],
      type: row.event.groupId,
      status: row.event.extendedProps['status'],
      patientId: row.event.extendedProps['patientId'],
      serviceStaffId: row.event.extendedProps['serviceStaffId'],
      startDate: row.event.start?.toISOString(),
      endDate: row.event.end?.toISOString(),
      date: row.event.start?.toISOString().split('T')[0],
    };
    let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        appointment: appointmentData,
        action: 'edit',
      },
      direction: tempDirection,
    });

    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 'submit') {
        this.appointmentData = this.calendarService.getDialogData();
        this.calendarEvents?.forEach((element, index) => {
          if (this.appointmentData.id === element.id) {
            this.editEvent(index, this.appointmentData);
          }
        });
        this.showNotification(
          'black',
          'Appointment Updated Successfully...!!!',
          'bottom',
          'center'
        );
        this.addCusForm.reset();
      } else if (result === 'delete') {
        this.appointmentData = this.calendarService.getDialogData();
        this.calendarEvents?.forEach((element) => {
          if (this.appointmentData.id === element.id) {
            row.event.remove();
          }
        });
        this.showNotification(
          'snackbar-danger',
          'Appointment Deleted Successfully...!!!',
          'bottom',
          'center'
        );
      }
    });
  }

  editEvent(eventIndex: number, appointmentData: Appointment) {
    const calendarEvents = this.calendarEvents!.slice();
    const singleEvent = Object.assign({}, calendarEvents[eventIndex]);
    singleEvent.id = appointmentData.id;
    singleEvent.title = appointmentData.description;
    singleEvent.start = appointmentData.startDate;
    singleEvent.end = appointmentData.endDate;
    singleEvent.className = this.getClassNameValue(appointmentData.type);
    singleEvent.groupId = appointmentData.type;
    singleEvent.extendedProps = {
      description: appointmentData.description,
      status: appointmentData.status,
      patientId: appointmentData.patientId,
      serviceStaffId: appointmentData.serviceStaffId,
    };
    calendarEvents[eventIndex] = singleEvent;
    this.calendarEvents = calendarEvents;
    this.calendarOptions.events = calendarEvents;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleEvents(events: EventApi[]) {
    
  }

  createAppointmentForm(appointment: Appointment): UntypedFormGroup {
    return this.fb.group({
      id: [appointment.id],
      description: [
        appointment.description,
        [Validators.required, Validators.pattern('[a-zA-Z]+([a-zA-Z ]+)*')],
      ],
      type: [appointment.type, [Validators.required]],
      status: [appointment.status, [Validators.required]],
      patientId: [appointment.patientId, [Validators.required]],
      serviceStaffId: [appointment.serviceStaffId, [Validators.required]],
      startDate: [appointment.startDate, [Validators.required]],
      endDate: [appointment.endDate, [Validators.required]],
    });
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  getClassNameValue(type: string) {
    let className;
    if (type === 'Consultation') className = 'fc-event-success';
    else if (type === 'Follow-up') className = 'fc-event-warning';
    else if (type === 'Emergency') className = 'fc-event-danger';
    else className = 'fc-event-info';
    return className;
  }
}