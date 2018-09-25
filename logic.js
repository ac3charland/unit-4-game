var gameStarted = false;
var enemySelected = false;
var gameOver = false;
var gameWon = false;
var userCharacter;
var enemies = [];
var currentDefender;

var battleSong = new Audio("assets/sounds/battle.mp3");
battleSong.loop = true;
var gameWonSong = new Audio("assets/sounds/gameWon.mp3");
var gameOverSong = new Audio("assets/sounds/gameOver.mp3");

function Character(name, health, attPwr, counterPwr, src, value) {
    this.name = name;
    this.health = health;
    this.attPwr = attPwr;
    this.currentAttPwr = attPwr;
    this.counterPwr = counterPwr;
    this.src = src;
    this.value = value;
    this.attIncrement = function () {
        this.currentAttPwr += this.attPwr;
    }
    this.createHTML = function () {
        var charDiv = $("<div id=" + this.name + " class='character-tile text-center active'>")
        charDiv.attr("value", this.value);
        charDiv.html('<img class="img-fluid" src="' + this.src + '"><h5>' + this.name + '</h5><h6>Health: ' + this.health + '</h6>')
        return charDiv;
    }
}

var Link = new Character("Link", 100, 50, 50, "assets/images/link.png", "0");
var Ganon = new Character("Ganon", 200, 10, 55, "assets/images/Ganon.jpg", "1");
var Yiga = new Character("Yiga", 85, 80, 10, "assets/images/yiga.jpg", "2");
var Lynel = new Character("Lynel", 150, 30, 25, "assets/images/lynel.png", "3");

var characters = [Link, Ganon, Yiga, Lynel];



function createCharacterColumn(character, size) {
    var characterColumn = $('<div>');
    characterColumn.addClass("col-md-" + size);
    characterColumn.html(character.createHTML());
    return characterColumn;
}

function moveAllToSelect() {
    for (var index in characters) {
        var character = characters[index];
        var characterColumn = createCharacterColumn(character, 3);
        $("#selectRow").append(characterColumn);
    }
}

function moveToUser(index) {
    $("#userRow").empty();
    var characterSelected = characters[index];
    var characterColumn = createCharacterColumn(characterSelected, 12);
    $("#userRow").append(characterColumn);
}

function populateEnemyPool() {
    $("#enemyRow").empty();
    for (var index in enemies) {
        var character = enemies[index];
        var characterColumn = createCharacterColumn(character, 3);
        $("#enemyRow").append(characterColumn);
    }
}

function removeFromEnemyPool(value) {
    for (var index in enemies) {
        enemyValue = enemies[index].value;
        if (value == enemyValue) {
            enemies.splice(index, 1);
        }
    }
}

function moveToDefense(index) {
    $("#defenderRow").empty();
    var characterSelected = characters[index];
    var characterColumn = createCharacterColumn(characterSelected, 12);

    $("#defenderRow").append(characterColumn);
}

function attack() {
    $("#userStatus").text(userCharacter.name + " attacked " + currentDefender.name + " for " + userCharacter.currentAttPwr + " damage.");
    currentDefender.health -= userCharacter.currentAttPwr;
    if (currentDefender.health <= 0) {
        $("#defenderRow").empty();
        $("#defenderStatus").text(currentDefender.name + " was defeated!")
        enemySelected = false;
        if (enemies.length == 0) {
            gameWon = true;
        }
    } else {
        $("#defenderStatus").text(currentDefender.name + " counterattacked " + userCharacter.name + " for " + currentDefender.counterPwr + " damage.");
        userCharacter.health -= currentDefender.counterPwr;
        userCharacter.currentAttPwr += userCharacter.attPwr;
        if (userCharacter.health <= 0) {
            gameOver = true;
        }
    }
}


function updateGameStatus() {
    if(!gameStarted || !enemySelected || gameWon || gameOver) {
        $("#attBtn").attr("disabled", "disabled");
    }
    
    if (!gameStarted) {
        moveAllToSelect();
        return;
    }

    if (!enemySelected) {
        $("#instructions").text("Select an enemy to attack.")
    } else {
        $("#attBtn").removeAttr("disabled");
        $("#instructions").text("Press the button to attack!")
        defenderIndex = parseInt(currentDefender.value);
        attackerIndex = parseInt(userCharacter.value);
        moveToUser(attackerIndex);
        moveToDefense(defenderIndex);
    }

    if (gameWon) {
        $("#instructions").text("You win!")
        battleSong.pause();
        battleSong.load();
        gameWonSong.play();
    }

    if (gameOver) {
        $("#instructions").text("Game over!")
        battleSong.pause();
        battleSong.load();
        gameOverSong.play();
    }
}

function moveCharacter(value) {
    if (!gameStarted) {
        moveToUser(value);
        userCharacter = characters[value];
        for (var i in characters) {
            if (i != value) {
                enemies.push(characters[i]);
            }
        }
        populateEnemyPool(value);
        $("#selectRow").empty();
        gameStarted = true;
        battleSong.play();
    } else if (!enemySelected) {
        if (value != userCharacter.value) {
            enemySelected = true;
            moveToDefense(value);
            removeFromEnemyPool(value);
            populateEnemyPool();
            currentDefender = characters[value];
        }
    }
}




$(document).ready( function () {
    updateGameStatus();

    // Run this code when the user clicks a character
    $(document).on("click", ".character-tile", function () {
        var valueString = $(this).attr('value');
        var value = parseInt(valueString);

        moveCharacter(value);
        updateGameStatus();
    })

    // Run this code when the user clicks the attack button
    $(document).on("click", "#attBtn", function () {
        attack();
        updateGameStatus();
    })
})