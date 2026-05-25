/*Specs:

var secret = 7;

var answer = prompt (“Please guess the secret number (1-20)”);

// Convert the string guess to an integer so that we can compare
var guess = parseInt (answer);

/////////////////////////////////////////////////////////

Please add an if statement which checks if the guess is correct, if it is, then display a message: Correct Guess!, otherwise “Sorry, incorrect Guess!

How can you combine line 2 and 3 into one line

Expand the program to do this in a while loop, only exiting when the guess was correct

While the guess is incorrect, test also if it is too low or too high and display the message “Incorrect, too low” or “Incorrect, too high”.

When you are done make the secret number random.*/

// var secret = Math.floor(Math.random() * 20) + 1;

// var allGuesses = [];
// while (guess !== secret) {
//     var guess = parseInt(prompt("Please guess the secret number (1-20)"));
//     allGuesses.push(guess);
//     if (guess === secret) {
//         alert("Correct Guess! The secret number was " + secret + ". Your guesses were: " + allGuesses.join(", "));
//     } else if (guess < secret) {
//         alert("Incorrect, too low");
//     } else if (guess > secret) {
//         alert("Incorrect, too high");
//     }
// }

var secret = Math.floor(Math.random() * 20) + 1;
var allGuesses = [];
var numGuesses = 0;

document.getElementById("guessButton").addEventListener("click", submitGuess);
document.getElementById("resetButton").addEventListener("click", resetGame);

function submitGuess() {
    while (guess !== secret) {
        var guess = parseInt(document.getElementById("guessInput").value);
        numGuesses++;
        allGuesses.push(guess);
        if (guess === secret) {
            alert("Correct Guess!");
            showResults();
            break;
        }
        else if (guess < secret && guess >= 1) {
            alert("Incorrect, too low");
            break;
        } else if (guess > secret && guess <= 20) {
            alert("Incorrect, too high");
            break;
        } else {
            alert("Please enter a valid number between 1 and 20");
            break;
        }

    }
    document.getElementById("guessInput").value = "";
}

function resetGame() {
    secret = Math.floor(Math.random() * 20) + 1;
    allGuesses = [];
    numGuesses = 0;
    document.getElementById("guessInput").value = "";
    document.getElementById("finalMessage").innerHTML = "Results will appear here";
}

function showResults() {
    document.getElementById("finalMessage").innerHTML = "The secret number was " + secret +
        ". <br> <br> You made " + numGuesses + " guesses. <br> Your guesses were: <br> <br>" + allGuesses.join(", ") +
        ". <br> <br> Click 'Play Again' to try again and improve your score!";
}