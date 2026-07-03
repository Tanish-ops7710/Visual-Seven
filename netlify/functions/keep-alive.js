export default async (req, context) => {
    console.log("Running keep-alive ping to Supabase...");
    
    // Visual Seven Supabase Configuration
    const SUPABASE_URL = "https://hmkdibaglrnpbbrfscmy.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2RpYmFnbHJucGJicmZzY215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDkzNDksImV4cCI6MjA5Mjg4NTM0OX0.IpNwNPZVNkpl7BaP_CjNkDDoKwZePRU3t70TxkyGVCc";

    try {
        // Query the REST API for a single project ID to register "activity" on the database
        const response = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=id&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Successfully pinged Supabase to prevent auto-pause.");
        return new Response("Ping successful", { status: 200 });

    } catch (error) {
        console.error("Failed to ping Supabase:", error);
        return new Response("Ping failed", { status: 500 });
    }
};

export const config = {
    // Cron schedule: Run every 3 days at midnight
    schedule: "0 0 */3 * *"
};
