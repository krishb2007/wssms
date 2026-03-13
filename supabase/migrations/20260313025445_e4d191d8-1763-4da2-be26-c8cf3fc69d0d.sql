
CREATE OR REPLACE FUNCTION public.record_visitor_exit(p_phonenumber text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visitor visitor_registrations%ROWTYPE;
  v_ist_time timestamp;
BEGIN
  -- Find active visitor with matching phone number
  SELECT * INTO v_visitor
  FROM visitor_registrations
  WHERE phonenumber = p_phonenumber
    AND endtime IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_visitor.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No active visitor found with this phone number');
  END IF;

  -- Calculate IST time
  v_ist_time := (now() AT TIME ZONE 'Asia/Kolkata');

  -- Update end time
  UPDATE visitor_registrations
  SET endtime = v_ist_time
  WHERE id = v_visitor.id;

  RETURN json_build_object(
    'success', true,
    'visitor', json_build_object(
      'id', v_visitor.id,
      'visitorname', v_visitor.visitorname,
      'phonenumber', v_visitor.phonenumber,
      'endtime', v_ist_time
    )
  );
END;
$$;
