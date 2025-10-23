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
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 
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
        colorMode(RGB); // 繪製結束後在 draw 函式最下方恢復 RGB
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
    colorMode(HSB, 360, 255, 255, 255); // 全域設置 HSB 模式，方便煙火調色
} 

function draw() { 
    // 1. 繪製半透明黑色背景 (創造拖影效果)
    background(0, 0, 0, 30); 

    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;
    let isPerfectScore = finalScore > 0 && finalScore === maxScore; // 判斷滿分

    // -----------------------------------------------------------------
    // C. 滿分時產生煙火
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
    // D. 更新和顯示煙火（繪製層級一：最下層）
    // -----------------------------------------------------------------
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].display();
        if (fireworks[i].isFinished()) {
            fireworks.splice(i, 1); // 移除已結束的粒子
        }
    }

    // ===============================================================
    // 答題區繪製開始 (確保文字和幾何圖形在煙火粒子上方)
    // ===============================================================

    // 繪製順序：先圖形 (層級二)，後文字 (層級三，最上層)

    // 切換回 RGB 模式
    colorMode(RGB); 
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (繪製層級二：圖形)
    // -----------------------------------------------------------------
    
    if (isPerfectScore) {
        // 滿分時畫一個大圓圈
        fill(255, 255, 0, 150); // 鮮豔黃色 (半透明)
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 90) {
        // 高分時畫一個大圓圈
        fill(0, 200, 50, 150); // 綠色 (半透明)
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 中等分數時畫一個方形
        fill(255, 181, 35, 150); // 黃色 (半透明)
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }

    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (繪製層級三：文字，最上層)
    // -----------------------------------------------------------------

    textSize(80); 
    textAlign(CENTER);

    if (isPerfectScore) {
        // 滿分：顯示鼓勵文本，使用鮮豔黃色
        fill(255, 255, 0); 
        text("滿分！恭喜！完美！", width / 2, height / 2 - 50);

    } else if (percentage >= 90) {
        // 高分：顯示鼓勵文本，使用綠色 
        fill(0, 200, 50); 
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
        text("等待 H5P 成績...", width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(255); // 白色文字在黑色背景上更清晰
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
}
