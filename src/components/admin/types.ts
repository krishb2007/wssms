
export interface StaffMeetingTime {
  email: string;
  startTime: string;
  endTime: string | null;
}

export interface VisitorRegistration {
  id: string;
  visitorname: string;
  phonenumber: string;
  numberofpeople: number;
  people: string;
  purpose: string;
  address: string;
  schoolname: string;
  starttime: string | null;
  endtime: string | null;
  created_at: string;
  picture_url: string | null;
  signature_url: string | null;
  email: string | null;
  id_type: string | null;
  id_number: string | null;
  meeting_staff_start_time: string | null;
  meeting_staff_end_time: string | null;
  entry_location: string | null;
  meeting_staff_times: string | null;
}
