let canvas, g;
let player, enemy, moon, castle;
// let particles;
let score;
let scene;
let frameCount;
let boundx, boundy;
let next;
// シーンの定義
const Scenes = {
  GameMain: 'GameMain',
  GameOver: 'GameOver',
};

onload = function () {
  // 描画コンテキストの取得
  canvas = document.getElementById('gamecanvas');
  g = canvas.getContext('2d');
  // 初期化
  init();
  // 入力処理の指定
  document.onkeydown = keydown;
  document.onkeyup = keyup;
  document.onmousedown = keydown;
  document.onmouseup = keyup;
  document.ontouchstart = keydown;
  document.ontouchend = keyup;
  // ゲームループの設定 60FPS
  setInterval('gameloop()', 16);
};

function init() {
  // 自キャラ初期化
  player = new Player(100, 400, 24, './showplayer.png', 0, 0);

  // 敵キャラ初期化
  enemy = [];
  next = 10;

  // 月
  moon = new Sprite();
  moon.posx = 100;
  moon.posy = 100;
  moon.image = new Image();
  moon.image.src = './showmoon.png';

  // 城
  castle = new Sprite();
  castle.posx = 400;
  castle.posy = 296;
  castle.image = new Image();
  castle.image.src = './showcastle.png';

  // // パーティクル初期化
  // particles = [];

  // ゲーム管理データの初期化
  score = 0;
  frameCount = 0;
  boundx = false;
  scene = Scenes.GameMain;
}

let isKeyDown = false;
function keydown(e) {
  // ゲームプレイ中
  if (scene === Scenes.GameMain) {
    if (player.speed === 0 && !isKeyDown) {
      player.speed = -18;
      player.acceleration = 1.0;
    }
    // ゲームオーバー中
  } else if (scene === Scenes.GameOver) {
    if (frameCount > 60) {
      init();
    }
  }
  isKeyDown = true;
}
function keyup(e) {
  if (player.speed < 0) {
    player.acceleration = 2.5;
  }
  isKeyDown = false;
}

function gameloop() {
  update();
  draw();
}

function update() {
  // ゲームプレイ中
  if (scene === Scenes.GameMain) {
    // 自キャラの状態更新
    player.update();

    // 敵キャラの状態更新
    enemy.forEach((e) => {
      e.update();
      // 端に到達でスコアを増加
      if (e.posx < -100) {
        score += 100;
      }
    });

    // 端に到達した敵キャラを除外
    enemy = enemy.filter((e) => e.posx >= -100);

    // 敵キャラ生成
    if (frameCount === next) {
      generateNextEnemy();
    }

    // 当たり判定
    hitCheck();

    // ゲームオーバー中
  } else if (scene === Scenes.GameOver) {
    // // パーティクルの状態更新
    // particles.forEach((p) => {
    //   p.update();
    // });

    // 自キャラの状態更新(ふっとび)
    player.speed = player.speed + player.acceleration;
    player.posy = player.posy + player.speed;

    if (player.posx < 40 || player.posx > 440) {
      boundx = !boundx;
    }
    if (boundx) {
      player.posx = player.posx + 20;
    } else {
      player.posx = player.posx - 20;
    }



    if (player.posy < 40 || player.posy > 440) {
      boundy = !boundy;
    }
    if (boundy) {
      player.posy = player.posy + 10;
    } else {
      player.posy = player.posy - 10;
    }



    // 敵キャラの状態更新
    enemy.forEach((e) => {
      e.update();
    });
  }

  // 背景の城の位置を動かす
  castle.posx -= 0.25;
  if (castle.posx < -100) castle.posx = 560;

  // 現在何フレーム目かをカウント
  frameCount++;
}

function draw() {
  g.imageSmoothingEnabled = false;

  // ゲームプレイ中
  if (scene === Scenes.GameMain) {
    // 背景描画
    drawBack(g);

    //キャラクタ描画
    player.draw(g);

    //敵キャラクタ描画
    enemy.forEach((e) => {
      e.draw(g);
    });

    // スコア描画
    drawScore(g);

    // ゲームオーバー中
  } else if (scene === Scenes.GameOver) {
    // 背景描画
    drawBack(g);

    // // パーティクル描画
    // particles.forEach((p) => {
    //   p.draw(g);
    // });

    //キャラクタ描画(ふっとび)
    if (frameCount < 120) {
      g.save();
      g.translate(player.posx, player.posy);
      g.rotate(((frameCount % 30) * Math.PI * 2) / 30);
      g.drawImage(
        player.image,
        -player.image.width / 2,
        -player.image.height / 2,
        player.image.width + frameCount,
        player.image.height + frameCount
      );
      g.restore();
    }

    // 敵キャラクタ描画
    enemy.forEach((e) => {
      e.draw(g);
    });

    // スコア描画
    drawScore(g);

    // ゲームオーバー表示
    drawGameOver(g)
  }
}

// 当たり判定
function hitCheck() {
  enemy.forEach((e) => {
    let diffX = player.posx - e.posx;
    let diffY = player.posy - e.posy;
    let distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance < player.r + e.r) {
      // 当たった時の処理
      scene = Scenes.GameOver;
      frameCount = 0;
      player.speed = 0;
      // player.speed = -20;
      player.acceleration = 0;

      // // パーティクル生成
      // for (let i = 0; i < 300; i++) {
      //   particles.push(new Particle(player.posx, player.posy));
      // }
    }
  });
}

// 敵キャラ生成
function generateNextEnemy() {
  let newEnemy = new Enemy(
    600,
    400 - (Math.random() < 0.5 ? 0 : 50),
    12,
    './showenemy.png',
    4 + 5 * Math.random(),
    0
  );
  enemy.push(newEnemy);
  next = Math.floor(frameCount + 30 + 80 * Math.random());
}

// 背景の描画
function drawBack(g) {
  let interval = 16;
  let ratio = 5;
  let center = 240;
  let baseLine = 360;
  // 画面を黒く塗りつぶして初期化する
  g.fillStyle = 'rgb(0,0,0)';
  g.fillRect(0, 0, 480, 480);
  // 月と城を描画する
  moon.draw(g);
  castle.draw(g);
  // 地面のラインアート
  for (let i = 0; i < 480 / interval + 1; i++) {
    let x1 = i * interval - (frameCount % interval);
    let x2 = center + (x1 - center) * ratio;
    g.strokeStyle = '#98660b';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x1, baseLine);
    g.lineTo(x2, 480);
    g.stroke();
  }
}

// スコア描画
function drawScore(g) {
  g.fillStyle = 'rgb(255,255,255)';
  g.font = '16pt Arial';
  let scoreLabel = 'SCORE :' + score;
  let scoreLabelWidth = g.measureText(scoreLabel).width;
  g.fillText(scoreLabel, 460 - scoreLabelWidth, 40);
}

// ゲームオーバー表示
function drawGameOver(g) {
  g.font = 'bold 48pt Arial';
  let scoreLabel = 'GAME OVER';
  let scoreLabelWidth = g.measureText(scoreLabel).width;
  g.fillStyle = 'rgb(255,255,255)';
  g.fillText(scoreLabel, 240 - scoreLabelWidth / 2, 220);
}

// スプライトクラス
class Sprite {
  image = null;
  posx = 0;
  posy = 0;
  speed = 0;
  acceleration = 0;
  r = 0;

  // コンストラクタ
  constructor() { }

  // 状態更新
  update() { }

  // 描画処理
  draw(g) {
    // 画像を描画する
    g.drawImage(
      this.image,
      this.posx - this.image.width / 2,
      this.posy - this.image.height / 2
    );
  }
}

// プレイヤークラス
class Player extends Sprite {
  baseLine = 400;

  constructor(posx, posy, r, imageUrl, speed, acceleration) {
    super();
    this.posx = posx;
    this.posy = posy;
    this.r = r;
    this.image = new Image();
    this.image.src = imageUrl;
    this.speed = speed;
    this.acceleration = acceleration;
  }

  update() {
    // 自キャラの状態更新
    this.speed = this.speed + this.acceleration;
    this.posy = this.posy + this.speed;
    if (this.posy > this.baseLine) {
      this.posy = this.baseLine;
      this.speed = 0;
      this.acceleration = 0;
    }
  }
}

// エネミークラス
class Enemy extends Sprite {
  constructor(posx, posy, r, imageUrl, speed, acceleration) {
    super();
    this.posx = posx;
    this.posy = posy;
    this.r = r;
    this.image = new Image();
    this.image.src = imageUrl;
    this.speed = speed;
    this.acceleration = acceleration;
  }

  update() {
    // 敵キャラの状態更新
    this.posx -= this.speed;
  }
}

// // パーティクルクラス
// class Particle extends Sprite {
//   baseLine = 0;
//   speedy = 0;
//   speedx = 0;

//   constructor(x, y) {
//     super();
//     this.posx = x;
//     this.posy = y;
//     this.baseLine = 420;
//     this.acceleration = 0.5;
//     let angle = (Math.PI * 5) / 4 + (Math.PI / 2) * Math.random();
//     this.speed = 5 + Math.random() * 20;
//     this.speedx = this.speed * Math.cos(angle);
//     this.speedy = this.speed * Math.sin(angle);
//     this.r = 2;
//   }

//   update() {
//     this.speedx *= 0.97;
//     this.speedy += this.acceleration;
//     this.posx += this.speedx - 2;
//     this.posy += this.speedy;
//     if (this.posy > this.baseLine) {
//       this.posy = this.baseLine;
//       this.speedy = this.speedy * -1 * (Math.random() * 0.5 + 0.3);
//     }
//   }

//   draw(g) {
//     g.fillStyle = 'rgb(255,50,50)';
//     g.fillRect(this.posx - this.r, this.posy - this.r, this.r * 2, this.r * 2);
//   }
// }