// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

// 全域變數
let finalScore = 0;
let maxScore = 0;
let scoreText = "";

// 新增全域變數來管理煙火
let fireworks = []; // 存放所有活躍的煙火實例

window.addEventListener('message', function (event) {
    // ...
    const data = event.data;

    if (data && data.type === 'H5P_SCORE_RESULT') {

        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;

        console.log("新的分數已接收:", scoreText);

        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw();
        }
    }
}, false);


// =================================================================
// 新增：煙火粒子類別 (Particle Class)
// -----------------------------------------------------------------

class Particle {
    constructor(x, y, hue) {
        this.pos = createVector(x, y);
        this.lifespan = 255;
        this.hue = hue;
        // 隨機產生一個從中心散開的向量
        this.vel = p5.Vector.random2D();
        this.vel.mult(random(0.5, 5));
        this.acc = createVector(0, 0.05); // 模擬重力
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.lifespan -= 5; // 逐漸消失
    }

    display() {
        colorMode(HSB); // 使用 HSB 模式
        noStroke();
        fill(this.hue, 255, 255, this.lifespan);
        ellipse(this.pos.x, this.pos.y, 4, 4);
        colorMode(RGB); // 恢復 RGB
    }

    isFinished() {
        return this.lifespan < 0;
    }
}


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() {
    createCanvas(windowWidth / 2, windowHeight / 2);
    // 更改 setup 設置，以便 draw 能夠持續執行動畫
    // background(255); 
    // noLoop(); // 移除 noLoop() 讓 draw() 持續執行
    colorMode(HSB, 360, 255, 255, 255); // 全域使用 HSB
}

function draw() {
    // 由於動畫需要持續刷新，所以不能用 background(255)
    // 使用帶透明度的背景來產生拖影效果 (使舊的圖案淡出)
    background(0, 0, 0, 30); // 黑色半透明背景

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;
    let isPerfectScore = finalScore > 0 && finalScore === maxScore; // 判斷滿分

    // -----------------------------------------------------------------
    // C. 新增：滿分時產生煙火
    // -----------------------------------------------------------------
    if (isPerfectScore) {
        // 每 10 幀產生一個新的煙火 (可以調整頻率)
        if (frameCount % 10 === 0) {
            let hue = random(360); // 隨機顏色
            let numParticles = 30; // 粒子數量
            let centerX = random(width / 4, width * 3 / 4); // 限制在中間區域
            let centerY = random(height / 4, height * 3 / 4);

            for (let i = 0; i < numParticles; i++) {
                fireworks.push(new Particle(centerX, centerY, hue));
            }
        }
    }


    // -----------------------------------------------------------------
    // D. 更新和顯示煙火
    // -----------------------------------------------------------------
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].display();
        if (fireworks[i].isFinished()) {
            fireworks.splice(i, 1); // 移除已結束的粒子
        }
    }

    // 將文字顯示放在最上層
    colorMode(RGB); // 恢復 RGB 模式顯示文字
    textSize(80);
    textAlign(CENTER);

    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (isPerfectScore) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(255, 255, 0); // 鮮豔黃色
        text("滿分！恭喜！完美！", width / 2, height / 2 - 50);

    } else if (percentage >= 90) {
        // 高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色
        text("恭喜！優異成績！", width / 2, height / 2 - 50);

    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色
        fill(255, 181, 35);
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);

    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色
        fill(200, 0, 0);
        text("需要加強努力！", width / 2, height / 2 - 50);

    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text("等待 H5P 成績...", width / 2, height / 2); // 更改為更明確的提示
    }

    // 顯示具體分數
    textSize(50);
    fill(255); // 白色文字在黑色背景上更清晰
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);


    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------

    // 由於背景變成黑色，原有的幾何圖形可能需要修改，但為了保留原邏輯，僅作顏色調整
    if (isPerfectScore) {
        // 畫一個大圓圈代表完美
        fill(255, 255, 0, 150); // 鮮豔黃色
        noStroke();
        circle(width / 2, height / 2 + 150, 150);

    } else if (percentage >= 90) {
        // 畫一個大圓圈代表完美
        fill(0, 200, 50, 150); // 綠色
        noStroke();
        circle(width / 2, height / 2 + 150, 150);

    } else if (percentage >= 60) {
        // 畫一個方形
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
}
