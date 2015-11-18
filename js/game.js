// notes: the music of the game might lag due to different browers used 

var username = "";

// load the game to phaesr 
window.onload = function() {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
  window.game = game;
  game.state.add('load', loadState);
  game.state.add('user', userState);
  game.state.add('menu', menuState);
  game.state.add('mole-menu', moleMenuState);
  game.state.add('mole', moleState);
  game.state.add('bat-menu', batMenuState);
  game.state.add('bat', batState);
  game.state.start('load');
};

// set attributes for texts. There are in total 3 different texts and each have a specific name so we can use all 3 respectively later
var textStyle = { font: '32px constantia', fill: 'black'};
var bigTextStyle = { font: '50px constantia', fill: 'pink'};
var medTextStyle= {font:'38px constantia', fill:'black'};

// to start the game 
function startGame(state, level) {
  game.state.states[state].level = level;
  game.state.start(state);
}

// time left 
function prettyTimeLeft(timeLeft) {
  var min = Math.floor(timeLeft / 60);
  var sec = timeLeft % 60;
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  return min + ":" + sec;
}

// to make the text in the center 
function centerText(text) {
  text.x = 400 - text.width / 2;
}

//
function resizeSprite(sprite, size) {
  sprite.width = size[0];
  sprite.height = size[1];
}

var menuAudio;
var clickAudio;
var hitAudio;
var cryAudio;

// load all the images and audios 
var loadState = {
  preload: function() {
    game.load.image('menu', 'assets/main.jpg');
    game.load.image('btn', 'assets/btn.png');
    game.load.image('mole-menu', 'assets/mole-menu.jpg');
    game.load.image('mole-easy', 'assets/mole-easy.jpg');
    game.load.image('mole-expert', 'assets/mole-expert.jpg');
    game.load.image('mole', 'assets/mole.png');
    game.load.image('bat-menu', 'assets/bat-menu.jpg');
    game.load.image('bat-easy', 'assets/bat-easy.jpg');
    game.load.image('bat-expert', 'assets/bat-expert.jpg');
    game.load.image('bat', 'assets/bat.png');
    game.load.image('hammer', 'assets/hammer.png');
    game.load.image('user', 'assets/user.jpg');
    game.load.audio('menu', 'assets/menu.mp3');
    game.load.audio('click', 'assets/click.wav');
    game.load.audio('hit', 'assets/hit.wav');
    game.load.audio('cry', 'assets/cry.wav');
    game.load.audio('bat-bgm', 'assets/bat-bgm.mp3');
    game.load.audio('mole-bgm', 'assets/mole-bgm.wav');
  },
  create: function() {
    game.state.start('user');
  },
};

var userState = {
  create: function() {
    var state = this;
  // the audio will play at the start, and by using true, it will repeat. 
    menuAudio = game.add.audio('menu', 1, true);
    menuAudio.play(undefined, 0, 1, true);
    clickAudio = game.add.audio('click');
    game.add.sprite(0, 0, 'user');
    // by making the button transparent, so the background pic can show. 
    // for user to key in their name 
    var btn = game.add.button(308, 333, 'btn', function() {
      if (username !== "") {
        clickAudio.play();
        game.state.start('menu');
        document.onkeypress = undefined;
      }
    });
    var nameText = game.add.text(0, 263, username, textStyle);
    // the maximum length is 16 characters 
    var maxNameLen = 16;
    centerText(nameText);
    document.onkeypress = function(e) {
      if (nameText.length >= 16) return;
      var ch = String.fromCharCode(e.charCode);
    // username can be numbers and alphabets.
      if (('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ('0' <= ch && ch <='9')) {
        username += ch;
        nameText.setText(username);
        centerText(nameText);
      }
    };
    resizeSprite(btn, [184, 63]);
  },
};


// show the menu on the screen 
var menuState = {
  create: function() {
    var bg = game.add.sprite(0, 0, 'menu');
    //welcome the user 
    var nameText = game.add.text(0, 80, "Hi " + username + " , you are challenged!", textStyle);
    centerText(nameText);

//different sound effects 
    hitAudio = game.add.audio('hit');
    cryAudio = game.add.audio('cry');
    // by making the button transparent, so the background pic can show. 
    // place the mole button at the specific place 
    var moleBtn = game.add.button(160, 368, 'btn', function() {
      // when the button is clicked, the sound for click will be played    
      clickAudio.play();
      // choose difficulty level for mole
      game.state.start('mole-menu');
    }); 
     
    resizeSprite(moleBtn, [200, 66]);

    // place the bat button at the specific place 
    var batBtn = game.add.button(460, 368, 'btn', function() {
      clickAudio.play();
    // choose the difficulty level for bat 
      game.state.start('bat-menu');
    }); 

    resizeSprite(batBtn, [136, 66]);
  },
};

function makeMenuState(gameName) {
  return {
    create: function() {
      game.add.sprite(0, 0, gameName + '-menu');
      var easyBtn = game.add.button(335, 271, 'btn', function() {
        clickAudio.play();
        menuAudio.stop();
        startGame(gameName, 'easy');
      });
      resizeSprite(easyBtn, [153, 52]);
      var expertBtn = game.add.button(335, 331, 'btn', function() {
        menuAudio.stop();
        startGame(gameName, 'expert');
      });
      resizeSprite(expertBtn, [153, 52]);
    },
  };
}

var moleMenuState = makeMenuState('mole');
var batMenuState = makeMenuState('bat');


var gameBase = {
  // easy level properties
  level: 'easy',
  currentLevel: function() {
    return this.levels[this.level];
  },
  create: function() {
    var bg = game.add.sprite(0, 0, this.name + '-' + this.level);
    this.score = 0;
    this.timeLeft = this.currentLevel().time;
    this.scoreText = game.add.text(16, 16, 'Score: 0', textStyle);
    this.timeText = game.add.text(700, 16, prettyTimeLeft(this.timeLeft), textStyle);
    this.counter = 0;
    this.gameEnded = false;
    this.hammers = [];
    this.targets = [];
    this.bgmAudio = game.add.audio(this.bgm, 1, true);
    this.bgmAudio.loopFull();
  },

  update: function() {
    var state = this;
    // the counter will update every frame (1/60 secs)
    state.counter += 1;
  // when the time is up, it is time to create a new target. 
    if (state.gameEnded) {
      if (state.counter % 15 == 12) {
        this.startnewgame.kill();
      } else if (state.counter % 15 == 0) {
        this.startnewgame.revive();
      }
      return;
    }

    var level = state.currentLevel();
// to repeat the function inside. 
    _.each(state.targets, function(m) {
      state.updateTarget(m);
    });

    _.each(state.hammers, function(h) {
      h.update();
    });

   // when the time is up, it is time to create a new target. 
    if (state.counter % level.genInterval == 0 &&
        state.targets.length < level.maxTargets && Math.random() < level.genRate) {
      state.makeTarget();
    }

    // per second update
    if (state.counter % 60 != 0) return;

    // time left = continually reduce one second  
    state.timeLeft -= 1;
    state.timeText.setText(prettyTimeLeft(state.timeLeft));

    // if 0 second left, then the game automatically ends. 
    if (state.timeLeft == 0) {
      state.end();
    }
  },
  end: function() {
    this.bgmAudio.stop();
    this.gameEnded = true;
    // make the target,hammers,timetext, scoretext disappear from the screen 
    _.each(this.targets, function(m) {
      m.sprite.destroy();
    });
    _.each(this.hammers, function(h) {
      h.sprite.destroy();
    });

    this.scoreText.destroy();
    this.timeText.destroy();

    // show new next on the screen
    var gameEndText = game.add.text(0, 100, 'GAME OVER', bigTextStyle);
    centerText(gameEndText);
    var scoreText = game.add.text(0, 200, 'Good Job! Your score is: ' + this.score, medTextStyle);
    centerText(scoreText)
    var startnewgame = game.add.text(0,350,'Click to start a new game...',medTextStyle);
    startnewgame.inputEnabled = true;
    startnewgame.events.onInputDown.add(function() {
      game.state.start('menu');
    });
    this.startnewgame = startnewgame;
    centerText(startnewgame);
  },

  updateTarget: function(target) {
    target.counter += 1;
    if (target.killed) {
      if (target.counter == 35) {
        this.removeTarget(target);
      } else if (target.counter < 25) {
        // makes the target being killed blinks
        if (target.counter % 5 == 4) {
          target.sprite.kill();
        } else if (target.counter % 5 == 0) {
          target.sprite.revive();
        }
      }
    } else {
      this.updateLiveTarget(target);
    }
  },
  hitTarget: function(target) {
    hitAudio.play();
    cryAudio.play();
    setTimeout(function() { cryAudio.stop(); }, 500);
    var state = this;

    var sprite = target.sprite;
    if (sprite.body) {
      // makes the velocity=0, so the mole will not move again. 
      sprite.body.velocity.x = sprite.body.velocity.y = 0;
    }
    target.killed = true;
    target.counter = 0;
    
    // change the coordinations of the hammer so it will hit at the head of the target. 
    var hammerOffset = state.currentLevel().hammerOffset || state.hammerOffset;
    var hammer = game.add.sprite(sprite.x - sprite.width / 2 + hammerOffset[0],
                                 sprite.y + hammerOffset[1],
                                 'hammer');
    resizeSprite(hammer, state.currentLevel().hammerSize || state.hammerSize);
    state.hammers.push({
      sprite: hammer,
      counter: 0,
      update: function() {
        this.counter += 1;
        if (this.counter == 15) {
          this.sprite.destroy();
        //  the hammer will disappear after hit, it will disappear 
          state.hammers = _.without(state.hammers, this);
        }
      },
    });

    state.score += 1;
    state.scoreText.setText('Score: ' + state.score);
  },
  addTarget: function(target, pos) {
    var state = this;
    target.counter = 0;
    target.killed = false;
    var size = state.currentLevel().targetSize;
    var sprite = target.sprite = game.add.sprite(pos[0] + size[0] / 2, pos[1], this.name);
    resizeSprite(sprite, size);
    sprite.inputEnabled = true;
    sprite.events.onInputDown.add(function() {
      state.hitTarget(target);
    });
    // the bat can flip itself horizontally, either fly left or right. 
    sprite.anchor.setTo(.5, 0);
    state.targets.push(target);

    return target;
  },

  // when it slip away or being hited
  removeTarget: function(target) {
    target.sprite.destroy();
    this.targets = _.without(this.targets, target);
  },
};

//Copy all of the properties in the source objects over to the destination object, 
//and return the destination object. It's in-order, so the last source will override properties of the same name in previous arguments.
var moleState = _.extend({
  name: 'mole',
  level: 'easy',
  hammerSize: [60, 60],
  hammerOffset: [30, -25],
  bgm: 'mole-bgm',
  levels: {
    easy: {
      maxTargets: 2,
      genRate: 0.9,
      genInterval: 60,
      time: 10,
      showDuration: 90,
      targetSize: [95, 95],
      holes: [
        [225, 239],
        [336, 239],
        [447, 239],
        [225, 363],
        [336, 363],
        [447, 363],
        [225, 485],
        [336, 485],
        [447, 485],
      ],
    },
    expert: {
      maxTargets: 6,
      genRate: 0.2,
      genInterval: 5,
      time: 20,
      targetSize: [76, 76],
      showDuration: 40,
      holes: [
        [189, 157],
        [279, 157],
        [365, 157],
        [453, 157],
        [539, 157],
        [189, 241],
        [279, 241],
        [365, 241],
        [453, 241],
        [539, 241],
        [189, 327],
        [279, 327],
        [365, 327],
        [453, 327],
        [539, 327],
        [189, 414],
        [279, 414],
        [365, 414],
        [453, 414],
        [539, 414],
        [189, 495],
        [279, 495],
        [365, 495],
        [453, 495],
        [539, 495],
      ],
    },
  },
  makeTarget: function() {
    var state = this;
    var occupiedHoles = _.map(state.targets, function(mole) {
      return mole.hole;
    });
    // availholes (remaining holes) are all the holes - occupied holes
    var availHoles = _.difference(state.currentLevel().holes, occupiedHoles);
    var hole = availHoles[_.random(availHoles.length - 1)];
    var mole = {
      hole: hole,
    };
    this.addTarget(mole, hole);
  },
  updateLiveTarget: function(mole) {
    if (mole.counter == this.currentLevel().showDuration) {
      this.removeTarget(mole);
    }
  },
}, gameBase);

var batState = _.extend({
  name: 'bat',
  hammerSize: [40, 40],
  hammerOffset: [20, -10],
  bgm: 'bat-bgm',
  levels: {
    easy: {
      maxTargets: 2,
      genRate: 0.9,
      genInterval: 30,
      time: 15,
      targetSize: [80, 80],
      genPoints: [
        [622, 61],
        [146, 178],
      ],
      velocity: 100,
      velocityDuration: 180,
    },
    expert: {
      maxTargets: 10,
      genRate: 0.9,
      genInterval: 20,
      time: 30,
      targetSize: [60, 60],
      genPoints: [
        [80, 60],
        [610, 52],
        [359, 151],
        [200, 277],
        [567, 247],
      ],
      velocity: 180,
      velocityDuration: 180,
    },
  },

  makeTarget: function() {
    var state = this;
    var level = this.currentLevel();
    var pos = level.genPoints[_.random(level.genPoints.length - 1)];
    var target = this.addTarget({velocityCounter: 0}, pos);
    game.physics.enable(target.sprite);
  },
  updateLiveTarget: function(bat) {
    var sprite = bat.sprite;
    var level = this.currentLevel();

    //  if the bat move out of the screen, can disapppear
    if (sprite.x < -sprite.width || sprite.y < -sprite.height ||
        sprite.x > game.width + sprite.width || sprite.y > game.height + sprite.height) {
      this.removeTarget(bat);
      return;
    }

    bat.velocityCounter -= 1;



    if (bat.velocityCounter <= 0) {
      var direction = Math.random() * 2 * Math.PI;
      sprite.body.velocity.x = Math.sin(direction) * level.velocity;
      sprite.body.velocity.y = Math.cos(direction) * level.velocity;

      // if the velocity < 0,it flys to the left
      // if the velocity > 0 ,it flys to the right

      if (sprite.body.velocity.x < 0) {
        sprite.scale.x = Math.abs(sprite.scale.x);
      } else {
        sprite.scale.x = -Math.abs(sprite.scale.x);
      }

      // shouldn't fly randomwly, continue in this direction for some time (120 frames)  
      bat.velocityCounter = 120;
    }
  },
}, gameBase);


