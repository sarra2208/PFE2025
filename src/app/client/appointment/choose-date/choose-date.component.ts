import {  AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { NativeDateAdapter } from '@angular/material/core';
import { CommonModule, formatDate } from '@angular/common';
import { schedulesServices } from '../SchedulesServices.model';
import { SimpleChanges, OnChanges } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-choose-date',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDatepickerModule],
  providers: [{ provide: NativeDateAdapter, useClass: NativeDateAdapter }],
  templateUrl: './choose-date.component.html',
  styleUrl: './choose-date.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseDateComponent implements OnInit, OnChanges,AfterViewInit  {
  constructor(private cdRef: ChangeDetectorRef) { }
  @Input() unAvailableDates: schedulesServices[] = [];
  @Input() shiftSchedule: string = "";
  @Output() selectedDate = new EventEmitter<Date | null>();
  @Output() getServiceSchedules = new EventEmitter<string>();
  @Output() getTime = new EventEmitter< {  start: string, end: string }  >();
  private readonly listOfDays=["sun", "mon", "tue" ,"wed" ,"thu", "fri", "sat"]
  timeSlots:Array<[string,string]>=[];
  selectedTimeSlot: string | null = null;
  btnIndex!: number ;
  selected: Date | null = null;
  minDate!: Date;
  maxDate: Date = new Date(2027, 0, 1); 
  firstDay:string="";
  lastDay:string="";
  dateFilter : (d: Date | null) => boolean = () => true;
  time: {start:string, end:string} = {start:'', end:''};
  activeDate: Date = new Date();
  ngOnChanges(changes: SimpleChanges) {
    if (changes['unAvailableDates'] ) {
      this.setTime();
    }
    if(changes['shiftSchedule'] ) {
      this.setTime();
    }
    if (changes['shiftSchedule'] && changes['shiftSchedule'].currentValue) {
      console.log('ShiftSchedule changé:', changes['shiftSchedule'].currentValue);
      this.setTime();
    }
  }
ngOnInit() {
  this.minDate = new Date() 
}
ngAfterViewInit() {
    this.setTime()
}
setTime(){
  this.shiftSchedule.split(',').forEach((element) => {
    const [day, time] = element.split(' ');
    
    [this.firstDay, this.lastDay] = day.split('-');
    const [startShift,endShift]=time.split('-');
   
    this.dateFilter = (d: Date | null): boolean => {
      const day = (d || new Date()).getDay();
      const d1 = this.listOfDays.indexOf(this.firstDay);
      const d2 = this.listOfDays.indexOf(this.lastDay);
      console.log(
        "day",day,
        "start",d1,
        "end",d2
      )
      if (d1 <= d2) {
        return day >= d1 && day <= d2;
      } else {
        return day >= d1 || day <= d2;
      }
    };

    this.timeSlots = this.generateTimeSlots( startShift , endShift , "00:30");

  })
}
 

  get formattedDate(): string {
    if (!this.selected) return '';
    return formatDate(this.selected, 'yyyy-MM-dd', 'en-US');
  }


 
  
  onTimeSlotSelected(start: string, end: string , btnIndex: number) {
    if (!this.selected) return;
    this.btnIndex = btnIndex;
    this.selectedTimeSlot = start;
    this.getTime.emit({start, end});
    
    
  
    const [hours, minutes] = start.split(':').map(Number);
    const newDate = new Date(this.selected);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    

    this.selected = newDate;
    this.time = {start, end}; 
    
    this.selectedDate.emit(this.selected);
    this.cdRef.markForCheck();
    
  }
  get date(){
    return this.selected;
  }
  
  onDateChange() {
      if (this.selected) {
      
      this.getServiceSchedules.emit( this.formattedDate );
      console.log('Requested service schedules');
    } else {
      console.warn('Date is missing');
    }
  }
  formatTimeSlot(timeString: string): string {
    const time = new Date(timeString);
    return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  isUnAvailableTimeSlot(startTime: string, endTime: string): boolean {
    
    if(!this.selected || this.unAvailableDates.length === 0)  {
      return false;
    }
  
   
    const unAvailablStartTime: Array<[string, string]> = this.unAvailableDates.map(element => [
      this.formatTimeSlot(element[0]),
      this.formatTimeSlot(element[1]),
    ]);
  
    for (const [startUnAvl, endUnAvl] of unAvailablStartTime) {
      
    
     if (parseInt(startTime) >= parseInt(startUnAvl) && parseInt(endTime) <= parseInt(endUnAvl)) {
        
        return true;
      }
    }
  
    return false;
  }
  
   generateTimeSlots(startTime: string, endTime: string, step: string): [string, string][] {
    const slots: [string, string][] = [];
  
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const [stepHour, stepMin] = step.split(':').map(Number);
  
    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);
  
    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);
  
    const stepMs = (stepHour * 60 + stepMin) * 60 * 1000;
  
    while (current.getTime() + stepMs <= end.getTime()) {
      const next = new Date(current.getTime() + stepMs);
  
      const format = (d: Date) =>
        d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  
      slots.push([format(current), format(next)]);
  
      current = next;
    }
  
    return slots;
  }
 


  highlightWeekends = (d: Date): string => {
    const day = d.getDay();

    const isWeekend = day === 0 || day === 6;
    const isCurrentMonth = 
    d.getMonth() === this.activeDate.getMonth() &&
    d.getFullYear() === this.activeDate.getFullYear();

  return isWeekend && isCurrentMonth ? 'weekend-date' : '';
  };

  
  isSelectedSlot(start: string): boolean {
    return this.time.start === start;
  }
  
}
