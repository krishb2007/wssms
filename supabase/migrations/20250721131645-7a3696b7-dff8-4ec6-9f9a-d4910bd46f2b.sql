-- Enable real-time updates for visitor_registrations table
ALTER TABLE visitor_registrations REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE visitor_registrations;