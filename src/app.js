Sentry.init({ dsn: 'https://79b3f14595364cadad18eb0609f323a4@sentry.io/1329586' });


function sendSentry(msg) {
  setTimeout(() => { throw msg }, 1);
}

function addExpense(e) {
  e.preventDefault();
  const form = document.querySelector(".js-expense-form");
  const keys = new Set(
    Array.from(form.querySelectorAll('input'))
      .filter((el) => el.type != 'submit' && el.name)
      .map((el) => el.name)
  );
  const formData = new FormData(form);
  if (Array.from(formData.keys()).length > 0) {
    formData.set('date', getTodayISODateString());
    keys.add('date');
    const expenseUid = guid();
    localStorage.setItem(expenseUid, jsonifyFormData(formData, keys)); // TODO robustify this, localStorage may not be available
    sendExpenses([expenseUid]);
  } else throw 'EmptyExpenseData';
  form.reset();
  displayNotification('Dépense ajoutée');
}

function displayNotification(msg) {
  const container = document.querySelector('.js-notifications')
  container.textContent = msg;
  container.classList.remove('hidden');
  window.setTimeout(() => {
    container.classList.add('hidden');
  }, 6000)
}

function getTodayISODateString() {
  return (new Date()).toISOString().replace(/T.*/, '');
}

function jsonifyFormData(formData, keys) {
  const data = {};
  for (key of keys) {
    data[key] = formData.getAll(key).join(',');
  }
  return JSON.stringify(data);
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

window.onload = function (e) {
  const form = document.querySelector(".js-expense-form");
  form.addEventListener('submit', addExpense);
}


// Client ID and API key from the Developer Console
var CLIENT_ID = "623090564674-3gs5kasdo89gm5i6cjpk23lcga5j9a98.apps.googleusercontent.com";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

/**
 *  On load, called to load the auth2 library and API client library.
 */
window.handleClientLoad = function () {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    const authorizeButton = document.getElementById('authorize-button');
    const signoutButton = document.getElementById('signout-button');
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  const loginView = document.getElementById('login');
  const appView = document.getElementById('app');
  if (isSignedIn) {
    loginView.style.display = 'none';
    appView.style.display = 'block';
    loadSheetsApi();
  } else {
    loginView.style.display = 'block';
    appView.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn({ux_mode: "redirect"});
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  console.log("hum");
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Load Sheets API client library.
 */
var loadSheetsApi = function () {
  var resolver = null;
  var inProgress = false;
  const loadingPromise = new Promise((resolve, reject) => {
    resolver = resolve;
  })
  return function() {
    if (inProgress) {
      return loadingPromise;
    }
    inProgress = true;
    var discoveryUrl =
        'https://sheets.googleapis.com/$discovery/rest?version=v4';
    return gapi.client.load(discoveryUrl).then(data => resolver(data));
  }
}()

function expenseToArray(expenseUid) {
  const expense = JSON.parse(localStorage.getItem(expenseUid));
  if (expense) {
    return [expenseUid, expense.for_who, expense.who, expense.amount, expense.date, expense.description]
  }
}

const sendExpenses = function() {
  let ongoing = false;
  return async function sendExpenses(expenseUids) {
    if (ongoing) {
      console.log("Concurrent call for sendExpenses, skipping.")
      return
    }
    ongoing = true;
    await loadSheetsApi();
    const spreadsheetId = "15gbn45Wh-vEkVvoohKVXBtY-2yTND7nyQg1MnaSAv6k";
    const valueInputOption = "USER_ENTERED";
    const insertDataOption = "INSERT_ROWS";

    expenseUids = expenseUids ? expenseUids : Object.keys(localStorage);
    const values = expenseUids
      .map((key) => expenseToArray(key))
      .filter((expense) => !!expense)

    let response = null;
    try {
      response = await gapi.client.sheets.spreadsheets.values.append(
        {
          spreadsheetId,
          range: "A1",
          valueInputOption,
          insertDataOption,
        },
        { values },
      )
    } catch(e) {
      console.log("Failed to POST expenses", e);
      sendSentry(e);
    }
    if (response) {
      if (response.status === 200) {
        for (let uid of expenseUids) {
          localStorage.removeItem(uid);
        }
      }
      if (response.status === 401) {
        updateSigninStatus(false);
      }
    }
    ongoing = false;
  }
}()

function focusListener(e) {
  sendExpenses();
}

window.addEventListener("focus", focusListener);
