var canvas, g;
var characterPosX, characterPosY, characterImage, characterR;
var speed, acceleration;
var enemyPosX, enemyPosY, enemyImage, enemySpeed, enemyR;
var score;
var scene;
var frameCount;
var bound;

// シーンの定義
const Scenes = {
  GameMain: 'GameMain',
  GameOver: 'GameOver',
};

onload = function () {
  // 描画コンテキストの取得
  canvas = document.getElementById("gamecanvas");
  g = canvas.getContext("2d");
  // 初期化
  init();
  // 入力処理の指定
  document.onkeydown = keydown;
  // ゲームループの設定 60FPS
  setInterval("gameloop()", 16);
};

function init() {
  characterPosX = 100;
  characterPosY = 400;
  characterR = 24;
  characterImage = new Image();
  characterImage.src = "./showplayer.png";
  speed = 0;
  acceleration = 0;

  enemyPosX = 600;
  enemyPosY = 400;
  enemyR = 12;
  enemyImage = new Image();
  enemyImage.src = './showenemy.png';
  enemySpeed = 5;

  // ゲーム管理データの初期化
  score = 0;
  scene = Scenes.GameMain;
  bound = false;
  scene = Scenes.GameMain;
}

function keydown(e) {
  speed = -20;
  acceleration = 1.5;
}

function gameloop() {
  update();
  draw();
}

function update() {
  // ゲームプレイ中
  if (scene === Scenes.GameMain) {
    // 自キャラの状態更新
    // characterPosX = characterPosX + 2;
    speed = speed + acceleration;
    characterPosY = characterPosY + speed;
    if (characterPosY > 400) {
      characterPosY = 400;
      speed = 0;
      acceleration = 0;
    };
    // 当たり判定
    var diffX = characterPosX - enemyPosX;
    var diffY = characterPosY - enemyPosY;
    var distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance < characterR + enemyR) {
      // 当たった時の処理
      scene = Scenes.GameOver;
      speed = -20;
      acceleration = 0.5;
      frameCount = 0;
    }

    // ゲームオーバー中
  } else if (scene === Scenes.GameOver) {
    // 自キャラの状態更新
    speed = speed + acceleration;
    characterPosY = characterPosY + speed;

    if (characterPosX < 20 || characterPosX > 460) {
      bound = !bound;
    }
    if (bound) {
      characterPosX = characterPosX + 30;
    } else {
      characterPosX = characterPosX - 30;
    }

    // 敵キャラの状態更新
    enemyPosX += enemySpeed;
  }

  // 敵キャラの状態更新
  enemyPosX -= enemySpeed;
  if (enemyPosX < -100) {
    enemyPosX = 600;
    score += 100;
  };

  // 現在何フレーム目かをカウント
  frameCount++;

}

function draw() {
  g.imageSmoothingEnabled = false;

  // ゲームプレイ中
  if (scene === Scenes.GameMain) {
    // 背景描画
    g.fillStyle = 'rgb(0,0,0)';
    g.fillRect(0, 0, 480, 480);

    //キャラクタ描画
    g.drawImage(
      characterImage,
      characterPosX - characterImage.width / 2,
      characterPosY - characterImage.height / 2
    );

    //敵キャラクタ描画
    g.drawImage(
      enemyImage,
      enemyPosX - enemyImage.width / 2,
      enemyPosY - enemyImage.height / 2
    );

    // スコア描画
    g.fillStyle = 'rgb(255,255,255)';
    g.font = '16pt Arial';
    var scoreLabel = 'SCORE : ' + score;
    var scoreLabelWidth = g.measureText(scoreLabel).width;
    g.fillText(scoreLabel, 460 - scoreLabelWidth, 40);
  } else if (scene === Scenes.GameOver) {
    // 背景描画
    g.fillStyle = 'rgb(0,0,0)';
    g.fillRect(0, 0, 480, 480);

    //キャラクタ描画
    if (frameCount < 120) {
      g.save();
      g.translate(characterPosX,characterPosY);
      g.rotate(((frameCount%30)*Math.PI*2)/30);
      g.drawImage(
        characterImage,
        -characterImage.width/2,
        -characterImage.height/2,
        characterImage.width+frameCount,
        characterImage.height+frameCount
      );
      g.restore();
    }

    // ゲームオーバー表示
    g.fillStyle = 'rgb(255,255,255)';
    g.font = '48pt Arial';
    var scoreLabel = 'GAME OVER';
    var scoreLabelWidth = g.measureText(scoreLabel).width;
    g.fillText(scoreLabel,240-scoreLabelWidth/2,240);
  }
}
