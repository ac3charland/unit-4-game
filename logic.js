// Create variables to track the various states of the game
var gameStarted = false;
var enemySelected = false;
var gameOver = false;
var gameWon = false;

// Create placeholder variables for the character the user picks to play as...
var userCharacter;
// The other characters, which become enemies...
var enemies = [];
// And the currently selected enemy.
var currentDefender;

// Initialize the game's audio files
var battleSong = new Audio("assets/sounds/battle.mp3");
battleSong.loop = true;
var gameWonSong = new Audio("assets/sounds/gameWon.mp3");
var gameOverSong = new Audio("assets/sounds/gameOver.mp3");

// Create a Character prototype which all characters inherit from
function Character(name, health, attPwr, counterPwr, src, value) {
    this.name = name;
    this.health = health;

    // Attack power
    this.attPwr = attPwr;
    // Current attack power
    this.currentAttPwr = attPwr;
    // Counter attack power
    this.counterPwr = counterPwr;

    // Url for character's picture
    this.src = src;

    // Unique numerical value given to each character
    this.value = value;

    // Increments the character's current attack power.
    this.attIncrement = function () {
        this.currentAttPwr += this.attPwr;
    }

    // Generates the HTML for the character's tile.
    this.createHTML = function () {
        var charDiv = $("<div id=" + this.name + " class='character-tile text-center active'>")
        charDiv.attr("value", this.value);
        charDiv.html('<img class="img-fluid" src="' + this.src + '"><h5>' + this.name + '</h5><h6>Health: ' + this.health + '</h6>')
        return charDiv;
    }
}

// Create our four characters
var Link = new Character("Link", 100, 40, 50, "assets/images/link.png", "0");
var Ganon = new Character("Ganon", 200, 10, 55, "assets/images/ganon.jpg", "1");
var Yiga = new Character("Yiga", 85, 60, 10, "assets/images/yiga.jpg", "2");
var Lynel = new Character("Lynel", 150, 30, 45, "assets/images/lynel.png", "3");

// Put our four characters in an array, where each character's index matches their .value property.
var characters = [Link, Ganon, Yiga, Lynel];

// Creates a Bootstrap column for a character, given a character object and a specified Bootstrap column size
function createCharacterColumn(character, size) {
    var characterColumn = $('<div>');
    characterColumn.addClass("col-md-" + size);
    characterColumn.html(character.createHTML());
    return characterColumn;
}

// Populates the character selection row with all characters.
function moveAllToSelect() {
    for (var index in characters) {
        var character = characters[index];
        var characterColumn = createCharacterColumn(character, 3);
        $("#selectRow").append(characterColumn);
    }
}

// Creates a character in the #userRow row, based on the character index passed to the function
function moveToUser(index) {
    $("#userRow").empty();
    var characterSelected = characters[index];
    var characterColumn = createCharacterColumn(characterSelected, 12);
    $("#userRow").append(characterColumn);
}

// Populates the #enemyRow row with the remaining enemies
function populateEnemyPool() {
    $("#enemyRow").empty();
    for (var index in enemies) {
        var character = enemies[index];
        var characterColumn = createCharacterColumn(character, 3);
        $("#enemyRow").append(characterColumn);
    }
}

// Removes a character of a given value from the enemies array
function removeFromEnemyPool(value) {
    for (var index in enemies) {
        enemyValue = enemies[index].value;
        if (value == enemyValue) {
            enemies.splice(index, 1);
        }
    }
}

// Populates the #defenderRow row with a character tile based on a character value
function moveToDefense(index) {
    $("#defenderRow").empty();
    var characterSelected = characters[index];
    var characterColumn = createCharacterColumn(characterSelected, 12);

    $("#defenderRow").append(characterColumn);
}

// Logic for each attack
function attack() {
    // The player's character performs an attack
    currentDefender.health -= userCharacter.currentAttPwr;
    // Write the player's attack to the DOM
    $("#userStatus").text(userCharacter.name + " attacked " + currentDefender.name + " for " + userCharacter.currentAttPwr + " damage.");
    // The character's attack power goes up
    userCharacter.currentAttPwr += userCharacter.attPwr;
    // If the current enemy is dead...
    if (currentDefender.health <= 0) {
        // Clear the #defenderRow
        $("#defenderRow").empty();
        // Write that the enemy was defeated to the DOM
        $("#defenderStatus").text(currentDefender.name + " was defeated!")
        // Update the game state
        enemySelected = false;
        // Check and see if the game has been won and update the game state accordingly.
        if (enemies.length == 0) {
            gameWon = true;
        }
    }
    // Otherwise, if the enemy is still alive...
    else {
        // The enemy counter attacks
        userCharacter.health -= currentDefender.counterPwr;
        // Write the enemy's counterattack to the DOM
        $("#defenderStatus").text(currentDefender.name + " counterattacked " + userCharacter.name + " for " + currentDefender.counterPwr + " damage.");
        // Check and see if the player is dead and update the game state accordingly.
        if (userCharacter.health <= 0) {
            gameOver = true;
        }
    }
}


// Main function to update the overall state of the game.
function updateGameStatus() {
    // Move all characters to the selection row and return if the game hasn't yet started
    if (!gameStarted) {
        moveAllToSelect();
        $("#attBtn").attr("disabled", "disabled");
        return;
    }

    // Update the instructions if the game has begun but an enemy hasn't been selected
    if (!enemySelected) {
        $("#instructions").text("Select an enemy to attack.")
    }
    // If an enemy has been selected...
    else {
        // Enable the attack button
        $("#attBtn").removeAttr("disabled");
        // Update the instructions
        $("#instructions").text("Press the button to attack!")
        // Refresh the status of the currently selected characters
        userIndex = parseInt(userCharacter.value);
        moveToUser(userIndex);
        defenderIndex = parseInt(currentDefender.value);
        moveToDefense(defenderIndex);
    }

    // Disable the attack button when it shouldn't be used
    if (!enemySelected || gameWon || gameOver) {
        $("#attBtn").attr("disabled", "disabled");
    }

    // If the game is won, update the instructions and cue the music.
    if (gameWon) {
        $("#instructions").text("You win!")
        battleSong.pause();
        battleSong.load();
        gameWonSong.play();
    }

    // If the game is lost, update the instructions and cue the sad music.
    if (gameOver) {
        $("#instructions").text("Game over!")
        battleSong.pause();
        battleSong.load();
        gameOverSong.play();
    }
}

// Main function to move a character where they belong.
function moveCharacter(value) {
    // If the game has not yet been marked as started...
    if (!gameStarted) {
        // Move the selected character to the #userRow and update the userCharacter variable.
        moveToUser(value);
        userCharacter = characters[value];

        // Populate the enemies array and send those characters to the #enemyRow
        for (var i in characters) {
            if (i != value) {
                enemies.push(characters[i]);
            }
        }
        populateEnemyPool(value);

        // Clear the #selectRow
        $("#selectRow").empty();

        // Update the game status and cue the battle music!
        gameStarted = true;
        battleSong.play();
    }
    // Otherwise, if the game is in progress but an enemy hasn't been selected...
    else if (!enemySelected) {
        // Make sure the user didn't click their own character...
        if (value != userCharacter.value) {
            // Move the character with index value to the #defenseRow
            moveToDefense(value);
            // Remove that same character from the enemyPool and refresh
            removeFromEnemyPool(value);
            populateEnemyPool();
            // Update the currentDefender variable and the game state
            currentDefender = characters[value];
            enemySelected = true;
        }
    }
}

$(document).ready(function () {
    updateGameStatus();

    // Run this code when the user clicks a character
    $(document).on("click", ".character-tile", function () {
        // Get the clicked character's index value
        var valueString = $(this).attr('value');
        var value = parseInt(valueString);

        // Move that character appropriately and update the game's status
        moveCharacter(value);
        updateGameStatus();
    })

    // Run this code when the user clicks the attack button
    $(document).on("click", "#attBtn", function () {
        attack();
        updateGameStatus();
    })
})