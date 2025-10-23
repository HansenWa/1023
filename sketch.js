// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

// 全域變數
let finalScore = 0;
let maxScore = 0;
let scoreText = "";

// 新增全域變數來管理煙火
let fireworks = []; // 存放所有活躍的煙火實例

// 新增一個旗標 (Flag) 來控制畫面是否已啟動
let isCanvasReady = false; 

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
        // 關鍵步驟 2: 收到分數後啟動畫布繪圖
        // ----------------------------------------
        if (!isCanvasReady) {
            isCanvasReady = true;
            loop(); // 啟動 draw() 循環，開始動畫
            console.log("Canvas 已啟動繪圖。");
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
        colorMode(RGB); 
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
    colorMode(HSB, 360, 255, 255, 255); // 全域設置 HSB 模式
    
    //
