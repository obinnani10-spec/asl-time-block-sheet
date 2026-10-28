# ASL Time Block Sheet

Static page. No build step. Open index.html to preview.

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. At vercel.com choose Add New > Project, import the repo, leave every setting on its default, and click Deploy.
3. Add a custom domain under Settings > Domains (for example book.yourdomain.com).
4. Replace YOUR-SITE-URL in the og:image line of index.html with your live address so link previews show your photo.

## GitHub Pages (not recommended)
Pages can show the sheet but cannot run `api/book.js`, so automatic email delivery would not work. Use Vercel.

## Make "Send to Obi" email you (required for automatic delivery)
The button posts to `/api/book`, a Vercel serverless function in `api/book.js`. It emails you each request with the blocks in Eastern time plus the client's own local time.
Use your existing Resend account. In Vercel, open the project > Settings > Environment Variables and add:
- `RESEND_API_KEY` = your Resend API key
- `TO_EMAIL` = the inbox that should receive requests
- `FROM_EMAIL` (optional) = a sender on your verified Resend domain, like `ASL Booking <book@yourdomain.com>`. Without it, mail comes from onboarding@resend.dev, which Resend only delivers to the email your Resend account was created with.
Never put these values in the repo or in chat. Redeploy after adding them, then send one test request from the live page.
If sending ever fails, the client sees a retry message and can still use Copy my times.

This function needs Vercel. GitHub Pages cannot run it.

## Keep hours in sync
The available hours and days are defined in two places: `HOURS` in `index.html` and `HOURS_MIN`, `HOURS_MAX` and the Sunday rule in `api/book.js`. Change both together.

## Mark a time as taken
Add the block to the "booked" list in `availability.json` as "date|24 hour start" in Eastern time, for example "2026-10-29|19" for Oct 29 at 7 PM.
Commit and push, and the block shows as striped (taken) on the live page within a minute.
