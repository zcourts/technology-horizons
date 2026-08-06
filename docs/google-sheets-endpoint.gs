/**
 * Technology Horizons form receiver.
 *
 * Deployment:
 * 1. Open the destination Google Sheet.
 * 2. Open Extensions -> Apps Script.
 * 3. Replace the editor contents with this entire file.
 * 4. Deploy -> New deployment -> Web app.
 * 5. Execute as: Me.
 * 6. Who has access: Anyone.
 * 7. Put the generated /exec URL in assets/js/site.js.
 */

var SPREADSHEET_ID = '12of6lHoykHXQbjIkHjsQbV7FqINGk3D_nG24yDAioYs';

var TAB_BY_FORM_TYPE = {
  talk: 'Talk submissions',
  contact: 'Contact messages'
};

var ALL_SUBMISSIONS_TAB = 'All submissions';

var HEADERS = [
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
  'referrer',
  'consent'
];

var REQUIRED_FIELDS = {
  contact: ['name', 'email', 'message', 'consent'],
  talk: [
    'name',
    'email',
    'topic',
    'preferred_language',
    'format',
    'message',
    'consent'
  ]
};

var TALK_LANGUAGES = ['pl', 'en', 'either'];
var TALK_FORMATS = ['lightning', 'talk', 'demo', 'panel', 'workshop'];

/**
 * Health check. Opening the deployed /exec URL should return this JSON.
 */
function doGet() {
  return jsonResponse({
    ok: true,
    service: 'Technology Horizons forms',
    form_types: Object.keys(TAB_BY_FORM_TYPE)
  });
}

/**
 * Accepts the JSON payload sent by assets/js/site.js.
 */
function doPost(e) {
  var lock;

  try {
    var data = parsePayload(e);

    // Silently discard bot submissions that fill the hidden website field.
    if (textValue(data.website_url)) {
      return jsonResponse({ ok: true });
    }

    var formType = textValue(data.form_type).toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(TAB_BY_FORM_TYPE, formType)) {
      return jsonResponse({
        ok: false,
        error: 'Unsupported form type.'
      });
    }

    data.form_type = formType;

    var validationError = validateSubmission(data, formType);
    if (validationError) {
      return jsonResponse({
        ok: false,
        error: validationError
      });
    }

    data.received_at = new Date().toISOString();

    lock = LockService.getScriptLock();
    lock.waitLock(20000);

    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    writeRow(
      spreadsheet,
      TAB_BY_FORM_TYPE[formType],
      data
    );

    writeRow(
      spreadsheet,
      ALL_SUBMISSIONS_TAB,
      data
    );

    return jsonResponse({
      ok: true,
      tab: TAB_BY_FORM_TYPE[formType]
    });
  } catch (error) {
    console.error('Technology Horizons submission failed', error);

    return jsonResponse({
      ok: false,
      error: 'Submission could not be stored.'
    });
  } finally {
    if (lock) {
      lock.releaseLock();
    }
  }
}

/**
 * Supports the site's JSON body and URL-encoded manual tests.
 */
function parsePayload(e) {
  var rawBody = e && e.postData && e.postData.contents;

  if (rawBody) {
    try {
      var parsed = JSON.parse(rawBody);

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch (error) {
      // Fall through to e.parameter.
    }
  }

  return Object.assign({}, (e && e.parameter) || {});
}

function validateSubmission(data, formType) {
  var required = REQUIRED_FIELDS[formType];

  for (var index = 0; index < required.length; index += 1) {
    var field = required[index];

    if (!textValue(data[field])) {
      return 'Missing required field: ' + field;
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue(data.email))) {
    return 'Invalid email address.';
  }

  if (textValue(data.consent).toLowerCase() !== 'yes') {
    return 'Consent is required.';
  }

  if (
    formType === 'talk' &&
    TALK_LANGUAGES.indexOf(textValue(data.preferred_language)) === -1
  ) {
    return 'Invalid preferred language.';
  }

  if (
    formType === 'talk' &&
    TALK_FORMATS.indexOf(textValue(data.format)) === -1
  ) {
    return 'Invalid talk format.';
  }

  for (var headerIndex = 0; headerIndex < HEADERS.length; headerIndex += 1) {
    var header = HEADERS[headerIndex];

    if (textValue(data[header]).length > 5000) {
      return 'Field is too long: ' + header;
    }
  }

  return '';
}

function writeRow(spreadsheet, tabName, data) {
  var sheet =
    spreadsheet.getSheetByName(tabName) ||
    spreadsheet.insertSheet(tabName);

  var headers = ensureHeaders(sheet);
  var row = headers.map(function (header) {
    return safeCellValue(data[header]);
  });

  sheet.appendRow(row);
}

/**
 * Creates headers for a new tab and safely adds any missing headers to an
 * existing tab without changing the order of existing columns.
 */
function ensureHeaders(sheet) {
  var headers = [];
  var lastColumn = sheet.getLastColumn();

  if (lastColumn > 0) {
    headers = sheet
      .getRange(1, 1, 1, lastColumn)
      .getValues()[0]
      .map(textValue)
      .filter(Boolean);
  }

  if (headers.length === 0) {
    headers = HEADERS.slice();
    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);
    sheet.setFrozenRows(1);
    return headers;
  }

  var missing = HEADERS.filter(function (header) {
    return headers.indexOf(header) === -1;
  });

  if (missing.length > 0) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
    headers = headers.concat(missing);
  }

  return headers;
}

/**
 * Prevents user-controlled text from being evaluated as a Sheets formula.
 */
function safeCellValue(value) {
  var text = textValue(value);

  if (/^[\s]*[=+\-@]/.test(text)) {
    return "'" + text;
  }

  return text;
}

function textValue(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
