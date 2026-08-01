// 拼图游戏主逻辑
const app = {
    // 游戏配置
    config: {
        // 拼图块数量
        tileCount: 9,
        // 拼图块尺寸
        tileSize: 100,
        // 拼图网格尺寸
        gridSize: 3,
        // 拼图图像URL
        imageUrl: 'https://keepdata.top/images/puzzle.jpg',
        // 拼图图像宽高
        imageWidth: 300,
        imageHeight: 300,
        // 拼图块间距
        tileSpacing: 2,
        // 动画持续时间
        animationDuration: 300,
        // 允许的移动方向
        allowedMoves: ['up', 'down', 'left', 'right']
    },

    // 游戏状态
    state: {
        // 拼图块位置
        tiles: [],
        // 空白块位置
        emptyTile: { row: 2, col: 2 },
        // 游戏是否开始
        isPlaying: false,
        // 移动次数
        moveCount: 0,
        // 游戏是否完成
        isComplete: false,
        // 计时器
        timer: null,
        // 已用时间
        elapsedTime: 0,
        // 最佳成绩
        bestScore: null
    },

    // DOM元素引用
    elements: {
        // 游戏容器
        gameContainer: null,
        // 拼图网格
        puzzleGrid: null,
        // 空白块
        emptyTile: null,
        // 移动次数显示
        moveCountDisplay: null,
        // 计时器显示
        timerDisplay: null,
        // 开始按钮
        startButton: null,
        // 重置按钮
        resetButton: null,
        // 图片上传输入
        imageUpload: null,
        // 图片URL输入
        imageUrlInput: null,
        // 图片URL提交按钮
        imageUrlSubmit: null,
        // 拼图块数量选择
        tileCountSelect: null,
        // 拼图块尺寸选择
        tileSizeSelect: null,
        // 最佳成绩显示
        bestScoreDisplay: null
    },

    // 初始化游戏
    init: function() {
        // 获取DOM元素
        this.elements.gameContainer = document.getElementById('game-container');
        this.elements.puzzleGrid = document.getElementById('puzzle-grid');
        this.elements.moveCountDisplay = document.getElementById('move-count');
        this.elements.timerDisplay = document.getElementById('timer');
        this.elements.startButton = document.getElementById('start-button');
        this.elements.resetButton = document.getElementById('reset-button');
        this.elements.imageUpload = document.getElementById('image-upload');
        this.elements.imageUrlInput = document.getElementById('image-url');
        this.elements.imageUrlSubmit = document.getElementById('image-url-submit');
        this.elements.tileCountSelect = document.getElementById('tile-count');
        this.elements.tileSizeSelect = document.getElementById('tile-size');
        this.elements.bestScoreDisplay = document.getElementById('best-score');

        // 绑定事件监听器
        this.elements.startButton.addEventListener('click', this.startGame.bind(this));
        this.elements.resetButton.addEventListener('click', this.resetGame.bind(this));
        this.elements.imageUpload.addEventListener('change', this.handleImageUpload.bind(this));
        this.elements.imageUrlSubmit.addEventListener('click', this.handleImageUrlSubmit.bind(this));
        this.elements.tileCountSelect.addEventListener('change', this.updateConfig.bind(this));
        this.elements.tileSizeSelect.addEventListener('change', this.updateConfig.bind(this));

        // 从本地存储加载最佳成绩
        this.loadBestScore();

        // 初始化拼图网格
        this.initPuzzleGrid();
    },

    // 初始化拼图网格
    initPuzzleGrid: function() {
        // 清空拼图网格
        this.elements.puzzleGrid.innerHTML = '';

        // 设置拼图网格样式
        this.elements.puzzleGrid.style.gridTemplateColumns = `repeat(${this.config.gridSize}, ${this.config.tileSize}px)`;
        this.elements.puzzleGrid.style.gridTemplateRows = `repeat(${this.config.gridSize}, ${this.config.tileSize}px)`;
        this.elements.puzzleGrid.style.gap = `${this.config.tileSpacing}px`;
        this.elements.puzzleGrid.style.width = `${this.config.gridSize * this.config.tileSize + (this.config.gridSize - 1) * this.config.tileSpacing}px`;
        this.elements.puzzleGrid.style.height = `${this.config.gridSize * this.config.tileSize + (this.config.gridSize - 1) * this.config.tileSpacing}px`;

        // 创建拼图块
        for (let i = 0; i < this.config.tileCount; i++) {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.dataset.index = i;
            tile.style.width = `${this.config.tileSize}px`;
            tile.style.height = `${this.config.tileSize}px`;
            tile.style.backgroundImage = `url(${this.config.imageUrl})`;
            tile.style.backgroundSize = `${this.config.imageWidth}px ${this.config.imageHeight}px`;
            tile.style.backgroundPosition = `${- (i % this.config.gridSize) * this.config.tileSize}px ${- Math.floor(i / this.config.gridSize) * this.config.tileSize}px`;
            tile.style.cursor = 'pointer';

            // 添加点击事件监听器
            tile.addEventListener('click', this.handleTileClick.bind(this));

            // 将拼图块添加到拼图网格
            this.elements.puzzleGrid.appendChild(tile);
        }

        // 初始化拼图块位置
        this.initTiles();
    },

    // 初始化拼图块位置
    initTiles: function() {
        // 创建拼图块位置数组
        this.state.tiles = [];
        for (let i = 0; i < this.config.tileCount; i++) {
            this.state.tiles.push(i);
        }

        // 随机打乱拼图块位置
        this.shuffleTiles();

        // 更新拼图块显示
        this.updateTiles();
    },

    // 随机打乱拼图块位置
    shuffleTiles: function() {
        // 随机打乱拼图块位置
        for (let i = this.state.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.state.tiles[i], this.state.tiles[j]] = [this.state.tiles[j], this.state.tiles[i]];
        }

        // 找到空白块位置
        this.state.emptyTile = { row: 2, col: 2 };
    },

    // 更新拼图块显示
    updateTiles: function() {
        // 获取所有拼图块
        const tiles = this.elements.puzzleGrid.querySelectorAll('.puzzle-tile');

        // 遍历所有拼图块
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const tileIndex = parseInt(tile.dataset.index);
            const position = this.state.tiles[tileIndex];

            // 计算拼图块位置
            const row = Math.floor(position / this.config.gridSize);
            const col = position % this.config.gridSize;

            // 设置拼图块位置
            tile.style.backgroundPosition = `${- col * this.config.tileSize}px ${- row * this.config.tileSize}px`;

            // 如果拼图块是空白块，则隐藏
            if (position === this.config.tileCount - 1) {
                tile.style.display = 'none';
                this.state.emptyTile = { row, col };
            } else {
                tile.style.display = 'block';
            }
        }
    },

    // 处理拼图块点击事件
    handleTileClick: function(event) {
        // 如果游戏未开始，则不处理
        if (!this.state.isPlaying) {
            return;
        }

        // 获取被点击的拼图块
        const tile = event.target;
        const tileIndex = parseInt(tile.dataset.index);
        const position = this.state.tiles[tileIndex];

        // 计算拼图块位置
        const row = Math.floor(position / this.config.gridSize);
        const col = position % this.config.gridSize;

        // 检查拼图块是否可以移动
        if (this.canMoveTile(row, col)) {
            // 移动拼图块
            this.moveTile(tileIndex);

            // 增加移动次数
            this.state.moveCount++;
            this.elements.moveCountDisplay.textContent = this.state.moveCount;

            // 更新拼图块显示
            this.updateTiles();

            // 检查游戏是否完成
            if (this.checkWin()) {
                this.endGame();
            }
        }
    },

    // 检查拼图块是否可以移动
    canMoveTile: function(row, col) {
        // 计算空白块位置
        const emptyRow = this.state.emptyTile.row;
        const emptyCol = this.state.emptyTile.col;

        // 检查拼图块是否与空白块相邻
        return (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
               (col === emptyCol && Math.abs(row - emptyRow) === 1);
    },

    // 移动拼图块
    moveTile: function(tileIndex) {
        // 获取拼图块位置
        const position = this.state.tiles[tileIndex];

        // 将拼图块位置与空白块位置交换
        this.state.tiles[tileIndex] = this.config.tileCount - 1;
        this.state.tiles[this.state.tiles.indexOf(this.config.tileCount - 1)] = position;

        // 更新空白块位置
        const row = Math.floor(position / this.config.gridSize);
        const col = position % this.config.gridSize;
        this.state.emptyTile = { row, col };
    },

    // 检查游戏是否完成
    checkWin: function() {
        // 检查所有拼图块是否在正确位置
        for (let i = 0; i < this.state.tiles.length; i++) {
            if (this.state.tiles[i] !== i) {
                return false;
            }
        }

        return true;
    },

    // 开始游戏
    startGame: function() {
        // 如果游戏已经开始，则不处理
        if (this.state.isPlaying) {
            return;
        }

        // 重置游戏状态
        this.resetGame();

        // 开始游戏
        this.state.isPlaying = true;

        // 开始计时器
        this.startTimer();
    },

    // 重置游戏
    resetGame: function() {
        // 停止计时器
        this.stopTimer();

        // 重置游戏状态
        this.state.isPlaying = false;
        this.state.moveCount = 0;
        this.state.isComplete = false;
        this.state.elapsedTime = 0;

        // 更新显示
        this.elements.moveCountDisplay.textContent = this.state.moveCount;
        this.elements.timerDisplay.textContent = '00:00';

        // 重新初始化拼图块
        this.initTiles();
    },

    // 开始计时器
    startTimer: function() {
        // 开始计时器
        this.state.timer = setInterval(() => {
            // 增加已用时间
            this.state.elapsedTime++;

            // 格式化时间
            const minutes = Math.floor(this.state.elapsedTime / 60);
            const seconds = this.state.elapsedTime % 60;
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // 更新显示
            this.elements.timerDisplay.textContent = formattedTime;
        }, 1000);
    },

    // 停止计时器
    stopTimer: function() {
        // 停止计时器
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    },

    // 结束游戏
    endGame: function() {
        // 停止游戏
        this.state.isPlaying = false;
        this.state.isComplete = true;

        // 停止计时器
        this.stopTimer();

        // 保存最佳成绩
        this.saveBestScore();

        // 显示胜利消息
        alert(`恭喜您完成拼图！用时：${this.elements.timerDisplay.textContent}，移动次数：${this.state.moveCount}`);
    },

    // 保存最佳成绩
    saveBestScore: function() {
        // 如果没有最佳成绩，或者当前成绩更好，则保存
        if (!this.state.bestScore || this.state.elapsedTime < this.state.bestScore.time || (this.state.elapsedTime === this.state.bestScore.time && this.state.moveCount < this.state.bestScore.moves)) {
            this.state.bestScore = {
                time: this.state.elapsedTime,
                moves: this.state.moveCount
            };

            // 保存到本地存储
            localStorage.setItem('bestScore', JSON.stringify(this.state.bestScore));

            // 更新显示
            this.loadBestScore();
        }
    },

    // 加载最佳成绩
    loadBestScore: function() {
        // 从本地存储加载最佳成绩
        const bestScore = localStorage.getItem('bestScore');
        if (bestScore) {
            this.state.bestScore = JSON.parse(bestScore);
            this.elements.bestScoreDisplay.textContent = `最佳成绩：${this.state.bestScore.time}秒，${this.state.bestScore.moves}步`;
        } else {
            this.elements.bestScoreDisplay.textContent = '暂无最佳成绩';
        }
    },

    // 处理图片上传
    handleImageUpload: function(event) {
        // 获取上传的文件
        const file = event.target.files[0];

        // 如果没有文件，则不处理
        if (!file) {
            return;
        }

        // 创建 FileReader 对象
        const reader = new FileReader();

        // 读取文件
        reader.onload = (e) => {
            // 获取图片 URL
            const imageUrl = e.target.result;

            // 更新图片 URL
            this.config.imageUrl = imageUrl;

            // 重新初始化拼图网格
            this.initPuzzleGrid();
        };

        // 读取文件
        reader.readAsDataURL(file);
    },

    // 处理图片 URL 提交
    handleImageUrlSubmit: function() {
        // 获取图片 URL
        const imageUrl = this.elements.imageUrlInput.value;

        // 如果图片 URL 为空，则不处理
        if (!imageUrl) {
            return;
        }

        // 更新图片 URL
        this.config.imageUrl = imageUrl;

        // 重新初始化拼图网格
        this.initPuzzleGrid();
    },

    // 更新配置
    updateConfig: function() {
        // 获取拼图块数量
        const tileCount = parseInt(this.elements.tileCountSelect.value);
        this.config.tileCount = tileCount;
        this.config.gridSize = Math.sqrt(tileCount);

        // 获取拼图块尺寸
        const tileSize = parseInt(this.elements.tileSizeSelect.value);
        this.config.tileSize = tileSize;

        // 重新初始化拼图网格
        this.initPuzzleGrid();
    }
};

// 当 DOM 加载完成后，初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
