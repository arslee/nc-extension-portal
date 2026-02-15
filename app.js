// ============================================================
// NC State Extension — App Portal Logic
// ============================================================

// DOM references
const btnGoogleSignin = document.getElementById("btn-google-signin");
const btnSignout = document.getElementById("btn-signout");
const btnModalSignin = document.getElementById("btn-modal-signin");
const modalClose = document.getElementById("modal-close");
const signinModal = document.getElementById("signin-modal");
const signedOutControls = document.getElementById("signed-out-controls");
const signedInControls = document.getElementById("signed-in-controls");
const userAvatar = document.getElementById("user-avatar");
const userName = document.getElementById("user-name");
const appCards = document.querySelectorAll(".app-card");

// Track current user
let currentUser = null;

// ---- Firebase initialization ----
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();
firebase.analytics();

// ---- Admin email for CSV export (change to your email) ----
const ADMIN_EMAILS = ["esq246@gmail.com"];

// ---- Auth state listener ----
auth.onAuthStateChanged(function (user) {
  currentUser = user;
  if (user) {
    // Show signed-in controls in nav
    signedOutControls.classList.add("hidden");
    signedInControls.classList.remove("hidden");
    userName.textContent = user.displayName || user.email;
    if (user.photoURL) {
      userAvatar.src = user.photoURL;
      userAvatar.style.display = "";
    } else {
      userAvatar.style.display = "none";
    }
    // Close modal if open
    signinModal.classList.add("hidden");
    updateAdminUI(user);
    logEvent("sign_in", { email: user.email, name: user.displayName });
  } else {
    // Show signed-out controls in nav
    signedOutControls.classList.remove("hidden");
    signedInControls.classList.add("hidden");
    updateAdminUI(null);
  }
});

// ---- Sign in (nav button) ----
btnGoogleSignin.addEventListener("click", function () {
  doSignIn();
});

// ---- Sign in (modal button) ----
btnModalSignin.addEventListener("click", function () {
  doSignIn();
});

function doSignIn() {
  auth.signInWithPopup(provider).catch(function (error) {
    console.error("Sign-in error:", error.code, error.message);
    alert("Sign-in failed: " + error.message);
  });
}

// ---- Sign out ----
btnSignout.addEventListener("click", function () {
  auth.signOut();
});

// ---- Modal close ----
modalClose.addEventListener("click", function () {
  signinModal.classList.add("hidden");
});

signinModal.addEventListener("click", function (e) {
  if (e.target === signinModal) {
    signinModal.classList.add("hidden");
  }
});

// ---- App card click — require login ----
appCards.forEach(function (card) {
  card.addEventListener("click", function (e) {
    if (!currentUser) {
      // Block navigation and show sign-in modal
      e.preventDefault();
      signinModal.classList.remove("hidden");
      return;
    }
    // User is signed in — log the click and allow navigation
    logEvent("app_click", {
      email: currentUser.email,
      name: currentUser.displayName,
      app: card.dataset.app
    });
  });
});

// ---- Show/hide admin button based on user ----
function updateAdminUI(user) {
  var btn = document.getElementById("btn-export-csv");
  if (btn && user && ADMIN_EMAILS.includes(user.email)) {
    btn.classList.remove("hidden");
  } else if (btn) {
    btn.classList.add("hidden");
  }
}

// ---- CSV export ----
var btnExport = document.getElementById("btn-export-csv");
if (btnExport) {
  btnExport.addEventListener("click", function () {
    btnExport.textContent = "Exporting...";
    btnExport.disabled = true;

    db.collection("usage_logs")
      .orderBy("timestamp", "desc")
      .get()
      .then(function (snapshot) {
        var rows = [["event", "email", "name", "app", "timestamp", "userAgent"]];
        snapshot.forEach(function (doc) {
          var d = doc.data();
          var ts = d.timestamp ? d.timestamp.toDate().toISOString() : "";
          rows.push([
            d.event || "",
            d.email || "",
            d.name || "",
            d.app || "",
            ts,
            (d.userAgent || "").replace(/,/g, ";")
          ]);
        });

        var csv = rows.map(function (r) {
          return r.map(function (v) { return '"' + v.replace(/"/g, '""') + '"'; }).join(",");
        }).join("\n");

        var blob = new Blob([csv], { type: "text/csv" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "usage_logs_" + new Date().toISOString().slice(0, 10) + ".csv";
        a.click();
        URL.revokeObjectURL(url);

        btnExport.textContent = "Export CSV";
        btnExport.disabled = false;
      })
      .catch(function (error) {
        console.error("Export failed:", error);
        alert("Export failed: " + error.message);
        btnExport.textContent = "Export CSV";
        btnExport.disabled = false;
      });
  });
}

// ---- Firestore usage logging ----
function logEvent(eventType, data) {
  db.collection("usage_logs").add({
    event: eventType,
    email: data.email || null,
    name: data.name || null,
    app: data.app || null,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    userAgent: navigator.userAgent
  }).catch(function (error) {
    console.warn("Failed to log event:", error);
  });
}
