# ASL Time Block Sheet: Claude Code Playbook

Run these prompts in order from the project folder. Each prompt is self-contained and ends with a "done when" line, so Claude Code knows when to stop and report. Paste one phase at a time, read the result, then move on.

## Project facts (Claude Code should read this first)

- What it is: a static, single page booking sheet for ASL (Always Show Love) Creative Consultancy, owned by Obi (Obinna Nnani), Brooklyn, New York.
- Purpose: a client taps the hourly blocks that work for them, Monday to Saturday, 9 AM to 9 PM Eastern (last block starts at 8 PM), and sends the picks to Obi for a free release strategy call. The goal is turning a friendly conversation into a paying ASL client.
- Files: `index.html` (all CSS and JS inline), `api/book.js` (serverless email function), `package.json`, `assets/` (logo.png, performance.jpg, brand-shoot.jpg, shutter.jpg, og.jpg), `README.md`.
- Current behavior: the page builds a message from the selected blocks and a "Send to Obi" button posts name, contact, note, blocks and the client's time zone to `/api/book` (`api/book.js`), which emails Obi through Resend with every block in Eastern time plus the client's local time. Copy my times stays as a fallback. The function needs RESEND_API_KEY and TO_EMAIL set in the host dashboard.
- Stack: plain HTML, CSS and JavaScript. No framework and no build step. Keep it that way unless a phase says otherwise.

## What Obi has already set up (do not redo or re-ask)

- Obi already has a Resend account and API keys for his own email. Do not walk him through creating an account or a key. Do not suggest Formspree or another email service unless he asks.
- He will add the keys to the host himself. The variables are `RESEND_API_KEY` and `TO_EMAIL`, plus `FROM_EMAIL` only if his Resend account has a verified domain. Ask him which inbox `TO_EMAIL` should be and whether he has a verified sender domain. Do not guess either one.
- The site must run on Vercel, because `api/book.js` is a Vercel serverless function and GitHub Pages cannot run it. GitHub is for the code repo only.
- Hours and days live in two places that must always match: the `HOURS` list in `index.html` and `HOURS_MIN`, `HOURS_MAX` and the Sunday rule in `api/book.js`. Currently 9 AM to 9 PM Eastern, Monday to Saturday, so the last block starts at 8 PM (hour 20). Change both files together or not at all.

## Guardrails for every phase

1. Never use em dashes anywhere: copy, code comments, commit messages, README.
2. Do not change the visual design unless a phase asks. The look comes from Obi's three photos: stage blue `#04163A` and `#0A3F86`, shutter yellow `#EDB92E`, coat red `#E35763`, logo pink `#D83060`, pale yellow `#EFED96`, ink `#061B3F`. Fonts are Unbounded (display), Figtree (body), DM Mono (times).
3. Use the original logo and photos in `assets/` as they are. Do not redraw, recolor or replace them.
4. Tone of all client facing copy: warm, confident, first person from Obi, short sentences.
5. Never commit secrets. API keys and tokens go in environment variables, never in the repo. Never ask Obi to paste a key into chat, and never print one in logs, commands or output. If you see a key anywhere, stop and tell him.
6. Do not take a destructive or public action (force push, deleting a repo, changing DNS, buying anything, upgrading a paid plan) without asking Obi first.
7. After each phase, report what changed in two or three sentences and what Obi needs to do next, if anything.
8. The GitHub repo is public. Keep personal details out of it: no email addresses, phone numbers or home address in code, comments, commits or README. The receiving inbox lives only in the `TO_EMAIL` environment variable.
9. Test the real send path only with Obi's go ahead, and send at most one live test email per request. Never loop or script repeated sends, and never test against the live endpoint with fake data that could land in his inbox as clutter.
10. Keep `api/book.js` validation and the page in sync. If you change fields, hours, days or limits in one, change the other, then rerun the checks in Phase 6.
11. Do not add trackers, analytics scripts or third party widgets without asking. The page should stay fast and private for Obi's clients.

---

## Phase 1: Audit and local preview

```
Read PLAYBOOK.md, README.md and index.html. Then serve the folder locally (python3 -m http.server 8080 is fine) and open it in a browser.

Check and report on:
- The page renders at 390px, 768px and 1280px wide with no horizontal scroll.
- Every image in assets/ loads and no console errors appear.
- Tapping blocks selects them, the message updates, Copy my times works, Clear all works, and Previous and Next week work.
- The grid shows 9 AM through 8 PM start hours only (blocks end by 9 PM), Monday to Saturday.
- The Send to Obi button is disabled until a block is picked, asks for a name and a contact before sending, and shows a clear error when /api/book is not reachable. Do not send a real request in this phase.
- Hours that are already past today are disabled.
- Keyboard: every control is reachable by Tab and has a visible focus ring.

Fix only real bugs. Do not restyle anything.

Done when: you give me a short pass or fail list and any fixes you made.
```

## Phase 2: Git and GitHub

```
Initialize a git repo in this folder if there is none. Add a .gitignore for .DS_Store, node_modules, .vercel and .env*. Make the first commit with the message "Add ASL Time Block Sheet".

Then check whether the GitHub CLI is installed and logged in (gh auth status). If it is not, stop and tell me the exact command to run. If it is, create a public repo named asl-time-block-sheet under my account, push main, and give me the repo URL.

Done when: the repo is on GitHub, the working tree is clean, and you have shown me the URL.
```

## Phase 3: Deploy

Deploy on Vercel. It is required for automatic email delivery, and it gives instant deploys on every push and an easy custom domain. Mention once that Vercel's free Hobby plan is for personal, non-commercial use, so ASL as a business may need their paid plan, and let Obi decide. Do not upgrade anything without approval. GitHub Pages is not an option for this project because it cannot run `api/book.js`.

```
Deploy this site to the host I chose.

Use the Vercel CLI (npx vercel) or the GitHub import flow. Framework preset is "Other", no build command, output directory is the repo root. Vercel will pick up the api folder as a serverless function automatically. Link the project to the GitHub repo so every push to main redeploys.

Do not set any environment variables yet. Obi will add them in Phase 6.

Then open the live URL and repeat the Phase 1 checks against it. Sending is expected to fail with the retry message until Phase 6 is done. Confirm that POST /api/book returns a JSON response (not a 404), which proves the function deployed.

Done when: I have a live HTTPS URL, the page works as it did locally, and /api/book exists on the live site.
```

## Phase 4: Link preview and polish

```
Take my live URL and replace YOUR-SITE-URL in the og:image meta tag of index.html with it (the image is assets/og.jpg). Add matching og:url and twitter:image tags. Commit and push.

Then verify the preview: fetch the live page and confirm og:image resolves to an absolute https URL that returns an image. Tell me how to test the preview in WhatsApp (send the link to myself) because WhatsApp caches previews.

Done when: the og tags use the live URL and the image URL returns 200.
```

## Phase 5: Custom domain (optional)

```
I want the page at book.<my domain>. Ask me for the domain, then walk me through the exact DNS record to add at my registrar (do not change DNS yourself). Add the domain to the host, wait for verification and HTTPS, then update og:url and og:image to the new address and push.

Done when: the custom domain loads over HTTPS and redirects from the default host URL are working.
```

## Phase 6: Turn on automatic delivery

The Send to Obi button and `api/book.js` are already built and tested with a mocked email service. This phase connects the real one. Obi already has a Resend account and API keys, so do not create or recommend a new account. Never put a key in the repo or in chat.

```
Read api/book.js and the send handler in index.html. I already have a Resend account and API key. Help me turn on automatic delivery on the live Vercel site:

1. Ask me two questions in one message: which inbox should receive requests (TO_EMAIL), and do I have a verified sender domain in Resend (FROM_EMAIL, in the form "ASL Booking <book@mydomain.com>"). If I do not have a verified domain, explain once that Resend then only delivers to the email my Resend account was created with, so TO_EMAIL must be that address.
2. Tell me exactly where to add the variables: Vercel project > Settings > Environment Variables, for Production (and Preview if I want it). Names: RESEND_API_KEY, TO_EMAIL, and FROM_EMAIL if applicable. I will paste the values into Vercel myself. If the Vercel CLI is logged in, you may run "vercel env add" and let me type the value into the prompt, but never echo it or put it in a file.
3. After I confirm they are set, trigger a redeploy and wait for it to finish.
4. With my go ahead, submit exactly one real test request through the live page using the name "Test" and my contact, picking one block on a coming Thursday evening. Confirm the email arrives in my inbox and check: the subject reads "New ASL call request from Test", the blocks are in Eastern time, my local time is shown when my time zone is not New York, and replying goes to the contact if it is an email address.
5. Test failure handling without sending email: use curl against the live /api/book with a bad payload (empty name, a Sunday block, hour 21) and confirm each returns HTTP 400. Confirm a GET returns 405. Confirm a request with the hidden "website" field filled returns success and sends no email.
6. Open the live page on a 390px wide viewport and confirm the Send, Copy my times and Clear all buttons wrap cleanly, the honeypot field is not visible, and the confirmation message reads "Got it. I'll confirm your time shortly."

If a step fails, read the Vercel function logs, fix the cause, and retest once. Do not retry the live send more than once without asking me.

Done when: one real test request from the live site arrives in my inbox with correct Eastern and local times, the 400 and 405 checks pass, and no key appears anywhere in the repo or git history.
```

## Phase 7: Keep availability honest (optional)

```
Add a simple way for me to block times I am not free. Create availability.json in the repo root with a "booked" array of strings like "2026-10-29|19" (date, then 24 hour start). Make index.html fetch it on load and mark those blocks as taken (the striped state that already exists). If the file fails to load, fall back to showing everything as open. Document the format in README.md in two lines.

Done when: adding a block to availability.json and pushing makes it appear as taken on the live page.
```

If Obi later wants this to read his Google Calendar automatically, propose a serverless function with read-only calendar access and ask before connecting any account.

## Phase 8: Final QA and handoff

```
Run a final pass on the live site:
- Lighthouse for mobile: report Performance, Accessibility, Best Practices and SEO. Fix anything under 90 that can be fixed without changing the design (for example image sizes, alt text, contrast, meta tags).
- Confirm the page works in dark mode and light mode system settings (it should look the same).
- Confirm no em dashes appear anywhere in the repo (grep for the character).
- Confirm no secrets are committed (scan the git history for keys and tokens, for example strings starting with "re_").
- Confirm no personal email address or phone number appears in the public repo.
- Confirm the hours in index.html and api/book.js still match.

Then write a short HANDOFF section at the bottom of README.md: the live URL, how to edit copy, how to mark blocks as taken, how to redeploy, and where the environment variables live.

Done when: Lighthouse scores are reported, fixes are pushed, and the handoff notes are in the README.
```

## Quick prompts for later changes

- Change the headline or any copy: "Change the hero headline to '<new text>'. Keep the yellow emphasis on the last word. No em dashes."
- Adjust hours or days: "Change the available hours to <range> and add Sunday. Update HOURS and the day columns in index.html, HOURS_MIN, HOURS_MAX and the Sunday rule in api/book.js, the page copy, and the message text, then rerun the api and page checks."
- New client link: "Duplicate this page for a client named <name> with their own heading and form recipient, and deploy it at /<slug>."
