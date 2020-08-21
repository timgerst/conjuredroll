
document.addEventListener('DOMContentLoaded', function() {
document.getElementById("rollInput")
  .addEventListener("keyup", function(event) {
    event.preventDefault();
    clearError();
    if(event.keyCode == 13) {
      roll();
    }
  });

  document.getElementById("acInput")
  .addEventListener("keyup", function(event) {
    event.preventDefault();
    formatAttacks();
  });

  document.getElementById("helpLabel")
    .addEventListener("click", function(event) {
      event.preventDefault();
      var helpBox = document.getElementById("helpBox");
      helpBox.style.display = helpBox.style.display == "block" ? "none" : "block";
    });
}, false);

var errorMsg;

function roll() {
  clearError();

  input = document.getElementById("rollInput").value;
  var creatures = parseCreatures(input); 
  
  listContainer = document.getElementById("output");
  listContainer.innerHTML = "";
  
  if(errorMsg != null) {
    return; 
  }

  listContainer = document.getElementById("output");
  listContainer.innerHTML = "";

  for(i = 0; i < creatures.count; i++) {
    var creature = makeCreature(creatures.name + " " + (i+1));
    output.appendChild(creature);
    for(j = 0; j < creatures.attacks.length; j++) {
      var attack = creatures.attacks[j];
      for(k = 0; k < attack.count; k++){
        var modifierPrefix = attack.modifier < 0 ? " " : " +";
        var damageModifierPrefix = attack.damageModifier < 0 ? " " : " +";
        var description = 
            modifierPrefix + 
            attack.modifier + 
            " " + 
            attack.numberOfDice + 
            "d" + 
            attack.sizeOfDice + 
            damageModifierPrefix +
            attack.damageModifier;
        var rawAttackRoll = rollAttack();
        var attackRoll = rawAttackRoll + attack.modifier;
        var diceMultiplier = rawAttackRoll == 20 ? 2 : 1;
        var damageRolls = 
            rollDamage(diceMultiplier * attack.numberOfDice, attack.sizeOfDice);
        var damage = damageRolls.reduce((a,b) => a + b) + attack.damageModifier;
        creature.appendChild(
            makeAttack(
                attack.name,
                description, 
                attackRoll, 
                rawAttackRoll, 
                damage, 
                damageRolls));
      }
    }
  }

  formatAttacks();
}

function parseCreatures(input) {
  var creatures = {};
  
  creatures.count = parseInt(matchOrDefault(input, "^[0-9][0-9]*", 1));
  creatures.name =
      matchOrError(input, "[a-zA-Z][a-zA-Z ].*?(?=( WITH | with ))", "name");
  var attacks = matchOrError(input, "(?<=( WITH | with )).*", "attacks");
  if(attacks != null) {
    creatures.attacks = parseAttacks(attacks);
  }
  return creatures;
}

function parseAttacks(input) {
  attacks = input.split(new RegExp(" AND | and "));
  return attacks.map(attack => parseAttack(attack));
}

function parseAttack(input) {
  var attack = {};
  attack.count = parseInt(matchOrDefault(input, "^[ ]*[0-9][0-9]*", 1));
  attack.name = 
      matchOrError(input, "[a-zA-Z][a-zA-Z ].*?(?=( +| -))", "attack name");
  attack.modifier = 
      parseInt(
        matchOrError(
            input, 
            "[\\+|\\-][ ]*[0-9][0-9]*(?=.*[0-9][0-9]*[d])", "attack modifier")
        .replace(/\s/g, ""));
  attack.numberOfDice = 
      parseInt(matchOrError(input, "[0-9]*.?(?=d)", "number of dice"));
  attack.sizeOfDice = 
      parseInt(matchOrError(input, "(?<=d)[0-9]*.*?", "size of dice"));
  attack.damageModifier = 
      parseInt(
        matchOrError(
            input, 
            "(?<=[d][0-9][0-9]*.*)([\\+||\\-][ ]*)[0-9][0-9]*(?!.*(\\+|\\-))", 
            "damage modifier")
        .replace(/\s/g, ""));
  return attack;
}

function matchOrDefault(input, regex, defaultVal) {
  result = input.match(new RegExp(regex));
  if(result == null) {
    return defaultVal;
  }
  return result[0];
}

function matchOrError(input, regex, valueName) {
  result = input.match(new RegExp(regex));
  if(result == null) {
    setError(valueName);
    return null;
  }
  return result[0];
}

function makeCreature(description) {
  var creatureDiv = document.createElement("div");
  creatureDiv.className = "creature";
  creatureDiv.id = "creature";

  var creatureDescriptorDiv = document.createElement("div");
  creatureDescriptorDiv.className = "creatureTitle";
  creatureDescriptorDiv.append(description);
  creatureDiv.appendChild(creatureDescriptorDiv);

  return creatureDiv;
}

function makeAttack(name, description, attackRollVal, rawAttackRollVal, damageVal, rawDamageRolls) {
  var attackDiv = document.createElement("div");
  attackDiv.className = "attack";
  attackDiv.id = "attack";

  var attackName = document.createElement("label");
  attackName.className = "attackName";
  attackName.append(name);
  attackDiv.appendChild(attackName);

  var attackDescription = document.createElement("label");
  attackDescription.className = "attackDescription";
  attackDescription.append(description);
  attackDiv.appendChild(attackDescription);
  
  var attackRollLabel = document.createElement("label");
  attackRollLabel.className = "attackLabel";
  attackRollLabel.append("Attack:")
  attackDiv.appendChild(attackRollLabel);

  var attackRoll = document.createElement("label");
  attackRoll.className = "attackRoll";
  attackRoll.append(attackRollVal);
  attackDiv.appendChild(attackRoll);

  var rawAttackRoll = document.createElement("label");
  rawAttackRoll.className = "rawRollValue";
  rawAttackRoll.append("[" + rawAttackRollVal + "]");
  attackDiv.appendChild(rawAttackRoll);

  var damageLabel = document.createElement("label");
  damageLabel.className = "damageLabel";
  damageLabel.append("Damage:")
  attackDiv.appendChild(damageLabel);

  var damage = document.createElement("label");
  damage.className = "damage";
  damage.append(damageVal);
  attackDiv.appendChild(damage);

  var rawDamage = document.createElement("label");
  rawDamage.className = "rawDamageValue";
  rawDamage.append("[" + rawDamageRolls.reduce((a,b) => a + ", " + b) + "]");
  attackDiv.appendChild(rawDamage);

  return attackDiv;
}

function rollAttack() {
  return Math.floor(Math.random() * 20) + 1;
}

function rollDamage(numDice, sizeDice) {
  var results = [];
  for(d = 0; d < numDice; d++) {
    results.push(Math.floor(Math.random() * sizeDice) + 1);
  }

  return results;
}

function formatAttacks() {
  var threshold = parseInt(document.getElementById("acInput").value);

  var attacks = 
      Array.from(document.getElementsByClassName("attack"));
  attacks = 
      attacks.concat(
           Array.from(document.getElementsByClassName("missedAttack")));

  if(attacks.length == 0) {
    return;
  }

  attacks.forEach(atk => {
    var hitVal = atk.getElementsByClassName("attackRoll")[0].textContent; 
    var rawRoll = 
        matchOrError(
            atk.getElementsByClassName("rawRollValue")[0].textContent, 
            "[0-9][0-9]*", 
            "raw roll value");
    if (rawRoll == 20) {
      atk.className = "critAttack";
    } else if (rawRoll == 1 || hitVal < threshold) {
     atk.className = "missedAttack";
    } else {
      atk.className = "attack";
    }
  });
}


function clearError() {
  errorMsg = null;
  document.getElementById("errorLabel").innerHTML = "";
}

function setError(valueName) {
  errorMsg = "Unable to parse " + valueName + ".";
  document.getElementById("errorLabel").textContent = errorMsg;
}