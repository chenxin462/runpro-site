/**
 * Keep 运动截图拼图工具 - 核心逻辑
 * 域名: keepdata.top
 */

(function() {
    'use strict';

    // 域名验证（如果不加密，可以先注释掉，或者留着等上线后再用）
    // const currentDomain = window.location.hostname;
    // if (currentDomain !== 'keepdata.top' && currentDomain !== 'localhost' && currentDomain !== '') {
    //     // 开发测试时可以先注释掉下面这行，上线后打开
    //     // document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">请在 keepdata.top 域名下运行</h1>';
    //     // throw new Error('Domain validation failed');
    // }

    // --- 全局状态 ---
    const state = {
        canvas: null,
        ctx: null,
        stage: null,
        bgImage: null, // 底图
        objects: [],   // 所有素材对象
        selectedId: null, // 当前选中的素材ID
        isDragging: false,
        dragStart: { x: 0, y: 0 },
        panOffset: { x: 0, y: 0 }, // 画布平移
        scale: 1, // 画布缩放
        isErasing: false, // 是否处于擦除模式
        isPanning: false, // 是否正在拖拽画布空白处
        lastMouse: { x: 0, y: 0 },
        history: [], // 撤销栈
        maxHistory: 20,
        materials: [], // 素材数据
        defaultScale: 1.0, // 后续素材默认缩放
        avatarImage: null,
        eraserStart: null // 擦除框选起始点
    };

    // --- 配置 ---
    const CONFIG = {
        canvasWidth: 800,
        canvasHeight: 600,
        snapThreshold: 10, // 吸附阈值
        minScale: 0.2,
        maxScale: 3.0
    };

    // --- 素材库定义 ---
    const MATERIALS_DATA = [
        // 数字
        { type: 'text', label: '1', content: '1', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '2', content: '2', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '3', content: '3', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '4', content: '4', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '5', content: '5', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '6', content: '6', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '7', content: '7', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '8', content: '8', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '9', content: '9', font: 'bold 80px Arial', color: '#333' },
        { type: 'text', label: '10', content: '10', font: 'bold 80px Arial', color: '#333' },
        
        // 单位
        { type: 'text', label: 'km', content: 'km', font: 'bold 50px Arial', color: '#666' },
        { type: 'text', label: 'kcal', content: 'kcal', font: 'bold 50px Arial', color: '#666' },
        { type: 'text', label: 'min', content: 'min', font: 'bold 50px Arial', color: '#666' },
        { type: 'text', label: '次', content: '次', font: 'bold 50px Arial', color: '#666' },
        { type: 'text', label: '配速', content: "配速\n5'30''", font: 'bold 40px Arial', color: '#333', lineHeight: 1.2 },
        
        // 装饰
        { type: 'text', label: 'Keep', content: 'Keep', font: 'bold 60px Arial', color: '#00C853' },
        { type: 'rect', label: '背景块', width: 100, height: 100, color: 'rgba(255,255,255,0.8)' }
    ];

    // --- 初始化 ---
    function init() {
        // 1. 初始化画布
        state.canvas = document.getElementById('main-canvas');
        state.ctx = state.canvas.getContext('2d');
        state.stage = document.getElementById('canvas-stage');

        // 2. 渲染素材面板
        renderMaterialsPanel();

        // 3. 绑定事件
        bindEvents();

        // 4. 初始绘制
        draw();
        
        showToast('欢迎使用！请先上传底图。', 'info');
    }

    // --- 渲染素材面板 ---
    function renderMaterialsPanel() {
        const panel = document.getElementById('materials-panel');
        if (!panel) return;

        const grid = document.createElement('div');
        grid.className = 'materials-grid';

        MATERIALS_DATA.forEach(mat => {
            const item = document.createElement('div');
            item.className = 'material-item';
            item.innerHTML = `
                ${mat.type === 'text' ? `<span style="font:${mat.font};color:${mat.color}">${mat.content}</span>` : ''}
                ${mat.type === 'rect' ? `<div style="width:30px;height:30px;background:${mat.color};border:1px solid #ccc;"></div>` : ''}
                <div class="label">${mat.label}</div>
            `;
            item.onclick = () => addMaterial(mat);
            grid.appendChild(item);
        });

        const title = document.createElement('h3');
        title.className = 'section-title';
        title.textContent = '素材库';
        
        panel.appendChild(title);
        panel.appendChild(grid);
    }

    // --- 添加素材 ---
    function addMaterial(mat) {
        if (!state.bgImage) {
            showToast('请先上传底图', 'error');
            return;
        }

        const id = Date.now().toString();
        const newObj = {
            id: id,
            type: mat.type,
            content: mat.content,
            x: (state.canvas.width / 2) - (100 / state.scale), // 初始居中
            y: (state.canvas.height / 2) - (50 / state.scale),
            width: 100, 
            height: 100,
            rotation: 0,
            scale: state.defaultScale, // 使用当前默认缩放
            ...mat
        };

        // 如果是文本，测量宽度
        if (mat.type === 'text') {
            state.ctx.font = mat.font;
            const metrics = state.ctx.measureText(mat.content);
            newObj.width = metrics.width;
            newObj.height = parseInt(mat.font, 10); // 估算高度
        }

        state.objects.push(newObj);
        saveHistory();
        draw();
        
        // 自动选中
        selectObject(id);
    }

    // --- 核心绘制循环 ---
    function draw() {
        const { ctx, canvas, bgImage, objects, panOffset, scale } = state;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制底图
        if (bgImage) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#eee';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 绘制所有素材
        objects.forEach(obj => {
            ctx.save();
            ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
            ctx.scale(obj.scale, obj.scale);
            ctx.rotate((obj.rotation * Math.PI) / 180);
            ctx.translate(-(obj.width / 2), -(obj.height / 2));

            if (obj.type === 'text') {
                ctx.font = obj.font;
                ctx.fillStyle = obj.color;
                ctx.textBaseline = 'top';
                if (obj.lineHeight) {
                    const lines = obj.content.split('\n');
                    lines.forEach((line, i) => {
                        ctx.fillText(line, 0, i * (obj.height * obj.lineHeight));
                    });
                } else {
                    ctx.fillText(obj.content, 0, 0);
                }
            } else if (obj.type === 'rect') {
                ctx.fillStyle = obj.color;
                ctx.fillRect(0, 0, obj.width, obj.height);
            } else if (obj.type === 'image') {
                ctx.drawImage(obj.img, 0, 0, obj.width, obj.height);
            }

            // 选中态边框
            if (state.selectedId === obj.id) {
                ctx.strokeStyle = '#00C853';
                ctx.lineWidth = 2 / obj.scale;
                ctx.strokeRect(-5/obj.scale, -5/obj.scale, obj.width + 10/obj.scale, obj.height + 10/obj.scale);
                
                // 绘制右下角缩放手柄
                ctx.fillStyle = '#00C853';
                ctx.beginPath();
                ctx.arc(obj.width + 5/obj.scale, obj.height + 5/obj.scale, 8 / obj.scale, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        // 绘制自定义信息（头像、用户名、时间）
        drawOverlays();

        // 绘制擦除框选
        if (state.isErasing && state.eraserStart && state.lastMouse) {
            ctx.strokeStyle = '#F44336';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            const w = state.lastMouse.x - state.eraserStart.x;
            const h = state.lastMouse.y - state.eraserStart.y;
            ctx.strokeRect(state.eraserStart.x, state.eraserStart.y, w, h);
            ctx.setLineDash([]);
            
            // 半透明遮罩
            ctx.fillStyle = 'rgba(244, 67, 54, 0.2)';
            ctx.fillRect(state.eraserStart.x, state.eraserStart.y, w, h);
        }

        // 更新舞台变换（用于CSS显示）
        state.stage.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`;
        
        // 更新状态栏
        document.getElementById('status-zoom').innerText = Math.round(scale * 100) + '%';
        document.getElementById('status-coord').innerText = `${Math.round(-panOffset.x)}, ${Math.round(-panOffset.y)}`;
        document.getElementById('canvas-info-text').innerText = bgImage 
            ? `底图已加载 | 缩放: ${Math.round(scale*100)}%` 
            : '未加载底图 | 滚轮缩放 | 拖动空白处平移';
    }

    // --- 绘制自定义图层 ---
    function drawOverlays() {
        const { ctx, canvas } = state;
        
        // 1. 头像
        if (state.showAvatar && state.avatarImage) {
            const avatarObj = state.objects.find(o => o.isAvatar);
            if (!avatarObj) {
                // 如果没添加过，自动添加一个
                const id = 'avatar_' + Date.now();
                state.objects.push({
                    id, type: 'image', isAvatar: true,
                    img: state.avatarImage,
                    x: 50, y: 50,
                    width: 80, height: 80, scale: 1, rotation: 0
                });
            } else {
                // 更新图片（如果用户换了）
                avatarObj.img = state.avatarImage;
            }
        } else {
            // 如果关闭显示，移除
            state.objects = state.objects.filter(o => !o.isAvatar);
        }

        // 2. 用户名
        if (state.showUsername) {
            const nameObj = state.objects.find(o => o.isUsername);
            const text = document.getElementById('username-input').value;
            if (!nameObj) {
                state.objects.push({
                    id: 'username_' + Date.now(), type: 'text', isUsername: true,
                    content: text,
                    font: 'bold 24px "Noto Sans SC"',
                    color: '#333',
                    x: 140, y: 50,
                    width: 150, height: 30, scale: 1, rotation: 0
                });
            } else {
                nameObj.content = text;
            }
        } else {
            state.objects = state.objects.filter(o => !o.isUsername);
        }

        // 3. 日期时间
        if (state.showDatetime) {
            const dateObj = state.objects.find(o => o.isDatetime);
            const y = document.getElementById('year-input').value;
            const m = document.getElementById('month-input').value;
            const d = document.getElementById('day-input').value;
            const t1 = document.getElementById('start-time').value;
            const t2 = document.getElementById('end-time').value;
            const text = `${y}-${m}-${d} ${t1}-${t2}`;

            if (!dateObj) {
                state.objects.push({
                    id: 'datetime_' + Date.now(), type: 'text', isDatetime: true,
                    content: text,
                    font: '20px "Noto Sans SC"',
                    color: '#666',
                    x: 50, y: 140,
                    width: 300, height: 30, scale: 1, rotation: 0
                });
            } else {
                dateObj.content = text;
            }
        } else {
            state.objects = state.objects.filter(o => !o.isDatetime);
        }
    }

    // --- 事件绑定 ---
    function bindEvents() {
        const c = state.canvas;

        // 鼠标按下
        c.addEventListener('mousedown', (e) => {
            const pos = getMousePos(e);
            
            // 1. 擦除模式
            if (state.isErasing) {
                state.eraserStart = pos;
                return;
            }

            // 2. 检查是否点击了缩放手柄 (仅当选中物体时)
            if (state.selectedId) {
                const obj = state.objects.find(o => o.id === state.selectedId);
                if (obj && isHitHandle(pos, obj)) {
                    state.isResizing = true;
                    return;
                }
            }

            // 3. 命中测试 (素材)
            const hitObj = hitTest(pos.x, pos.y);
            if (hitObj) {
                selectObject(hitObj.id);
                state.isDragging = true;
                state.dragStart = { x: pos.x - hitObj.x, y: pos.y - hitObj.y };
                // 移动到顶层
                state.objects = state.objects.filter(o => o.id !== hitObj.id);
                state.objects.push(hitObj);
                draw();
            } else {
                // 点击空白处 -> 平移画布 或 取消选中
                if (e.shiftKey) {
                    // Shift+点击不做处理
                } else {
                    selectObject(null); // 取消选中
                    state.isPanning = true;
                    state.lastMouse = { x: e.clientX, y: e.clientY };
                }
            }
        });

        // 鼠标移动
        window.addEventListener('mousemove', (e) => {
            const pos = getMousePos(e);
            
            // 改变光标
            if (state.isErasing) {
                c.style.cursor = 'crosshair';
            } else if (state.isResizing) {
                c.style.cursor = 'nwse-resize';
            } else if (hitTest(pos.x, pos.y)) {
                c.style.cursor = 'move';
            } else {
                c.style.cursor = 'default';
            }

            // 1. 擦除框选
            if (state.isErasing && state.eraserStart) {
                state.lastMouse = pos;
                draw();
                return;
            }

            // 2. 调整大小
            if (state.isResizing && state.selectedId) {
                const obj = state.objects.find(o => o.id === state.selectedId);
                if (obj) {
                    // 简单等比缩放逻辑
                    const dx = pos.x - (obj.x + obj.width * obj.scale); // 简化计算，实际中心缩放更好
                    // 计算新的 scale
                    const newScale = Math.max(0.1, obj.scale + (e.movementX * 0.01));
                    obj.scale = newScale;
                    
                    // 更新UI输入框
                    document.getElementById('scale-input').value = Math.round(newScale * 100);
                    
                    draw();
                }
                return;
            }

            // 3. 拖拽素材
            if (state.isDragging && state.selectedId) {
                const obj = state.objects.find(o => o.id === state.selectedId);
                if (obj) {
                    let newX = pos.x - state.dragStart.x;
                    let newY = pos.y - state.dragStart.y;

                    // 吸附逻辑 (非Shift时)
                    if (!e.shiftKey) {
                        const snap = checkSnap(obj, newX, newY);
                        if (snap.x !== null) newX = snap.x;
                        if (snap.y !== null) {
                            newY = snap.y;
                            showAlignHint();
                        } else {
                            hideAlignHint();
                        }
                    }

                    obj.x = newX;
                    obj.y = newY;
                    draw();
                }
                return;
            }

            // 4. 平移画布
            if (state.isPanning) {
                const dx = e.clientX - state.lastMouse.x;
                const dy = e.clientY - state.lastMouse.y;
                state.panOffset.x += dx;
                state.panOffset.y += dy;
                state.lastMouse = { x: e.clientX, y: e.clientY };
                draw();
            }
        });

        // 鼠标松开
        window.addEventListener('mouseup', () => {
            if (state.isErasing && state.eraserStart && state.lastMouse) {
                // 执行擦除
                performErase(state.eraserStart, state.lastMouse);
            }

            if (state.isDragging || state.isResizing) {
                saveHistory();
            }

            state.isDragging = false;
            state.isPanning = false;
            state.isResizing = false;
            state.eraserStart = null;
            draw();
        });

        // 滚轮缩放
        c.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            let newScale = state.scale * delta;
            newScale = Math.max(CONFIG.minScale, Math.min(CONFIG.maxScale, newScale));
            
            // 以鼠标为中心缩放 (简化：以画布中心)
            state.scale = newScale;
            draw();
        }, { passive: false });

        // 键盘快捷键
        window.addEventListener('keydown', (e) => {
            if (!state.selectedId) return;
            const obj = state.objects.find(o => o.id === state.selectedId);
            if (!obj) return;

            const step = e.shiftKey ? 10 : 1;
            switch(e.key) {
                case 'ArrowUp': obj.y -= step; break;
                case 'ArrowDown': obj.y += step; break;
                case 'ArrowLeft': obj.x -= step; break;
                case 'ArrowRight': obj.x += step; break;
                case 'Delete': 
                case 'Backspace':
                    deleteObject();
                    break;
                case 'Escape':
                    if (state.isErasing) toggleEraser();
                    selectObject(null);
                    break;
                case '+':
                case '=':
                    obj.scale += 0.1;
                    document.getElementById('scale-input').value = Math.round(obj.scale * 100);
                    break;
                case '-':
                    obj.scale = Math.max(0.1, obj.scale - 0.1);
                    document.getElementById('scale-input').value = Math.round(obj.scale * 100);
                    break;
                default: return;
            }
            e.preventDefault();
            draw();
        });

        // 按钮事件
        document.getElementById('upload-btn').onclick = () => document.getElementById('file-input').click();
        document.getElementById('file-input').onchange = handleImageUpload;
        
        document.getElementById('export-btn').onclick = exportImage;
        document.getElementById('reset-btn').onclick = resetCanvas;
        document.getElementById('undo-btn').onclick = undo;

        // 缩放控制
        document.getElementById('zoom-in').onclick = () => {
            state.scale = Math.min(CONFIG.maxScale, state.scale * 1.1);
            draw();
        };
        document.getElementById('zoom-out').onclick = () => {
            state.scale = Math.max(CONFIG.minScale, state.scale * 0.9);
            draw();
        };
        document.getElementById('zoom-fit').onclick = () => {
            state.scale = 1;
            state.panOffset = {x:0, y:0};
            draw();
        };

        // 擦除按钮
        document.getElementById('erase-btn').onclick = toggleEraser;

        // 比例设置
        const scaleInput = document.getElementById('scale-input');
        scaleInput.onchange = (e) => {
            const val = parseFloat(e.target.value) / 100;
            if (state.selectedId) {
                const obj = state.objects.find(o => o.id === state.selectedId);
                if (obj) obj.scale = val;
            } else {
                state.defaultScale = val;
                showToast(`后续素材默认缩放已设为 ${e.target.value}%`, 'success');
            }
            draw();
        };
        
        document.getElementById('set-default-scale').onclick = () => {
             if (state.selectedId) {
                const obj = state.objects.find(o => o.id === state.selectedId);
                state.defaultScale = obj.scale;
                document.getElementById('scale-input').value = Math.round(obj.scale * 100);
                showToast(`默认比例已更新为当前选中素材的比例`, 'success');
             }
        };

        // 自定义信息开关
        setupToggle('show-avatar', 'avatar-tag', 'avatar-control', (val) => state.showAvatar = val);
        setupToggle('show-username', 'username-tag', 'username-control', (val) => state.showUsername = val);
        setupToggle('show-datetime', 'datetime-tag', 'datetime-control', (val) => state.showDatetime = val);

        // 头像上传
        document.getElementById('upload-avatar-btn').onclick = () => document.getElementById('avatar-input').click();
        document.getElementById('avatar-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    state.avatarImage = new Image();
                    state.avatarImage.onload = () => {
                        document.getElementById('avatar-preview').style.backgroundImage = `url(${evt.target.result})`;
                        document.getElementById('avatar-preview').classList.add('has-image');
                        draw();
                    };
                    state.avatarImage.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        
        // 帮助弹窗
        document.getElementById('help-btn').onclick = () => {
            document.getElementById('help-modal-mask').classList.add('visible');
        };
        document.getElementById('help-modal-close').onclick = () => {
            document.getElementById('help-modal-mask').classList.remove('visible');
        };
    }

    // --- 辅助功能函数 ---

    function setupToggle(checkboxId, tagId, controlId, callback) {
        const cb = document.getElementById(checkboxId);
        const tag = document.getElementById(tagId);
        const ctrl = document.getElementById(controlId);
        
        cb.onchange = (e) => {
            const val = e.target.checked;
            tag.textContent = val ? '开' : '关';
            tag.className = val ? 'tag on' : 'tag';
            ctrl.classList.toggle('hidden', !val);
            callback(val);
            draw();
        };
    }

    function getMousePos(evt) {
        const rect = state.canvas.getBoundingClientRect();
        const x = (evt.clientX - rect.left) / state.scale - state.panOffset.x / state.scale;
        const y = (evt.clientY - rect.top) / state.scale - state.panOffset.y / state.scale;
        return { x, y };
    }

    function hitTest(x, y) {
        // 倒序遍历（从最上层开始）
        for (let i = state.objects.length - 1; i >= 0; i--) {
            const obj = state.objects[i];
            // 简单矩形碰撞
            if (x >= obj.x && x <= obj.x + obj.width * obj.scale &&
                y >= obj.y && y <= obj.y + obj.height * obj.scale) {
                return obj;
            }
        }
        return null;
    }
    
    function isHitHandle(pos, obj) {
        const handleX = obj.x + obj.width * obj.scale;
        const handleY = obj.y + obj.height * obj.scale;
        const radius = 15 / obj.scale; // 增加点击范围
        return Math.abs(pos.x - handleX) < radius && Math.abs(pos.y - handleY) < radius;
    }

    function selectObject(id) {
        state.selectedId = id;
        
        // 更新缩放输入框
        if (id) {
            const obj = state.objects.find(o => o.id === id);
            if (obj) {
                document.getElementById('scale-input').value = Math.round(obj.scale * 100);
            }
        }
        draw();
    }

    function checkSnap(obj, tx, ty) {
        let snapX = null, snapY = null;
        state.objects.forEach(other => {
            if (other.id === obj.id) return;
            
            // 检查左对齐、右对齐、中心对齐
            const xTargets = [other.x, other.x + other.width * other.scale, other.x + (other.width * other.scale)/2];
            const myX = [tx, tx + obj.width * obj.scale, tx + (obj.width * obj.scale)/2];
            
            xTargets.forEach(txTarget => {
                myX.forEach(mx => {
                    if (Math.abs(mx - txTarget) < CONFIG.snapThreshold) {
                        snapX = tx + (txTarget - mx);
                    }
                });
            });

            // Y轴同理
            const yTargets = [other.y, other.y + other.height * other.scale, other.y + (other.height * other.scale)/2];
            const myY = [ty, ty + obj.height * obj.scale, ty + (obj.height * obj.scale)/2];
            
            yTargets.forEach(tyTarget => {
                myY.forEach(my => {
                    if (Math.abs(my - tyTarget) < CONFIG.snapThreshold) {
                        snapY = ty + (tyTarget - my);
                    }
                });
            });
        });
        return { x: snapX, y: snapY };
    }

    function showAlignHint() {
        const hint = document.getElementById('align-hint');
        if (hint) hint.classList.add('visible');
    }
    function hideAlignHint() {
        const hint = document.getElementById('align-hint');
        if (hint) hint.classList.remove('visible');
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
                state.bgImage = img;
                // 调整画布大小适应图片（可选，这里保持固定800x600或调整）
                // state.canvas.width = img.width;
                // state.canvas.height = img.height;
                
                document.getElementById('canvas-empty').style.display = 'none';
                draw();
                showToast('底图上传成功', 'success');
                saveHistory();
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    }

    function toggleEraser() {
        state.isErasing = !state.isErasing;
        const btn = document.getElementById('erase-btn');
        if (state.isErasing) {
            btn.classList.add('active');
            document.body.style.cursor = 'crosshair';
            showToast('已进入擦除模式，框选区域以擦除', 'info');
        } else {
            btn.classList.remove('active');
            document.body.style.cursor = 'default';
            draw();
        }
    }

    function performErase(start, end) {
        if (!state.bgImage) return;
        
        // 计算矩形区域
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const w = Math.abs(end.x - start.x);
        const h = Math.abs(end.y - start.y);

        if (w < 5 || h < 5) return; // 太小不擦除

        // 关键：直接修改底图数据是不行的（canvas pattern等），
        // 简单方法：我们在底图上画一个白色矩形，但这会“遮挡”。
        // 需求是“擦除”，通常指变透明或变白。这里我们假设变白（像涂改液）。
        // 如果要永久修改底图，需要用 putImageData，但这里简单处理：
        // 创建一个“白色块”素材放在最底层，或者直接修改 bgImage 所有的像素。
        // 最简单且符合工具逻辑的：将“白色块”加入对象列表，位置固定在 0,0，但只能被擦除区域...
        // 不，最直接的方法是：直接在 Canvas 上画白，并保存到一个离屏 canvas 作为新的 bgImage。
        
        // 1. 创建离屏 Canvas 绘制当前状态
        const offCanvas = document.createElement('canvas');
        offCanvas.width = state.canvas.width;
        offCanvas.height = state.canvas.height;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(state.bgImage, 0, 0);
        
        // 2. 在离屏 Canvas 上画白块
        offCtx.fillStyle = '#FFFFFF';
        offCtx.fillRect(x, y, w, h);
        
        // 3. 更新 bgImage
        const newImg = new Image();
        newImg.onload = () => {
            state.bgImage = newImg;
            saveHistory();
            draw();
            showToast('区域已擦除', 'success');
        };
        newImg.src = offCanvas.toDataURL();
    }

    function deleteObject() {
        if (state.selectedId) {
            state.objects = state.objects.filter(o => o.id !== state.selectedId);
            selectObject(null);
            saveHistory();
            draw();
        }
    }

    function resetCanvas() {
        if (confirm('确定要清空所有内容吗？')) {
            state.objects = [];
            state.bgImage = null;
            state.panOffset = {x:0, y:0};
            state.scale = 1;
            document.getElementById('canvas-empty').style.display = 'block';
            selectObject(null);
            draw();
            saveHistory();
        }
    }

    function exportImage() {
        if (!state.bgImage) {
            showToast('没有可导出的内容', 'error');
            return;
        }
        
        // 取消选中框再导出
        const currentSelect = state.selectedId;
        selectObject(null);
        draw();

        // 导出
        const link = document.createElement('a');
        link.download = '拼图完成.jpg';
        link.href = state.canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        // 恢复选中
        if (currentSelect) selectObject(currentSelect);
        draw();
        showToast('图片已导出', 'success');
    }

    function saveHistory() {
        // 简单的历史记录：只记录 objects 数组的深拷贝（忽略 img 对象的复杂复制，实际生产需优化）
        // 这里为了演示简单，不做复杂的状态序列化。
        // 仅仅记录操作次数用于撤销示意。
        // 如果要真正实现撤销，需要序列化 objects。
    }
    
    function undo() {
        showToast('撤销功能暂未实现完整', 'info');
    }

    function showToast(msg, type = 'info') {
        const toast = document.getElementById('toast');
        const text = document.getElementById('toast-msg');
        const icon = toast.querySelector('i');
        
        text.textContent = msg;
        toast.className = `toast visible ${type}`;
        
        if (type === 'success') {
            icon.className = 'fa-solid fa-circle-check';
        } else if (type === 'error') {
            icon.className = 'fa-solid fa-circle-xmark';
        } else {
            icon.className = 'fa-solid fa-circle-info';
        }

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // 启动
    window.onload = init;

})();
