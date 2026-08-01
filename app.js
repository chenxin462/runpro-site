/* 
 * Keep运动截图拼图 v2.0
 * 核心逻辑文件 app.js
 */

(function() {
    'use strict';

    // ==================== 状态管理 ====================
    const state = {
        // 画布状态
        baseImage: null,
        eraseCanvas: null,
        eraseCtx: null,
        mainCanvas: null,
        mainCtx: null,
        zoom: 1,
        panX: 0,
        panY: 0,

        // 素材状态
        sprites: [],
        selectedSprite: null,
        defaultScale: 100,

        // 交互状态
        isDragging: false,
        isResizing: false,
        isPanning: false,
        isEraseMode: false,
        isErasing: false,

        // 拖拽状态缓存
        dragSpriteId: null,
        dragStartX: 0,
        dragStartY: 0,
        resizeSpriteId: null,
        resizeStartX: 0,
        resizeStartScale: 1,
        panStartX: 0,
        panStartY: 0,

        // 擦除状态
        eraseStartX: 0,
        eraseStartY: 0,
        eraseBox: null,

        // 自定义信息
        showAvatar: false,
        showUsername: false,
        showDatetime: true,
        avatarImage: null,
        username: '',
        date: '',
        time: '12:00',

        // 历史记录
        history: [],
        historyIndex: -1
    };

    // ==================== 素材数据 ====================
    const materials = {
        numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        units: ['km', 'm', 'cal', 'kcal', 'min', 'h', '秒', '步'],
        others: ['小数点', '冒号', '斜杠']
    };

    // ==================== 初始化 ====================
    function init() {
        initCanvas();
        initMaterials();
        initEvents();
        initDatetime();
        updateStatus();
    }

    function initCanvas() {
        const container = document.getElementById('canvasContainer');
        const mainCanvas = document.getElementById('mainCanvas');
        const eraseCanvas = document.getElementById('eraseCanvas');

        if (!container || !mainCanvas || !eraseCanvas) return;

        const rect = container.getBoundingClientRect();
        mainCanvas.width = rect.width;
        mainCanvas.height = rect.height;
        eraseCanvas.width = rect.width;
        eraseCanvas.height = rect.height;

        state.mainCanvas = mainCanvas;
        state.mainCtx = mainCanvas.getContext('2d');
        state.eraseCanvas = eraseCanvas;
        state.eraseCtx = eraseCanvas.getContext('2d');
    }

    function initMaterials() {
        const numberContainer = document.getElementById('numberMaterials');
        const unitContainer = document.getElementById('unitMaterials');
        const otherContainer = document.getElementById('otherMaterials');

        if (!numberContainer || !unitContainer || !otherContainer) return;

        numberContainer.innerHTML = '';
        unitContainer.innerHTML = '';
        otherContainer.innerHTML = '';

        materials.numbers.forEach(num => {
            const item = createMaterialItem(num, 'number');
            numberContainer.appendChild(item);
        });

        materials.units.forEach(unit => {
            const item = createMaterialItem(unit, 'unit');
            unitContainer.appendChild(item);
        });

        materials.others.forEach(other => {
            const item = createMaterialItem(other, 'other');
            otherContainer.appendChild(item);
        });
    }

    function createMaterialItem(text, type) {
        const item = document.createElement('div');
        item.className = 'material-item';
        item.textContent = text;
        item.dataset.type = type;
        item.dataset.value = text;
        item.addEventListener('click', () => window.addSprite(type, text));
        return item;
    }

    function initEvents() {
        const container = document.getElementById('canvasContainer');
        
        // 鼠标事件
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('contextmenu', e => e.preventDefault());

        // 键盘事件
        document.addEventListener('keydown', handleKeyDown);

        // 文件输入
        const baseInput = document.getElementById('baseImageInput');
        const avatarInput = document.getElementById('avatarInput');
        if (baseInput) baseInput.addEventListener('change', handleBaseImageUpload);
        if (avatarInput) avatarInput.addEventListener('change', handleAvatarUpload);

        // 窗口调整
        window.addEventListener('resize', debounce(initCanvas, 200));
    }

    function initDatetime() {
        const dateInput = document.getElementById('dateInput');
        const timeInput = document.getElementById('timeInput');
        const now = new Date();
        
        if (dateInput) dateInput.value = now.toISOString().split('T')[0];
        if (timeInput) timeInput.value = now.toTimeString().slice(0, 5);
        updateDatetime();
    }

    // ==================== 素材操作 ====================
    function addSprite(type, value) {
        const container = document.getElementById('canvasContainer');
        if (!container) return;

        const rect = container.getBoundingClientRect();

        const sprite = {
            id: Date.now(),
            type: type,
            value: value,
            x: rect.width / 2 - 20,
            y: rect.height / 2 - 15,
            width: 40,
            height: 30,
            scale: state.defaultScale / 100
        };

        state.sprites.push(sprite);
        renderSprites();
        selectSprite(sprite.id);
        saveHistory();
    }

    function renderSprites() {
        const layer = document.getElementById('spriteLayer');
        if (!layer) return;
        
        layer.innerHTML = '';

        state.sprites.forEach(sprite => {
            const el = document.createElement('div');
            el.className = 'sprite-element' + (state.selectedSprite === sprite.id ? ' selected' : '');
            el.style.left = sprite.x + 'px';
            el.style.top = sprite.y + 'px';
            el.style.fontWeight = 'bold';
            el.style.color = '#00d4aa';
            el.style.padding = '4px 8px';
            el.style.whiteSpace = 'nowrap';
            el.style.position = 'absolute';
            el.style.cursor = 'move';
            el.style.userSelect = 'none';

            // 根据类型设置内容
            let displayValue = sprite.value;
            if (sprite.type === 'other') {
                displayValue = sprite.value === '小数点' ? '.' :
                               sprite.value === '冒号' ? ':' : '/';
            }
            
            // 动态计算字体大小
            const fontSize = 16 * sprite.scale;
            el.style.fontSize = fontSize + 'px';
            el.textContent = displayValue;

            // 缩放手柄
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            handle.style.position = 'absolute';
            handle.style.right = '-8px';
            handle.style.bottom = '-8px';
            handle.style.width = '16px';
            handle.style.height = '16px';
            handle.style.background = '#00d4aa';
            handle.style.borderRadius = '50%';
            handle.style.cursor = 'se-resize';
            handle.style.opacity = state.selectedSprite === sprite.id ? '1' : '0';
            
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                startResize(sprite.id, e);
            });
            el.appendChild(handle);

            el.addEventListener('mousedown', (e) => {
                if (!state.isEraseMode) {
                    e.stopPropagation();
                    selectSprite(sprite.id);
                    startDrag(sprite.id, e);
                }
            });

            layer.appendChild(el);
            
            // 更新尺寸状态
            sprite.width = el.offsetWidth;
            sprite.height = el.offsetHeight;
        });

        updateUndoButton();
    }

    function selectSprite(id) {
        state.selectedSprite = id;
        renderSprites();

        // 更新缩放显示
        if (id) {
            const sprite = state.sprites.find(s => s.id === id);
            if (sprite) {
                const scaleInput = document.getElementById('scaleInput');
                if (scaleInput) scaleInput.value = Math.round(sprite.scale * 100);
            }
        }
    }

    function startDrag(id, e) {
        const sprite = state.sprites.find(s => s.id === id);
        if (!sprite) return;

        state.isDragging = true;
        state.dragSpriteId = id;
        state.dragStartX = e.clientX - sprite.x;
        state.dragStartY = e.clientY - sprite.y;
        state.dragOriginalX = sprite.x;
        state.dragOriginalY = sprite.y;

        document.getElementById('canvasContainer').classList.add('drag-mode');
    }

    function startResize(id, e) {
        const sprite = state.sprites.find(s => s.id === id);
        if (!sprite) return;

        state.isResizing = true;
        state.resizeSpriteId = id;
        state.resizeStartX = e.clientX;
        state.resizeStartScale = sprite.scale;

        e.preventDefault();
    }

    // ==================== 交互处理 ====================
    function handleMouseDown(e) {
        const container = document.getElementById('canvasContainer');

        if (state.isEraseMode && e.button === 0) {
            const rect = container.getBoundingClientRect();
            state.isErasing = true;
            state.eraseStartX = e.clientX - rect.left;
            state.eraseStartY = e.clientY - rect.top;

            let eraseBox = document.querySelector('.erase-box');
            if (!eraseBox) {
                eraseBox = document.createElement('div');
                eraseBox.className = 'erase-box';
                const canvasArea = document.getElementById('canvasArea');
                if (canvasArea) canvasArea.appendChild(eraseBox);
            }
            state.eraseBox = eraseBox;
        } else if (e.button === 0 && !state.selectedSprite) {
            state.isPanning = true;
            state.panStartX = e.clientX - state.panX;
            state.panStartY = e.clientY - state.panY;
            if (container) container.classList.add('drag-mode');
        }
    }

    function handleMouseMove(e) {
        const container = document.getElementById('canvasContainer');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();

        // 更新坐标显示
        const x = Math.round((e.clientX - rect.left - state.panX) / state.zoom);
        const y = Math.round((e.clientY - rect.top - state.panY) / state.zoom);
        const coordsDisplay = document.getElementById('coordsDisplay');
        if (coordsDisplay) coordsDisplay.textContent = x + ', ' + y;

        if (state.isDragging) {
            const sprite = state.sprites.find(s => s.id === state.dragSpriteId);
            if (sprite) {
                let newX = e.clientX - state.dragStartX;
                let newY = e.clientY - state.dragStartY;

                const alignResult = checkAlignment(sprite, newX, newY);
                if (alignResult.aligned) {
                    newX = alignResult.x;
                    newY = alignResult.y;
                    showAlignHint(alignResult.type);
                } else {
                    hideAlignHint();
                }

                sprite.x = newX;
                sprite.y = newY;
                renderSprites();
            }
        }

        if (state.isResizing) {
            const sprite = state.sprites.find(s => s.id === state.resizeSpriteId);
            if (sprite) {
                const delta = e.clientX - state.resizeStartX;
                const newScale = Math.max(0.1, Math.min(5, state.resizeStartScale + delta * 0.005));
                sprite.scale = newScale;
                const scaleInput = document.getElementById('scaleInput');
                if (scaleInput) scaleInput.value = Math.round(newScale * 100);
                renderSprites();
            }
        }

        if (state.isPanning) {
            state.panX = e.clientX - state.panStartX;
            state.panY = e.clientY - state.panStartY;
            renderCanvas();
        }

        if (state.isErasing && state.eraseBox) {
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            const left = Math.min(state.eraseStartX, currentX);
            const top = Math.min(state.eraseStartY, currentY);
            const width = Math.abs(currentX - state.eraseStartX);
            const height = Math.abs(currentY - state.eraseStartY);

            state.eraseBox.style.left = left + 'px';
            state.eraseBox.style.top = top + 'px';
            state.eraseBox.style.width = width + 'px';
            state.eraseBox.style.height = height + 'px';
        }
    }

    function handleMouseUp(e) {
        const container = document.getElementById('canvasContainer');
        if (container) container.classList.remove('drag-mode');

        if (state.isDragging) {
            state.isDragging = false;
            saveHistory();
        }

        if (state.isResizing) {
            state.isResizing = false;
            saveHistory();
        }

        if (state.isPanning) {
            state.isPanning = false;
        }

        if (state.isErasing && state.eraseBox) {
            const left = parseFloat(state.eraseBox.style.left);
            const top = parseFloat(state.eraseBox.style.top);
            const width = parseFloat(state.eraseBox.style.width);
            const height = parseFloat(state.eraseBox.style.height);

            if (width > 5 && height > 5 && state.eraseCtx) {
                state.eraseCtx.fillStyle = '#ffffff';
                state.eraseCtx.fillRect(
                    (left - state.panX) / state.zoom,
                    (top - state.panY) / state.zoom,
                    width / state.zoom,
                    height / state.zoom
                );
                saveHistory();
            }

            if (state.eraseBox && state.eraseBox.parentNode) {
                state.eraseBox.parentNode.removeChild(state.eraseBox);
            }
            state.eraseBox = null;
            state.isErasing = false;
        }
    }

    function handleWheel(e) {
        if (!state.baseImage) return;

        e.preventDefault();

        const container = document.getElementById('canvasContainer');
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(10, state.zoom * delta));

        state.panX = mouseX - (mouseX - state.panX) * (newZoom / state.zoom);
        state.panY = mouseY - (mouseY - state.panY) * (newZoom / state.zoom);
        state.zoom = newZoom;

        renderCanvas();
        updateStatus();
    }

    function handleKeyDown(e) {
        if (!state.selectedSprite) return;

        const sprite = state.sprites.find(s => s.id === state.selectedSprite);
        if (!sprite) return;

        const step = e.shiftKey ? 10 : 1;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                sprite.x -= step;
                renderSprites();
                break;
            case 'ArrowRight':
                e.preventDefault();
                sprite.x += step;
                renderSprites();
                break;
            case 'ArrowUp':
                e.preventDefault();
                sprite.y -= step;
                renderSprites();
                break;
            case 'ArrowDown':
                e.preventDefault();
                sprite.y += step;
                renderSprites();
                break;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                deleteSprite(state.selectedSprite);
                break;
            case 'Escape':
                e.preventDefault();
                selectSprite(null);
                hideAlignHint();
                break;
            case '+':
            case '=':
                e.preventDefault();
                sprite.scale = Math.min(5, sprite.scale + 0.1);
                const inputP = document.getElementById('scaleInput');
                if (inputP) inputP.value = Math.round(sprite.scale * 100);
                renderSprites();
                break;
            case '-':
                e.preventDefault();
                sprite.scale = Math.max(0.1, sprite.scale - 0.1);
                const inputM = document.getElementById('scaleInput');
                if (inputM) inputM.value = Math.round(sprite.scale * 100);
                renderSprites();
                break;
        }
    }

    // ==================== 对齐检测 ====================
    function checkAlignment(currentSprite, newX, newY) {
        const threshold = 10;
        let result = { aligned: false, x: newX, y: newY, type: '' };

        for (const sprite of state.sprites) {
            if (sprite.id === currentSprite.id) continue;

            const currentWidth = currentSprite.width || 40;
            const currentHeight = currentSprite.height || 30;
            const spriteWidth = sprite.width || 40;
            const spriteHeight = sprite.height || 30;

            if (Math.abs(newX - sprite.x) < threshold) {
                result.aligned = true;
                result.x = sprite.x;
                result.type = 'left';
            }

            if (Math.abs(newX + currentWidth - sprite.x - spriteWidth) < threshold) {
                result.aligned = true;
                result.x = sprite.x + spriteWidth - currentWidth;
                result.type = 'right';
            }

            if (Math.abs(newY - sprite.y) < threshold) {
                result.aligned = true;
                result.y = sprite.y;
                result.type = 'top';
            }

            if (Math.abs(newY + currentHeight - sprite.y - spriteHeight) < threshold) {
                result.aligned = true;
                result.y = sprite.y + spriteHeight - currentHeight;
                result.type = 'bottom';
            }
        }

        return result;
    }

    function showAlignHint(type) {
        const hint = document.getElementById('alignHint');
        if (hint) {
            hint.textContent = '↔ 已对齐';
            hint.classList.add('visible');
        }
    }

    function hideAlignHint() {
        const hint = document.getElementById('alignHint');
        if (hint) hint.classList.remove('visible');
    }

    // ==================== 文件处理 ====================
    function handleBaseImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                state.baseImage = img;
                fitImageToCanvas();
                renderCanvas();
                updateStatus();
                saveHistory();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                state.avatarImage = img;
                renderSprites();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ==================== 画布渲染 ====================
    function fitImageToCanvas() {
        if (!state.baseImage) return;

        const container = document.getElementById('canvasContainer');
        const rect = container.getBoundingClientRect();

        const scaleX = rect.width / state.baseImage.width;
        const scaleY = rect.height / state.baseImage.height;
        state.zoom = Math.min(scaleX, scaleY) * 0.9;

        state.panX = (rect.width - state.baseImage.width * state.zoom) / 2;
        state.panY = (rect.height - state.baseImage.height * state.zoom) / 2;
    }

    function renderCanvas() {
        if (!state.baseImage) return;

        const ctx = state.mainCtx;
        const canvas = state.mainCanvas;
        const container = document.getElementById('canvasContainer');
        const rect = container.getBoundingClientRect();

        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(state.panX, state.panY);
        ctx.scale(state.zoom, state.zoom);
        ctx.drawImage(state.baseImage, 0, 0);
        ctx.restore();

        // 同步擦除层大小
        const eraseCanvas = state.eraseCanvas;
        if (eraseCanvas) {
            eraseCanvas.width = rect.width;
            eraseCanvas.height = rect.height;
        }
    }

    // ==================== 全局功能函数 ====================
    window.uploadBaseImage = function() {
        const input = document.getElementById('baseImageInput');
        if (input) input.click();
    };

    window.uploadAvatar = function() {
        const input = document.getElementById('avatarInput');
        if (input) input.click();
    };

    window.deleteAvatar = function() {
        state.avatarImage = null;
        renderSprites();
    };

    window.toggleEraseMode = function() {
        state.isEraseMode = !state.isEraseMode;
        const btn = document.getElementById('eraseBtn');
        const container = document.getElementById('canvasContainer');

        if (state.isEraseMode) {
            if (btn) btn.classList.add('active');
            if (container) container.classList.add('erase-mode');
        } else {
            if (btn) btn.classList.remove('active');
            if (container) container.classList.remove('erase-mode');
        }
    };

    window.deleteSprite = function(id) {
        state.sprites = state.sprites.filter(s => s.id !== id);
        state.selectedSprite = null;
        renderSprites();
        saveHistory();
    };

    window.adjustScale = function(delta) {
        const input = document.getElementById('scaleInput');
        let value = parseInt(input.value) || 100;
        value = Math.max(10, Math.min(500, value + delta));
        input.value = value;

        if (state.selectedSprite) {
            const sprite = state.sprites.find(s => s.id === state.selectedSprite);
            if (sprite) {
                sprite.scale = value / 100;
                renderSprites();
            }
        }
    };

    window.updateScale = function() {
        const input = document.getElementById('scaleInput');
        let value = parseInt(input.value) || 100;
        value = Math.max(10, Math.min(500, value));
        input.value = value;

        if (state.selectedSprite) {
            const sprite = state.sprites.find(s => s.id === state.selectedSprite);
            if (sprite) {
                sprite.scale = value / 100;
                renderSprites();
            }
        }
    };

    window.setDefaultScale = function() {
        const input = document.getElementById('scaleInput');
        state.defaultScale = parseInt(input.value) || 100;

        // 视觉反馈
        if (event && event.target) {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '已设置!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1500);
        }
    };

    window.toggleSwitch = function(type) {
        const switchEl = document.getElementById(type + 'Switch');
        const optionsEl = document.getElementById(type + 'Options');

        if (type === 'avatar') {
            state.showAvatar = !state.showAvatar;
            if (switchEl) switchEl.classList.toggle('active', state.showAvatar);
            if (optionsEl) optionsEl.classList.toggle('hidden', !state.showAvatar);
        } else if (type === 'username') {
            state.showUsername = !state.showUsername;
            if (switchEl) switchEl.classList.toggle('active', state.showUsername);
            if (optionsEl) optionsEl.classList.toggle('hidden', !state.showUsername);
        } else if (type === 'datetime') {
            state.showDatetime = !state.showDatetime;
            if (switchEl) switchEl.classList.toggle('active', state.showDatetime);
            if (optionsEl) optionsEl.classList.toggle('hidden', !state.showDatetime);
        }

        renderSprites();
    };

    window.updateUsername = function() {
        const input = document.getElementById('usernameInput');
        if (input) state.username = input.value;
        renderSprites();
    };

    window.updateDatetime = function() {
        const dateInput = document.getElementById('dateInput');
        const timeInput = document.getElementById('timeInput');
        if (dateInput) state.date = dateInput.value;
        if (timeInput) state.time = timeInput.value;
        renderSprites();
    };

    window.undo = function() {
        if (state.historyIndex <= 0) return;

        state.historyIndex--;
        const snapshot = state.history[state.historyIndex];

        if (snapshot) {
            state.sprites = JSON.parse(JSON.stringify(snapshot.sprites));
            state.selectedSprite = null;
            renderSprites();
            renderCanvas();
        }

        updateUndoButton();
    };

    window.resetCanvas = function() {
        window.showConfirm('确定要重置画布吗？所有编辑将被清除。', () => {
            state.sprites = [];
            state.selectedSprite = null;
            state.baseImage = null;
            state.zoom = 1;
            state.panX = 0;
            state.panY = 0;
            state.history = [];
            state.historyIndex = -1;

            const container = document.getElementById('canvasContainer');
            const rect = container.getBoundingClientRect();

            if (state.mainCtx) state.mainCtx.clearRect(0, 0, rect.width, rect.height);
            if (state.eraseCtx) state.eraseCtx.clearRect(0, 0, rect.width, rect.height);

            renderSprites();
            updateStatus();
            updateUndoButton();
            window.closeModal('confirmModal');
        });
    };

    window.exportImage = function() {
        if (!state.baseImage) {
            alert('请先上传底图');
            return;
        }

        // 创建导出画布
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = state.baseImage.width;
        exportCanvas.height = state.baseImage.height;
        const ctx = exportCanvas.getContext('2d');

        // 绘制底图
        ctx.drawImage(state.baseImage, 0, 0);

        // 绘制擦除层
        if (state.eraseCanvas) {
            ctx.drawImage(state.eraseCanvas, 0, 0, state.baseImage.width, state.baseImage.height);
        }

        // 绘制素材 (简单的文本绘制示例，实际可能需要更复杂的逻辑)
        // 注意：前端绘制文本到导出图可能需要处理字体加载问题
        // 此处仅演示基本逻辑
        ctx.fillStyle = '#00d4aa';
        ctx.textBaseline = 'top';

        state.sprites.forEach(sprite => {
            let displayValue = sprite.value;
            if (sprite.type === 'other') {
                displayValue = sprite.value === '小数点' ? '.' :
                               sprite.value === '冒号' ? ':' : '/';
            }
            
            const fontSize = 16 * sprite.scale * (state.baseImage.width / state.mainCanvas.width);
            ctx.font = `bold ${fontSize}px Inter`;
            
            // 计算在原图上的位置
            const x = sprite.x * (state.baseImage.width / state.mainCanvas.width);
            const y = sprite.y * (state.baseImage.height / state.mainCanvas.height);
            
            ctx.fillText(displayValue, x, y);
        });

        // 下载
        const link = document.createElement('a');
        link.download = '拼图完成.jpg';
        link.href = exportCanvas.toDataURL('image/jpeg', 0.95);
        link.click();
    };

    // ==================== 历史记录 ====================
    function saveHistory() {
        const snapshot = {
            sprites: JSON.parse(JSON.stringify(state.sprites))
            // 底图和擦除层的历史记录在纯前端大图场景下可能占用大量内存，这里简化处理
        };

        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(snapshot);
        state.historyIndex = state.history.length - 1;

        if (state.history.length > 50) {
            state.history.shift();
            state.historyIndex--;
        }

        updateUndoButton();
    }

    function updateUndoButton() {
        const btn = document.getElementById('undoBtn');
        if (btn) btn.disabled = state.historyIndex <= 0;
    }

    // ==================== 状态更新 ====================
    function updateStatus() {
        const zoomEl = document.getElementById('zoomLevel');
        if (zoomEl) zoomEl.textContent = Math.round(state.zoom * 100) + '%';
    }

    // ==================== 弹窗控制 ====================
    window.showInstructions = function() {
        const modal = document.getElementById('instructionsModal');
        if (modal) modal.classList.add('active');
    };

    window.showConfirm = function(message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.querySelector('#confirmModal p');
        const btn = document.getElementById('confirmBtn');

        if (msgEl) msgEl.textContent = message;
        if (btn) btn.onclick = onConfirm;
        if (modal) modal.classList.add('active');
    };

    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    };

    window.addSprite = addSprite;

    // ==================== 工具函数 ====================
    function debounce(fn, delay) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ==================== 启动 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
