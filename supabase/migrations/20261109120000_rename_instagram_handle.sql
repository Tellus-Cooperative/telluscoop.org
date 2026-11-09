-- Tellus Instagram handle changed from telluscoop to telluscooperative.
update public.social_accounts
set handle = 'telluscooperative',
    url = 'https://www.instagram.com/telluscooperative'
where platform = 'instagram'
  and handle = 'telluscoop'
  and category = 'tellus-own';
