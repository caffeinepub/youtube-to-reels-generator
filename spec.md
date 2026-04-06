# YouTube to Reels Generator

## Current State
- App has 3 tabs: YouTube Link, Video Upload, Keyword Settings
- YouTube Link tab: pastes URL, generates 10 reel cards with title, script, hashtags, timestamps
- Each reel card has Edit, Copy, and Download buttons
- The Download button on reel cards currently shows a toast: "Video download requires actual video upload" -- does NOT actually download anything
- Video Upload tab: user uploads a video file, splits into 10 segments, Download button downloads the full original video (not actual trimmed clip)
- No PDF export feature exists

## Requested Changes (Diff)

### Add
1. **PDF Download for all reels** -- A "Download All as PDF" button above the reels grid in the YouTube tab that generates and downloads a PDF file containing all 10 reels' titles, scripts, hashtags, and timestamps using the browser's print-to-PDF or jsPDF-style approach (using window.print or a Blob with formatted HTML)
2. **Individual reel text download** -- The existing Download button on each reel card should download a .txt file with that reel's title, script, hashtags, and timestamps instead of showing a toast
3. **YouTube timestamp deep-link** -- Each reel card should have an "Open in YouTube" button (or link icon) that opens the original YouTube video at the reel's start timestamp (using `?t=` query param)
4. **Downloader site links** -- A small info section or tooltip on each reel card showing links to y2mate.com and savefrom.net so users can manually download the video segment
5. **Video Upload: actual clip trimming indicator** -- Keep existing behavior but update the note text to be more helpful, directing users to use the timestamp to manually trim

### Modify
- `handleDownload` in `ReelCardItem`: change from toast info message to actual `.txt` file download using Blob + URL.createObjectURL
- Reel card actions row: add "Open in YouTube" icon button alongside Edit/Copy/Download
- After reel grid is shown: add a "Download All as PDF" button that uses `window.print()` with a formatted print stylesheet, or generates a Blob HTML document

### Remove
- The unhelpful toast "Video download requires actual video upload" on reel card download button

## Implementation Plan
1. Modify `ReelCardItem` component:
   - `handleDownload`: create a `.txt` Blob with reel content and trigger download
   - Add `handleOpenYouTube`: open YouTube URL with `?t={startTime}` in new tab
   - Add an "Open in YouTube" button (ExternalLink icon) in the actions row
   - Add a small downloader links row below actions: y2mate and savefrom links
2. Add `handleDownloadAllPDF` function in `YouTubeLinkTab`:
   - Build a formatted HTML string of all 10 reels
   - Open in a new window and trigger `window.print()` for PDF save
3. Add a "Download All as PDF" button in the reels section header row
4. Pass `youtubeUrl` down to `ReelCardItem` so it can construct the timestamp URL
