/**
 * Example Google Apps Script endpoint for Technology Horizons.
 *
 * Setup:
 * 1. Create a Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Paste this file.
 * 4. Deploy -> New deployment -> Web app.
 * 5. Execute as: Me.
 * 6. Who has access: Anyone.
 * 7. Copy the /exec URL into assets/js/site.js.
 */

const SHEET_NAME = 'Submissions';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    const payload = Object.assign({}, e.parameter || {});

    payload.received_at = new Date().toISOString();

    const incomingKeys = Object.keys(payload);
    const headers = ensureHeaders_(sheet, incomingKeys);
    const row = headers.map((header) => payload[header] || '');

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function ensureHeaders_(sheet, keys) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  let headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(Boolean);

  if (headers.length === 0) {
    headers = [
      'received_at',
      'submitted_at',
      'form_type',
      'site_language',
      'name',
      'email',
      'organisation',
      'profile_url',
      'topic',
      'preferred_language',
      'format',
      'message',
      'page_title',
      'page_url',
      'consent'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const missing = keys.filter((key) => !headers.includes(key));
  if (missing.length > 0) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
  }

  return headers;
}
