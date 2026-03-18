
CREATE OR REPLACE FUNCTION public.record_visitor_exit(p_phonenumber text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_visitor visitor_registrations%ROWTYPE;
  v_ist_time timestamp;
BEGIN
  SELECT * INTO v_visitor
  FROM visitor_registrations
  WHERE phonenumber = p_phonenumber
    AND endtime IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_visitor.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No active visitor found with this phone number');
  END IF;

  v_ist_time := (now() AT TIME ZONE 'Asia/Kolkata');

  UPDATE visitor_registrations
  SET endtime = v_ist_time
  WHERE id = v_visitor.id;

  RETURN json_build_object(
    'success', true,
    'visitor', json_build_object(
      'id', v_visitor.id,
      'visitorname', v_visitor.visitorname,
      'phonenumber', v_visitor.phonenumber,
      'endtime', v_ist_time,
      'picture_url', v_visitor.picture_url,
      'numberofpeople', v_visitor.numberofpeople
    )
  );
END;
$function$;
