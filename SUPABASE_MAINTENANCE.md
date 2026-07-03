# Keeping Supabase Active (Free Tier)

Since you are using the Supabase Free Tier, the project will automatically pause after **7 days of inactivity**. To prevent this from happening, you can configure a free external ping scheduler.

## Best Solution: Cron-Job.org (100% Free & Simple)

[cron-job.org](https://cron-job.org/) is a free service that will automatically fetch a URL on a schedule, resetting the 7-day inactivity timer on Supabase.

### Step-by-Step Setup:

1. Go to [cron-job.org](https://cron-job.org/) and log in/create a free account.
2. Go to the **Cronjobs** tab and click **Create Cronjob**.
3. Fill in the following details:
   - **Title**: `Visual Seven Supabase Ping`
   - **Address**: `https://hmkdibaglrnpbbrfscmy.supabase.co/rest/v1/projects?select=id&limit=1&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2RpYmFnbHJucGJicmZzY215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDkzNDksImV4cCI6MjA5Mjg4NTM0OX0.IpNwNPZVNkpl7BaP_CjNkDDoKwZePRU3t70TxkyGVCc`
   - **Schedule**: Set to **Every day** (or Every 12 hours).
4. Click **Create** at the bottom.

*That's it! By embedding the API key in the URL, you do not need to configure any advanced header settings.*

---

### Alternative: UptimeRobot (Free)

If you prefer to monitor your deployed web app endpoint directly:
1. Create a free account on [UptimeRobot](https://uptimerobot.com/).
2. Add a new monitor:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Visual Seven Keep Alive`
   - **URL/IP**: `https://your-deployed-netlify-site.netlify.app/.netlify/functions/keep-alive` *(Replace with your actual deployed Netlify URL)*
   - **Monitoring Interval**: Every 5 minutes (or up to 24 hours).
3. Save the monitor.
