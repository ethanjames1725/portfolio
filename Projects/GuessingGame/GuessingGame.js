/* ============================================================
   GAME MODE DEFINITIONS

   This object stores the settings for each difficulty.
   Each mode has:
     name       - the label shown to the player
     max        - the highest number the secret can be (range is always 1 to max)
     multiplier - score multiplier; harder modes reward more points
     range      - a short string used in labels (e.g. "1–50")
============================================================ */
var gameModes = {
    easy: {
        name: "Easy",
        max: 10,
        multiplier: 1,
        range: "1–10"
    },
    medium: {
        name: "Medium",
        max: 20,
        multiplier: 1.5,
        range: "1–20"
    },
    hard: {
        name: "Hard",
        max: 50,
        multiplier: 2,
        range: "1–50"
    },
    impossible: {
        name: "Impossible",
        max: 100,
        multiplier: 3,
        range: "1–100"
    }
};


/* ============================================================
   GAME STATE VARIABLES

   These variables track everything about the current game round.
   They are reset each time a new game starts.
============================================================ */
var currentMode = null;  // which mode key is active, e.g. "hard"
var secret = 0;     // the randomly generated secret number
var allGuesses = [];    // list of every number the player has guessed
var numGuesses = 0;     // total number of guesses made this round
var gameWon = false; // becomes true the moment the player guesses correctly


/* ============================================================
   EVENT LISTENERS — MODE SELECTION SCREEN

   querySelectorAll returns a list of all elements matching ".mode-btn".
   The for loop attaches a click listener to each one.
   When clicked, it reads the button's data-mode attribute (e.g. "hard")
   and passes it to selectMode().
============================================================ */
var modeBtns = document.querySelectorAll(".mode-btn");
for (var i = 0; i < modeBtns.length; i++) {
    modeBtns[i].addEventListener("click", function () {
        selectMode(this.getAttribute("data-mode"));
    });
}


/* ============================================================
   EVENT LISTENERS — MAIN GAME

   Each interactive element in the game area gets a listener
   for its specific action.
============================================================ */

// Clicking Submit Guess triggers the main guess logic
document.getElementById("guessButton").addEventListener("click", submitGuess);

// Pressing Enter in the input field also submits a guess
document.getElementById("guessInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitGuess();
});

// Play Again restarts the game in the same mode
document.getElementById("playAgainButton").addEventListener("click", function () {
    startNewGame();
});

// Change Mode returns the player to the mode selection screen
document.getElementById("changeModeButton").addEventListener("click", changeMode);

// Save to Leaderboard opens the save score modal
document.getElementById("saveButton").addEventListener("click", openSaveModal);

// View / Hide Leaderboard toggles the leaderboard panel
document.getElementById("leaderboardButton").addEventListener("click", toggleLeaderboard);


/* ============================================================
   EVENT LISTENERS — SAVE MODAL
============================================================ */

// Confirm Save validates the form and stores the score
document.getElementById("confirmSaveButton").addEventListener("click", saveEntry);

// Cancel closes the modal without saving anything
document.getElementById("cancelSaveButton").addEventListener("click", closeSaveModal);

// In the modal, pressing Enter on the Name field submits the form
document.getElementById("playerName").addEventListener("keydown", function (e) {
    if (e.key === "Enter") saveEntry();
});

// Clicking the dark overlay behind the modal card closes it
document.getElementById("saveModal").addEventListener("click", function (e) {
    if (e.target === this) closeSaveModal();
});


/* ============================================================
   EVENT LISTENER — CLEAR LEADERBOARD (two-step confirm)

   First click:  button text changes to "Confirm clear?" and a
                 3-second timer starts.
   Second click: actually removes the data and re-renders.
   If the player doesn't click a second time within 3 seconds,
   the button resets back to "Clear Leaderboard".
============================================================ */
var clearPending = false; // tracks whether the first click has happened

document.getElementById("clearLeaderboardButton").addEventListener("click", function () {
    if (!clearPending) {
        // First click — ask for confirmation
        this.textContent = "Confirm clear?";
        clearPending = true;
        var btn = this;

        // Auto-cancel after 3 seconds
        setTimeout(function () {
            if (clearPending) {
                btn.textContent = "Clear Leaderboard";
                clearPending = false;
            }
        }, 3000);

    } else {
        // Second click — wipe all saved scores
        localStorage.removeItem("guessingGameLeaderboard");
        renderLeaderboard();
        this.textContent = "Clear Leaderboard";
        clearPending = false;
    }
});


/* ============================================================
   FUNCTION: selectMode
   Called when the player clicks one of the four mode cards.
   Saves the chosen mode, updates the UI with mode-specific text,
   then switches from the mode selection screen to the game.
============================================================ */
function selectMode(modeName) {
    // Store the chosen mode key so other functions can read it
    currentMode = modeName;

    // Look up the full settings object for this mode
    var mode = gameModes[modeName];

    // Update the prompt inside the guess card
    document.getElementById("gamePrompt").textContent =
        "Guess the secret number between 1 and " + mode.max + "!";

    // Update the mode badge pill shown above the guess card.
    // Setting className to the mode name (e.g. "hard") also applies
    // the matching colour style from CSS.
    var badge = document.getElementById("modeBadge");
    badge.textContent = mode.name + "  •  " + mode.range + "  •  ×" + mode.multiplier + " score multiplier";
    badge.className = modeName;

    // Swap screens: hide the mode selection, reveal the game
    document.getElementById("modeSelection").classList.add("hidden");
    document.getElementById("gameArea").classList.remove("hidden");

    // Begin a fresh game round
    startNewGame();
}


/* ============================================================
   FUNCTION: startNewGame
   Resets all game-state variables, picks a new secret number
   within the active mode's range, and clears the UI.
   Called by selectMode() and by the Play Again button.
============================================================ */
function startNewGame() {
    var mode = gameModes[currentMode];

    // Pick a random number from 1 to mode.max (inclusive)
    secret = Math.floor(Math.random() * mode.max) + 1;

    // Reset the tracking variables
    allGuesses = [];
    numGuesses = 0;
    gameWon = false;

    // Clear the input and re-enable it (it gets disabled on a win)
    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").disabled = false;
    document.getElementById("guessButton").disabled = false;

    // Hide the Save button until the player wins a qualifying game
    document.getElementById("saveButton").classList.add("hidden");

    // Reset the result message to the default grey placeholder
    setMessage("Results will appear here", "");

    // Close the save modal if it happens to be open
    closeSaveModal();
}


/* ============================================================
   FUNCTION: changeMode
   Returns the player to the mode selection screen.
   Hides the game area, resets the current mode, and
   collapses the leaderboard if it was open.
============================================================ */
function changeMode() {
    // Show the mode selection screen and hide the game
    document.getElementById("modeSelection").classList.remove("hidden");
    document.getElementById("gameArea").classList.add("hidden");

    // Collapse the leaderboard and reset its button label
    document.getElementById("leaderboardSection").classList.add("hidden");
    document.getElementById("leaderboardButton").textContent = "View Leaderboard";

    // Close any open modal and clear the active mode
    closeSaveModal();
    currentMode = null;
}


/* ============================================================
   FUNCTION: submitGuess
   Runs when the player clicks Submit or presses Enter.
   Reads and validates the input, then checks it against
   the secret number and updates the feedback message.
============================================================ */
function submitGuess() {
    // Do nothing if the game has already been won
    if (gameWon) return;

    // Read the input and immediately clear the field
    var guess = parseInt(document.getElementById("guessInput").value);
    document.getElementById("guessInput").value = "";

    // Validate: the number must be in the allowed range for this mode
    var mode = gameModes[currentMode];
    if (isNaN(guess) || guess < 1 || guess > mode.max) {
        setMessage("Please enter a number between 1 and " + mode.max + ".", "error");
        return;
    }

    // Record the guess
    numGuesses++;
    allGuesses.push(guess);

    // Compare the guess to the secret number
    if (guess === secret) {
        // Correct guess — end the game
        gameWon = true;
        document.getElementById("guessInput").disabled = true;
        document.getElementById("guessButton").disabled = true;
        showResults();

    } else if (guess < secret) {
        setMessage("Too low — try a higher number!", "hint");

    } else {
        setMessage("Too high — try a lower number!", "hint");
    }
}


/* ============================================================
   FUNCTION: setMessage
   Updates the result div's content and colour state.
   The state parameter adds a CSS class that changes the colour:
     "hint"  → amber   (too low / too high)
     "error" → red     (invalid input)
     "win"   → blue    (correct guess)
     ""      → grey    (default placeholder)
============================================================ */
function setMessage(text, state) {
    var el = document.getElementById("finalMessage");
    el.innerHTML = text;
    el.className = state || "";
}


/* ============================================================
   FUNCTION: showResults
   Called when the player guesses correctly.
   Displays a full win summary including the mode, score,
   guess count, and guess history. Also shows the Save button
   if the score is good enough to make the top 10.
============================================================ */
function showResults() {
    var score = calculateScore(numGuesses);
    var mode = gameModes[currentMode];

    setMessage(
        "The secret number was <strong>" + secret + "</strong>.<br><br>" +
        "Mode: <strong>" + mode.name + "</strong>  •  " +
        "Multiplier: <strong>×" + mode.multiplier + "</strong><br>" +
        "Guessed in <strong>" + numGuesses + "</strong> guess" + (numGuesses === 1 ? "" : "es") + ".<br>" +
        "Your guesses: " + allGuesses.join(", ") + "<br><br>" +
        "Final score: <strong>" + score + "</strong>",
        "win"
    );

    // Only show the Save button if this score makes the top 10
    if (qualifiesForLeaderboard(score)) {
        document.getElementById("saveButton").classList.remove("hidden");
    }
}


/* ============================================================
   FUNCTION: calculateScore
   Returns the player's final score for this game.

   Formula:
     base score  = 1000 minus 100 for each guess beyond the first
                   (minimum of 0 — can't go negative)
     final score = base score × the mode's multiplier
                   (rounded to a whole number)

   Examples:
     Easy,       1 guess  → (1000 × 1)   = 1000
     Medium,     2 guesses → (900 × 1.5) = 1350
     Hard,       3 guesses → (800 × 2)   = 1600
     Impossible, 5 guesses → (600 × 3)   = 1800
============================================================ */
function calculateScore(guesses) {
    var baseScore = Math.max(0, 1000 - (guesses - 1) * 100);
    var multiplier = gameModes[currentMode].multiplier;
    return Math.round(baseScore * multiplier);
}


/* ============================================================
   FUNCTION: qualifiesForLeaderboard
   Returns true if the given score is good enough to appear
   in the top 10 saved entries. If fewer than 10 entries exist,
   every score qualifies automatically.
============================================================ */
function qualifiesForLeaderboard(score) {
    var entries = getLeaderboard();
    if (entries.length < 10) return true;
    // entries is sorted highest-first, so the last entry is the lowest
    return score > entries[entries.length - 1].score;
}


/* ============================================================
   FUNCTION: openSaveModal
   Opens the save score pop-up. Pre-fills the score summary text,
   clears any previous input, hides old error messages, and
   focuses the name field automatically.
============================================================ */
function openSaveModal() {
    var score = calculateScore(numGuesses);
    var mode = gameModes[currentMode];

    document.getElementById("modalScoreText").textContent =
        mode.name + " mode  •  Score: " + score + "  •  " +
        numGuesses + " guess" + (numGuesses === 1 ? "" : "es");

    // Clear any previous value and hide the error message
    document.getElementById("playerName").value = "";
    document.getElementById("nameError").classList.add("hidden");

    // Show the modal and place focus on the name input
    document.getElementById("saveModal").classList.remove("hidden");
    document.getElementById("playerName").focus();
}


/* ============================================================
   FUNCTION: closeSaveModal
   Hides the save score pop-up.
============================================================ */
function closeSaveModal() {
    document.getElementById("saveModal").classList.add("hidden");
}


/* ============================================================
   FUNCTION: saveEntry
   Validates the name and age fields, then builds an entry object
   and saves it to localStorage. After saving, the leaderboard
   is opened automatically so the player can see their result.
============================================================ */
function saveEntry() {
    var name = document.getElementById("playerName").value.trim();
    var valid = true; // used to track whether all fields pass validation

    // Validate name: must not be empty
    if (!name) {
        document.getElementById("nameError").classList.remove("hidden");
        valid = false;
    } else {
        document.getElementById("nameError").classList.add("hidden");
    }

    // Stop here if the field is invalid
    if (!valid) return;

    // Build the entry object with all the information to display
    var score = calculateScore(numGuesses);
    var entry = {
        name: name,
        mode: currentMode,                 // e.g. "hard" — used for CSS colouring
        modeName: gameModes[currentMode].name, // e.g. "Hard" — shown in the table
        score: score,
        guesses: numGuesses,
        date: new Date().toLocaleDateString()
    };

    // Load existing entries, add the new one, and sort highest score first
    var entries = getLeaderboard();
    entries.push(entry);
    entries.sort(function (a, b) { return b.score - a.score; });

    // Only keep the top 10
    if (entries.length > 10) {
        entries = entries.slice(0, 10);
    }

    // Save back to the browser's localStorage as a JSON string
    localStorage.setItem("guessingGameLeaderboard", JSON.stringify(entries));

    // Close the modal, hide the save button, and open the leaderboard
    closeSaveModal();
    document.getElementById("saveButton").classList.add("hidden");
    showLeaderboard();
}


/* ============================================================
   FUNCTION: getLeaderboard
   Reads the saved scores from localStorage and returns them as
   a JavaScript array. Returns an empty array if nothing is saved yet.
============================================================ */
function getLeaderboard() {
    var data = localStorage.getItem("guessingGameLeaderboard");
    return data ? JSON.parse(data) : [];
}


/* ============================================================
   FUNCTION: renderLeaderboard
   Builds the HTML table from the saved scores and inserts it
   into the leaderboard content area on the page.
============================================================ */
function renderLeaderboard() {
    var entries = getLeaderboard();
    var content = document.getElementById("leaderboardContent");

    // If there are no saved entries, show a placeholder message
    if (entries.length === 0) {
        content.innerHTML = "<p class='no-scores'>No scores yet. Win a game to get on the board!</p>";
        return;
    }

    // Medal emojis for the top three positions
    var medals = ["🥇", "🥈", "🥉"];

    // Build one <tr> row string for each entry
    var rows = entries.map(function (e, i) {
        // Use a medal for positions 1–3, otherwise just the number
        var rank = medals[i] || (i + 1);

        // Handles old entries saved before modes were added (shows "—" as fallback)
        var modeName = e.modeName || e.mode || "—";
        var modeKey = e.mode || "";

        return "<tr>" +
            "<td>" + rank + "</td>" +
            "<td>" + e.name + "</td>" +
            "<td class='mode-cell " + modeKey + "'>" + modeName + "</td>" +
            "<td>" + e.score + "</td>" +
            "<td>" + e.guesses + "</td>" +
            "<td>" + e.date + "</td>" +
            "</tr>";
    }).join("");

    // Insert the complete table into the page
    content.innerHTML =
        "<table class='leaderboard-table'>" +
        "<thead><tr>" +
        "<th>Rank</th><th>Name</th><th>Mode</th>" +
        "<th>Score</th><th>Guesses</th><th>Date</th>" +
        "</tr></thead>" +
        "<tbody>" + rows + "</tbody>" +
        "</table>";
}


/* ============================================================
   FUNCTION: showLeaderboard
   Reveals the leaderboard section and renders the latest scores.
   Also updates the toggle button label to "Hide Leaderboard".
============================================================ */
function showLeaderboard() {
    document.getElementById("leaderboardSection").classList.remove("hidden");
    document.getElementById("leaderboardButton").textContent = "Hide Leaderboard";
    renderLeaderboard();
}


/* ============================================================
   FUNCTION: toggleLeaderboard
   Shows the leaderboard if it is currently hidden, or hides it
   if it is currently visible — toggling on each button click.
============================================================ */
function toggleLeaderboard() {
    var section = document.getElementById("leaderboardSection");

    if (section.classList.contains("hidden")) {
        showLeaderboard();
    } else {
        section.classList.add("hidden");
        document.getElementById("leaderboardButton").textContent = "View Leaderboard";
    }
}
//the end ;p