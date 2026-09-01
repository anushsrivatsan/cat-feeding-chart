# Setting up the Feeding Chart

This is a single static file (`index.html`). No Apps Script, no server, no
build step. It runs entirely in the browser and talks to Google Sheets
directly, using each person's own Google sign-in. You'll spend about
20–30 minutes on one-time setup.

## 1. Create the Google Sheet

Create a new Google Sheet with **three tabs**, named exactly as below.

**Tab: `Cats`**
| Name | Photo |
|------|-------|
| Simba | https://drive.google.com/file/d/FILE_ID/view |

- Column A: the cat's name, exactly as you want it shown.
- Column B: a Google Drive **share link** to the photo (or just the file ID).
  For each photo in Drive: right-click → Share → change access to
  **"Anyone with the link"** → Viewer → copy link. This is required —
  if the photo isn't shared, it won't load in the app.

**Tab: `Brands`**
| Brand | CostPerPacket |
|-------|---------------|
| Whiskas Pouch | 25 |
| Me-O Tuna | 30 |

- Column A: brand name as you want it shown in the dropdown.
- Column B: cost per packet, as a plain number (no ₹ symbol).

**Tab: `Log`**
| Timestamp | Date | Time | Cat | Brand | Packets | CostPerPacket | TotalCost | LoggedBy |
|-----------|------|------|-----|-------|---------|----------------|-----------|----------|

- Just add this header row — the app appends new rows underneath automatically.
  Leave it empty otherwise.

To add or retire a cat, or add a new food brand, just edit the `Cats` or
`Brands` tab directly — no code changes needed.

## 2. Set up Google Cloud (for sign-in + Sheets access)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and
   create a new project (top-left project switcher → New Project). Any name
   is fine, e.g. "Cat Feeding Tracker".
2. **Enable the Sheets API**: in the search bar, search "Google Sheets API" →
   open it → click **Enable**.
3. **Configure the OAuth consent screen**: left sidebar → APIs & Services →
   OAuth consent screen.
   - User type: **External** (unless everyone has a Google Workspace account
     on the same domain, in which case Internal is simpler).
   - Fill in app name ("Feeding Chart"), your email as support contact.
   - Scopes: you can leave defaults; the app requests the Sheets scope itself.
   - Test users: while the app is in "Testing" status, add the email of
     every staff member who'll use it (Google limits unverified apps to
     listed test users). If that's impractical for a large team, you can
     submit the app for verification later, or keep the team's usage on the
     "Internal" setting if you're on Google Workspace.
4. **Create credentials**: APIs & Services → Credentials → Create Credentials
   → **OAuth client ID** → Application type: **Web application**.
   - Under "Authorized JavaScript origins," add the exact URL where you'll
     host this app, e.g. `https://yourname.github.io` (no trailing slash,
     no path).
   - Save, then copy the **Client ID** (ends in `.apps.googleusercontent.com`).

## 3. Get your Spreadsheet ID

Open your Google Sheet and look at the URL:
```
https://docs.google.com/spreadsheets/d/THIS_LONG_ID_HERE/edit
```
Copy the long ID between `/d/` and `/edit`.

## 4. Configure the app

Open `index.html` in any text editor and near the top of the `<script>`
section, fill in:

```js
const CONFIG = {
  CLIENT_ID: "PASTE_YOUR_CLIENT_ID_HERE",
  SPREADSHEET_ID: "PASTE_YOUR_SPREADSHEET_ID_HERE",
  ...
};
```

Save the file.

## 5. Host it (GitHub Pages — free)

1. Create a new GitHub repository (e.g. `cat-feeding-chart`). Public is fine
   since there are no secrets in the file — the OAuth client ID is not
   sensitive on its own, and every real request still requires the signed-in
   user to have edit access to your Sheet.
2. Upload `index.html` to the repo (GitHub web UI: **Add file → Upload
   files**, or `git push` if you're comfortable with that).
3. Go to the repo's **Settings → Pages**. Under "Build and deployment,"
   set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
   Save.
4. GitHub gives you a URL like `https://yourname.github.io/cat-feeding-chart/`.
   That's the app.
5. Go back to your Google Cloud OAuth client (step 2.4) and double check the
   **Authorized JavaScript origin** matches the origin exactly — just the
   `https://yourname.github.io` part, no path, no trailing slash. If you
   change it, allow a few minutes for it to take effect.

## 6. Share the Sheet with your team

Anyone who'll log a feed needs **Editor** access to the Google Sheet itself
(Share button in Sheets), since they're writing to it with their own account.
They'll also need to sign in with that same Google account the first time
they open the app.

## Using it day to day

- Open the app URL, sign in with Google once (the browser remembers it).
- Tap a cat, pick packets and brand, tap **Log the feed**.
- The "Today's feeds" list and the "Fed Nx today" badges refresh live from
  the Log tab, so everyone can see who's already been fed.

## If something doesn't load

- **"Couldn't read Cats..."** — check the tab is named exactly `Cats` (case
  sensitive) and the signed-in account has at least Viewer access to the Sheet.
- **Photos not showing** — the Drive file needs to be shared as "Anyone with
  the link."
- **Sign-in button does nothing** — check the Authorized JavaScript origin in
  Google Cloud exactly matches your hosted URL.
