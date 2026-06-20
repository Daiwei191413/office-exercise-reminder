/**
 * 运动小助手 — 白领久坐监督器
 * 核心逻辑模块
 */

// ==================== 运动动作库 ====================
const EXERCISES = [
    {
        id: 'neck-rotate',
        name: '颈部左右转动',
        desc: '放松颈部肌肉，缓解颈椎压力',
        duration: 30,
        icon: 'headphones',
        steps: [
            '坐直，肩膀放松下沉',
            '缓慢将头向右侧转动，保持 3 秒',
            '回到正中，再向左侧转动，保持 3 秒',
            '重复转动，感受颈部拉伸'
        ]
    },
    {
        id: 'shoulder-roll',
        name: '肩膀环绕运动',
        desc: '打开紧绷的肩颈，改善圆肩',
        duration: 30,
        icon: 'rotate-cw',
        steps: [
            '双肩向上耸起，靠近耳朵',
            '向后画圈，肩胛骨向内收拢',
            '再向下放松，回到原位',
            '向前画圈，重复 5-8 次'
        ]
    },
    {
        id: 'eye-rest',
        name: '眼部放松操',
        desc: '缓解视疲劳，保护视力',
        duration: 45,
        icon: 'eye',
        steps: [
            '闭眼 5 秒，让眼球充分休息',
            '用力眨眼 10 次，润滑眼球',
            '看向远处 6 米外的物体 20 秒',
            '眼球顺时针、逆时针各转 5 圈'
        ]
    },
    {
        id: 'wrist-stretch',
        name: '手腕拉伸',
        desc: '预防鼠标手，缓解手腕酸痛',
        duration: 30,
        icon: 'hand',
        steps: [
            '一手伸直，另一手轻轻向后掰手指',
            '保持 10 秒，感受前臂拉伸',
            '换另一只手重复',
            '双手合十，指尖向下压，保持 10 秒'
        ]
    },
    {
        id: 'waist-twist',
        name: '坐姿转腰',
        desc: '活动腰椎，缓解腰部僵硬',
        duration: 30,
        icon: 'move-horizontal',
        steps: [
            '坐直，双手抱胸或放扶手',
            '上半身缓慢向右侧扭转',
            '保持 3 秒后回正，再向左侧扭转',
            '重复 5-8 次，动作缓慢柔和'
        ]
    },
    {
        id: 'stand-stretch',
        name: '站立全身拉伸',
        desc: '站起来活动全身，促进血液循环',
        duration: 45,
        icon: 'person-standing',
        steps: [
            '从座位站起，双脚与肩同宽',
            '双手向上伸直，踮起脚尖',
            '保持 5 秒，感受全身伸展',
            '缓慢弯腰触碰脚尖（量力而行）'
        ]
    },
    {
        id: 'deep-breath',
        name: '深呼吸放松',
        desc: '调整呼吸节奏，缓解工作压力',
        duration: 30,
        icon: 'wind',
        steps: [
            '坐直，一只手放胸前，一只手放腹部',
            '鼻子吸气 4 秒，腹部鼓起',
            '屏息 2 秒',
            '嘴巴呼气 6 秒，感受身体放松'
        ]
    },
    {
        id: 'leg-stretch',
        name: '腿部伸展',
        desc: '促进下肢血液循环，预防久坐水肿',
        duration: 30,
        icon: 'footprints',
        steps: [
            '坐直，一条腿向前伸直',
            '脚尖回勾，身体微微前倾',
            '保持 10 秒，感受大腿后侧拉伸',
            '换另一条腿重复'
        ]
    }
];

// ==================== GIF 素材配置 ====================
// 在这里填入 GIF 图片地址，即可替换 SVG 卡通人物
// 支持 .gif / .webp / .mp4 等格式，留空则使用默认 SVG 动画
const EXERCISE_GIFS = {
    'neck-rotate':     '', // 颈部左右转动
    'shoulder-roll':   '', // 肩膀环绕运动
    'eye-rest':        '', // 眼部放松操
    'wrist-stretch':   '', // 手腕拉伸
    'waist-twist':     '', // 坐姿转腰
    'stand-stretch':   '', // 站立全身拉伸
    'deep-breath':     '', // 深呼吸放松
    'leg-stretch':     ''  // 腿部伸展
};

// ==================== 数据存储 ====================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(`sport_${key}`);
            return raw ? JSON.parse(raw) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    set(key, value) {
        localStorage.setItem(`sport_${key}`, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(`sport_${key}`);
    }
};

// ==================== 音效引擎 ====================
const Sound = {
    ctx: null,
    enabled: true,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    play(type = 'ding') {
        if (!this.enabled) return;
        try {
            this.init();
            const ctx = this.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'ding') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
            } else if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.6);
            } else if (type === 'tick') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.05);
            }
        } catch (e) {
            // 静默失败
        }
    }
};

// ==================== 通知 ====================
const Notify = {
    async requestPermission() {
        if (!('Notification' in window)) return false;
        const perm = await Notification.requestPermission();
        return perm === 'granted';
    },

    send(title, body) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        try {
            new Notification(title, {
                body,
                icon: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                badge: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                requireInteraction: true,
                silent: !Sound.enabled
            });
        } catch (e) {
            // 静默失败
        }
    }
};

// ==================== 应用状态 ====================
const App = {
    settings: {
        interval: 60,        // 分钟
        target: 8,           // 每日目标次数
        dndEnabled: false,   // 免打扰
        dndStart: '12:00',
        dndEnd: '13:30',
        sound: true,         // 提示音
        dark: false          // 深色模式
    },
    state: {
        workStartTime: Date.now(),
        lastExerciseTime: null,
        nextReminderTime: null,
        currentExercise: null,
        countdownTimer: null,
        countdownValue: 0,
        reminderOpen: false
    },
    timerId: null,

    // 初始化
    init() {
        this.loadSettings();
        this.initDarkMode();
        this.bindEvents();
        this.renderExerciseList();
        this.updateDashboard();
        this.startWorkTimer();
        this.startReminderEngine();
        this.checkDailyReset();
        lucide.createIcons();
    },

    // 加载设置
    loadSettings() {
        const saved = Storage.get('settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
        // 应用设置到 UI
        this.updateIntervalButtons();
        document.getElementById('target-slider').value = this.settings.target;
        document.getElementById('target-display').textContent = `${this.settings.target} 次`;
        document.getElementById('target-count').textContent = this.settings.target;

        this.setToggleState('toggle-dnd', this.settings.dndEnabled);
        document.getElementById('dnd-time').classList.toggle('opacity-50', !this.settings.dndEnabled);
        document.getElementById('dnd-time').classList.toggle('pointer-events-none', !this.settings.dndEnabled);
        document.getElementById('dnd-start').value = this.settings.dndStart;
        document.getElementById('dnd-end').value = this.settings.dndEnd;

        Sound.enabled = this.settings.sound;
        this.setToggleState('toggle-sound', this.settings.sound);

        // 通知状态
        this.updateNotifyStatus();
    },

    // 保存设置
    saveSettings() {
        Storage.set('settings', this.settings);
    },

    setToggleState(id, isOn) {
        const toggle = document.getElementById(id);
        if (!toggle) return;
        toggle.classList.toggle('on', isOn);
        toggle.classList.toggle('bg-primary-500', isOn);
        toggle.classList.toggle('bg-slate-200', !isOn);
        toggle.classList.toggle('dark:bg-slate-700', !isOn);
        toggle.setAttribute('aria-pressed', String(isOn));
        const knob = toggle.querySelector('span');
        if (knob) knob.style.transform = isOn ? 'translateX(20px)' : '';
    },

    updateIntervalButtons() {
        document.querySelectorAll('.interval-btn').forEach(btn => {
            const active = parseInt(btn.dataset.interval) === this.settings.interval;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        const summary = document.getElementById('interval-summary');
        if (summary) {
            summary.textContent = `当前每 ${this.settings.interval} 分钟提醒一次`;
        }
    },

    // 初始化深色模式
    initDarkMode() {
        const saved = Storage.get('dark');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = saved !== null ? saved : prefersDark;
        this.settings.dark = isDark;
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
        this.setToggleState('toggle-dark', isDark);
    },

    // 绑定事件
    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchView(tab.dataset.view));
        });

        // 立即开始
        document.getElementById('btn-start-now').addEventListener('click', () => {
            this.triggerReminder(true);
        });

        // 提醒间隔
        document.querySelectorAll('.interval-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.interval = parseInt(btn.dataset.interval);
                this.updateIntervalButtons();
                this.saveSettings();
                this.recalcNextReminder();
                this.updateDashboard();
            });
        });

        // 目标滑块
        const targetSlider = document.getElementById('target-slider');
        targetSlider.addEventListener('input', () => {
            this.settings.target = parseInt(targetSlider.value);
            document.getElementById('target-display').textContent = `${this.settings.target} 次`;
            document.getElementById('target-count').textContent = this.settings.target;
            this.saveSettings();
            this.updateDashboard();
        });

        // 免打扰开关
        document.getElementById('toggle-dnd').addEventListener('click', () => {
            this.settings.dndEnabled = !this.settings.dndEnabled;
            this.setToggleState('toggle-dnd', this.settings.dndEnabled);
            document.getElementById('dnd-time').classList.toggle('opacity-50', !this.settings.dndEnabled);
            document.getElementById('dnd-time').classList.toggle('pointer-events-none', !this.settings.dndEnabled);
            this.saveSettings();
            this.recalcNextReminder();
        });

        document.getElementById('dnd-start').addEventListener('change', e => {
            this.settings.dndStart = e.target.value;
            this.saveSettings();
        });
        document.getElementById('dnd-end').addEventListener('change', e => {
            this.settings.dndEnd = e.target.value;
            this.saveSettings();
        });

        // 通知权限
        document.getElementById('btn-notify-perm').addEventListener('click', async () => {
            const granted = await Notify.requestPermission();
            this.updateNotifyStatus();
            if (granted) {
                setTimeout(() => Notify.send('运动小助手', '通知权限已开启，到点会提醒你运动！'), 500);
            }
        });

        // 音效开关
        document.getElementById('toggle-sound').addEventListener('click', () => {
            this.settings.sound = !this.settings.sound;
            Sound.enabled = this.settings.sound;
            this.setToggleState('toggle-sound', this.settings.sound);
            if (this.settings.sound) {
                Sound.play('ding');
            }
            this.saveSettings();
        });

        // 深色模式
        document.getElementById('toggle-dark').addEventListener('click', () => {
            this.settings.dark = !this.settings.dark;
            document.documentElement.classList.toggle('dark');
            this.setToggleState('toggle-dark', this.settings.dark);
            Storage.set('dark', this.settings.dark);
            this.saveSettings();
        });

        // 重置数据
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.openResetConfirm();
        });

        // 弹窗按钮
        document.getElementById('btn-skip').addEventListener('click', () => this.closeReminder(false));
        document.getElementById('btn-done').addEventListener('click', () => this.completeExercise());
        document.getElementById('btn-change-exercise').addEventListener('click', () => this.changeExercise());
        document.getElementById('btn-snooze').addEventListener('click', () => this.snoozeReminder());
        document.getElementById('btn-reset-cancel').addEventListener('click', () => this.closeResetConfirm());
        document.getElementById('btn-reset-confirm').addEventListener('click', () => this.resetAllData());
        document.getElementById('btn-achievement-ok').addEventListener('click', () => {
            document.getElementById('achievement-overlay').classList.remove('show');
            setTimeout(() => {
                document.getElementById('achievement-overlay').classList.add('hidden');
            }, 300);
        });

        // 点击遮罩关闭成就弹窗
        document.getElementById('achievement-overlay').addEventListener('click', e => {
            if (e.target === document.getElementById('achievement-overlay')) {
                document.getElementById('btn-achievement-ok').click();
            }
        });

        document.getElementById('confirm-overlay').addEventListener('click', e => {
            if (e.target === document.getElementById('confirm-overlay')) {
                this.closeResetConfirm();
            }
        });
    },

    openResetConfirm() {
        const overlay = document.getElementById('confirm-overlay');
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            document.getElementById('btn-reset-cancel').focus();
        });
    },

    closeResetConfirm() {
        const overlay = document.getElementById('confirm-overlay');
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.classList.add('hidden');
            document.getElementById('btn-reset').focus();
        }, 200);
    },

    resetAllData() {
        ['settings', 'logs', 'stats', 'dark', 'streak', 'lastCheck'].forEach(k => Storage.remove(k));
        location.reload();
    },

    // 更新通知状态文字
    updateNotifyStatus() {
        const status = document.getElementById('notify-status');
        if (!('Notification' in window)) {
            status.textContent = '当前浏览器不支持系统通知';
            status.className = 'text-xs mt-2 text-rose-400';
        } else if (Notification.permission === 'granted') {
            status.textContent = '已开启，后台也能收到提醒';
            status.className = 'text-xs mt-2 text-primary-500';
            document.getElementById('btn-notify-perm').textContent = '已授权';
            document.getElementById('btn-notify-perm').disabled = true;
            document.getElementById('btn-notify-perm').classList.add('opacity-50', 'cursor-not-allowed');
        } else if (Notification.permission === 'denied') {
            status.textContent = '已被拒绝，请在浏览器设置中手动开启';
            status.className = 'text-xs mt-2 text-rose-400';
        } else {
            status.textContent = '未申请权限';
            status.className = 'text-xs mt-2 text-slate-400';
        }
    },

    // 切换视图
    switchView(viewName) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${viewName}`).classList.remove('hidden');
        document.querySelectorAll('.nav-tab').forEach(tab => {
            const isActive = tab.dataset.view === viewName;
            tab.setAttribute('aria-selected', String(isActive));
            tab.classList.toggle('bg-white', isActive);
            tab.classList.toggle('dark:bg-slate-700', isActive);
            tab.classList.toggle('shadow-sm', isActive);
            tab.classList.toggle('text-primary-600', isActive);
            tab.classList.toggle('dark:text-primary-400', isActive);
            tab.classList.toggle('text-slate-500', !isActive);
            tab.classList.toggle('dark:text-slate-400', !isActive);
        });
        lucide.createIcons();
    },

    // 动作演示生成器：优先使用 GIF，没有则使用 SVG 卡通人物
    getFigureHTML(animClass, size = 'small', exerciseId = '') {
        // 尝试获取 GIF 配置
        const gifUrl = exerciseId ? EXERCISE_GIFS[exerciseId] : '';

        if (gifUrl && gifUrl.trim().length > 0) {
            // GIF 模式
            if (size === 'large') {
                return `
                    <div class="exercise-gif exercise-gif-large">
                        <img src="${gifUrl}" alt="运动演示" loading="lazy" onerror="this.parentElement.innerHTML=App.getFallbackSVG('${animClass}','large')">
                    </div>
                `;
            } else {
                return `
                    <div class="exercise-gif exercise-gif-small">
                        <img src="${gifUrl}" alt="运动演示" loading="lazy" onerror="this.parentElement.innerHTML=App.getFallbackSVG('${animClass}','small')">
                    </div>
                `;
            }
        }

        return this.getFallbackSVG(animClass, size);
    },

    // SVG 回退
    getFallbackSVG(animClass, size = 'small') {
        const cls = size === 'large' ? 'figure-svg-large' : 'figure-svg-small';
        const vb = '0 -40 100 200';
        return `
            <svg class="figure-svg ${cls} ${animClass}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">
                <!-- 椅子（坐姿时显示） -->
                <g class="figure-chair">
                    <rect class="figure-chair-back" x="14" y="50" width="7" height="55" rx="3"/>
                    <rect class="figure-chair-seat" x="14" y="106" width="72" height="9" rx="4"/>
                    <rect class="figure-chair-leg" x="18" y="115" width="5" height="28" rx="2"/>
                    <rect class="figure-chair-leg" x="77" y="115" width="5" height="28" rx="2"/>
                    <rect class="figure-chair-armrest" x="10" y="76" width="3" height="22" rx="1.5"/>
                    <rect class="figure-chair-armrest" x="87" y="76" width="3" height="22" rx="1.5"/>
                </g>
                <!-- 左腿（裙下） -->
                <g class="figure-leg-left-group">
                    <line class="figure-leg" x1="46" y1="88" x2="41" y2="138"/>
                    <ellipse class="figure-shoe" cx="39" cy="142" rx="7" ry="4"/>
                    <rect class="figure-shoe-detail" x="36" y="140" width="6" height="2" rx="1"/>
                </g>
                <!-- 右腿（裙下） -->
                <g class="figure-leg-right-group">
                    <line class="figure-leg" x1="54" y1="88" x2="59" y2="138"/>
                    <ellipse class="figure-shoe" cx="61" cy="142" rx="7" ry="4"/>
                    <rect class="figure-shoe-detail" x="58" y="140" width="6" height="2" rx="1"/>
                </g>
                <!-- 连衣裙主体（收腰A字裙） -->
                <path class="figure-dress" d="M38 48 Q38 44 43 44 L57 44 Q62 44 62 48 L63 68 Q65 72 58 72 L42 72 Q35 72 37 68 Z"/>
                <path class="figure-dress-skirt" d="M42 72 L58 72 L68 96 Q70 100 64 100 L36 100 Q30 100 32 96 Z"/>
                <ellipse class="figure-dress-highlight" cx="42" cy="58" rx="5" ry="10"/>
                <!-- V领 -->
                <path class="figure-dress-collar" d="M46 44 L50 52 L54 44"/>
                <!-- 腰带 -->
                <rect class="figure-dress-belt" x="38" y="68" width="24" height="3" rx="1"/>
                <!-- 脖子 -->
                <rect class="figure-neck" x="45" y="36" width="10" height="10" rx="3"/>
                <!-- 上半身组 -->
                <g class="figure-upper-body">
                    <!-- 头部组：成熟优雅女性 -->
                    <g class="figure-head-group">
                        <!-- 头发后层（蓬松大波浪） -->
                        <ellipse class="figure-hair-back" cx="50" cy="28" rx="18" ry="16"/>
                        <path class="figure-hair-back" d="M33 18 Q26 40 32 54 Q35 60 40 54 Q37 40 38 20Z"/>
                        <path class="figure-hair-back" d="M67 18 Q74 40 68 54 Q65 60 60 54 Q63 40 62 20Z"/>
                        <path class="figure-hair-back" d="M38 12 Q50 6 62 12 Q64 16 60 18 Q50 14 40 18 Q36 16 38 12Z"/>
                        <!-- 耳朵 -->
                        <ellipse class="figure-ear" cx="35" cy="30" rx="2.8" ry="4"/>
                        <ellipse class="figure-ear" cx="65" cy="30" rx="2.8" ry="4"/>
                        <!-- 耳环 -->
                        <circle class="figure-earring" cx="33" cy="35" r="1.5"/>
                        <circle class="figure-earring" cx="67" cy="35" r="1.5"/>
                        <!-- 脸部（瓜子脸/鹅蛋脸） -->
                        <ellipse class="figure-head-shape" cx="50" cy="30" rx="12.5" ry="14"/>
                        <!-- 刘海（侧分） -->
                        <path class="figure-hair-front" d="M36 16 Q42 10 50 12 Q58 10 64 16 Q60 12 50 14 Q40 12 36 16Z"/>
                        <path class="figure-hair-front" d="M48 12 Q52 18 56 16 Q54 14 50 14 Q46 14 44 16Z"/>
                        <!-- 眉毛（柳叶眉，更弯更细） -->
                        <path class="figure-eyebrow" d="M42 23 Q45 21 48 24"/>
                        <path class="figure-eyebrow" d="M52 24 Q55 21 58 23"/>
                        <!-- 眼睛组（细长妩媚 + 睫毛） -->
                        <g class="figure-eye-group">
                            <ellipse class="figure-eye-white" cx="45" cy="27.5" rx="3.2" ry="3.8"/>
                            <ellipse class="figure-eye-white" cx="55" cy="27.5" rx="3.2" ry="3.8"/>
                            <circle class="figure-eye-pupil" cx="45" cy="27.5" r="1.6"/>
                            <circle class="figure-eye-pupil" cx="55" cy="27.5" r="1.6"/>
                            <circle cx="45.8" cy="26.6" r="0.9" fill="white" opacity="0.9"/>
                            <circle cx="55.8" cy="26.6" r="0.9" fill="white" opacity="0.9"/>
                            <!-- 上眼线 -->
                            <path class="figure-eyeliner" d="M42 25.5 Q45 24.5 48 25.5"/>
                            <path class="figure-eyeliner" d="M52 25.5 Q55 24.5 58 25.5"/>
                            <!-- 长睫毛 -->
                            <line class="figure-eyelash" x1="42" y1="25" x2="41" y2="23"/>
                            <line class="figure-eyelash" x1="45" y1="24.5" x2="44.5" y2="22.5"/>
                            <line class="figure-eyelash" x1="48" y1="25" x2="49" y2="23"/>
                            <line class="figure-eyelash" x1="52" y1="25" x2="51" y2="23"/>
                            <line class="figure-eyelash" x1="55" y1="24.5" x2="55.5" y2="22.5"/>
                            <line class="figure-eyelash" x1="58" y1="25" x2="59" y2="23"/>
                        </g>
                        <!-- 鼻子（小巧精致） -->
                        <ellipse class="figure-nose" cx="50" cy="32" rx="1.2" ry="0.9"/>
                        <!-- 腮红（优雅淡粉） -->
                        <ellipse class="figure-blush" cx="41" cy="34.5" rx="3" ry="2" opacity="0.35"/>
                        <ellipse class="figure-blush" cx="59" cy="34.5" rx="3" ry="2" opacity="0.35"/>
                        <!-- 嘴巴（红唇微笑） -->
                        <path class="figure-lips" d="M47 38 Q50 39.5 53 38"/>
                        <path class="figure-lips" d="M47 38 Q50 40.5 53 38"/>
                    </g>
                    <!-- 左臂（短袖露出） -->
                    <g class="figure-arm-left-group">
                        <line class="figure-arm" x1="38" y1="48" x2="30" y2="62"/>
                        <line class="figure-arm" x1="30" y1="62" x2="22" y2="78"/>
                        <circle class="figure-hand" cx="20" cy="81" r="4"/>
                        <line class="figure-finger" x1="18" y1="84" x2="16" y2="87"/>
                        <line class="figure-finger" x1="20" y1="84.5" x2="20" y2="88"/>
                        <line class="figure-finger" x1="22" y1="84" x2="24" y2="87"/>
                    </g>
                    <!-- 右臂（短袖露出） -->
                    <g class="figure-arm-right-group">
                        <line class="figure-arm" x1="62" y1="48" x2="70" y2="62"/>
                        <line class="figure-arm" x1="70" y1="62" x2="78" y2="78"/>
                        <circle class="figure-hand" cx="80" cy="81" r="4"/>
                        <line class="figure-finger" x1="78" y1="84" x2="76" y2="87"/>
                        <line class="figure-finger" x1="80" y1="84.5" x2="80" y2="88"/>
                        <line class="figure-finger" x1="82" y1="84" x2="84" y2="87"/>
                    </g>
                </g>
            </svg>
        `;
    },

    getAnimClass(id) {
        const map = {
            'neck-rotate': 'anim-neck-rotate',
            'shoulder-roll': 'anim-shoulder-roll',
            'eye-rest': 'anim-eye-rest',
            'wrist-stretch': 'anim-wrist-stretch',
            'waist-twist': 'anim-waist-twist',
            'stand-stretch': 'anim-stand-stretch',
            'deep-breath': 'anim-deep-breath',
            'leg-stretch': 'anim-leg-stretch'
        };
        return map[id] || '';
    },

    // 渲染运动库
    renderExerciseList() {
        const container = document.getElementById('exercise-list');
        container.innerHTML = EXERCISES.map((ex, i) => `
            <div class="exercise-card bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 cursor-pointer" style="animation-delay: ${i * 0.05}s" data-id="${ex.id}">
                <div class="flex items-start gap-3">
                    <div class="card-figure-wrap">
                        ${this.getFigureHTML(this.getAnimClass(ex.id), 'small', ex.id)}
                    </div>
                    <div class="min-w-0">
                        <h4 class="font-semibold text-sm truncate">${ex.name}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${ex.desc}</p>
                        <span class="inline-flex items-center gap-1 text-xs text-slate-400 mt-1.5">
                            <i data-lucide="timer" class="w-3 h-3"></i>
                            ${ex.duration} 秒
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        // 点击运动卡片直接开始
        container.querySelectorAll('.exercise-card').forEach(card => {
            card.addEventListener('click', () => {
                const ex = EXERCISES.find(e => e.id === card.dataset.id);
                if (ex) this.triggerReminder(true, ex);
            });
        });
    },

    // ==================== 定时引擎 ====================
    startWorkTimer() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.state.workStartTime) / 1000);
            const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');
            document.getElementById('work-timer').textContent = `${m}:${s}`;
        }, 1000);
    },

    startReminderEngine() {
        this.recalcNextReminder();
        this.timerId = setInterval(() => {
            if (this.state.reminderOpen) return;
            if (!this.state.nextReminderTime) return;

            const now = Date.now();
            if (now >= this.state.nextReminderTime) {
                if (!this.isDndActive()) {
                    this.triggerReminder();
                } else {
                    // 免打扰期间，顺延到免打扰结束
                    this.recalcNextReminder();
                }
            }

            // 更新"预计多久后提醒"
            const remain = Math.max(0, this.state.nextReminderTime - now);
            const rm = Math.ceil(remain / 60000);
            document.getElementById('next-reminder').textContent = rm <= 1 ? '1 分钟' : `${rm} 分钟`;
        }, 5000); // 每 5 秒检查一次
    },

    recalcNextReminder() {
        const intervalMs = this.settings.interval * 60 * 1000;
        let next = Date.now() + intervalMs;

        // 如果处于免打扰，且下次提醒在免打扰内，则顺延
        if (this.isDndActive()) {
            const dndEnd = this.getDndEndTime();
            if (dndEnd && next < dndEnd) {
                next = dndEnd + 60000; // 免打扰结束 1 分钟后
            }
        } else if (this.settings.dndEnabled) {
            // 检查下次提醒是否会落入免打扰，若会则顺延
            const dndStart = this.getDndStartTime();
            const dndEnd = this.getDndEndTime();
            if (dndStart && dndEnd && next >= dndStart && next < dndEnd) {
                next = dndEnd + 60000;
            }
        }

        this.state.nextReminderTime = next;
    },

    isDndActive() {
        if (!this.settings.dndEnabled) return false;
        const now = new Date();
        const [sh, sm] = this.settings.dndStart.split(':').map(Number);
        const [eh, em] = this.settings.dndEnd.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        const current = now.getHours() * 60 + now.getMinutes();

        if (start <= end) {
            return current >= start && current < end;
        } else {
            // 跨午夜的情况
            return current >= start || current < end;
        }
    },

    getDndStartTime() {
        const [h, m] = this.settings.dndStart.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
        return d.getTime();
    },

    getDndEndTime() {
        const [h, m] = this.settings.dndEnd.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
        return d.getTime();
    },

    // ==================== 提醒弹窗 ====================
    triggerReminder(manual = false, specificExercise = null) {
        if (this.state.reminderOpen) return;
        this.state.reminderOpen = true;

        Sound.play('ding');
        if (!manual) {
            Notify.send('运动小助手', '该起来动一动啦！久坐伤身，现在就开始一次微运动吧。');
        }

        // 随机选一个动作（或指定）
        this.setReminderExercise(specificExercise || this.getRandomExercise());

        // 显示弹窗
        const overlay = document.getElementById('reminder-overlay');
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            document.getElementById('btn-done').focus();
        });
    },

    getRandomExercise(excludeId = null) {
        const pool = EXERCISES.filter(ex => ex.id !== excludeId);
        const list = pool.length > 0 ? pool : EXERCISES;
        return list[Math.floor(Math.random() * list.length)];
    },

    setReminderExercise(ex) {
        this.state.currentExercise = ex;

        // 填充弹窗内容
        document.getElementById('exercise-name').textContent = ex.name;
        document.getElementById('exercise-desc').textContent = ex.desc;
        document.getElementById('reminder-status').textContent = '跟着动作做完后点“已完成”';

        // 设置动作演示（GIF 优先，SVG 回退）
        const figureBox = document.getElementById('exercise-figure-box');
        figureBox.innerHTML = this.getFigureHTML(this.getAnimClass(ex.id), 'large', ex.id);

        const stepsBox = document.getElementById('exercise-steps');
        stepsBox.innerHTML = ex.steps.map((s, i) => `
            <div class="flex gap-2 items-start">
                <span class="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">${i + 1}</span>
                <span>${s}</span>
            </div>
        `).join('');

        // 开始倒计时
        this.startCountdown(ex.duration);
        lucide.createIcons();
    },

    changeExercise() {
        if (!this.state.reminderOpen) return;
        const next = this.getRandomExercise(this.state.currentExercise?.id);
        this.setReminderExercise(next);
        document.getElementById('reminder-status').textContent = `已换成「${next.name}」`;
    },

    snoozeReminder() {
        const snoozeMinutes = 5;
        this.state.nextReminderTime = Date.now() + snoozeMinutes * 60 * 1000;
        document.getElementById('reminder-status').textContent = `${snoozeMinutes} 分钟后再提醒你`;
        this.closeReminder(false, { keepNextReminder: true });
    },

    startCountdown(seconds) {
        this.state.countdownValue = seconds;
        const total = seconds;
        const circle = document.getElementById('countdown-circle');
        const text = document.getElementById('countdown-text');
        const circumference = 2 * Math.PI * 45; // r=45

        circle.style.strokeDasharray = `${circumference}`;

        text.textContent = seconds;
        circle.style.strokeDashoffset = '0';

        if (this.state.countdownTimer) clearInterval(this.state.countdownTimer);

        this.state.countdownTimer = setInterval(() => {
            this.state.countdownValue--;
            text.textContent = Math.max(0, this.state.countdownValue);
            const offset = circumference - (this.state.countdownValue / total) * circumference;
            circle.style.strokeDashoffset = offset;

            if (this.state.countdownValue <= 5 && this.state.countdownValue > 0) {
                Sound.play('tick');
            }

            if (this.state.countdownValue <= 0) {
                clearInterval(this.state.countdownTimer);
                this.state.countdownTimer = null;
                Sound.play('success');
            }
        }, 1000);
    },

    closeReminder(completed, options = {}) {
        const overlay = document.getElementById('reminder-overlay');
        overlay.classList.remove('show');
        if (this.state.countdownTimer) {
            clearInterval(this.state.countdownTimer);
            this.state.countdownTimer = null;
        }
        setTimeout(() => {
            overlay.classList.add('hidden');
            this.state.reminderOpen = false;
            this.state.workStartTime = Date.now(); // 重置工作计时
            if (!options.keepNextReminder) {
                this.recalcNextReminder();
            }
            this.updateDashboard();
        }, 300);
    },

    completeExercise() {
        this.logExercise(this.state.currentExercise);
        this.closeReminder(true);
        this.showAchievement();
    },

    // ==================== 数据记录 ====================
    logExercise(exercise) {
        const now = new Date();
        const dateKey = this.getDateKey(now);
        const logs = Storage.get('logs', {});
        if (!logs[dateKey]) logs[dateKey] = [];
        logs[dateKey].push({
            id: exercise.id,
            name: exercise.name,
            timestamp: now.getTime()
        });
        Storage.set('logs', logs);

        // 更新连续天数统计
        this.updateStreak();
    },

    getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    updateStreak() {
        const logs = Storage.get('logs', {});
        const today = this.getDateKey(new Date());
        const yesterday = this.getDateKey(new Date(Date.now() - 86400000));

        let streak = 1;
        if (logs[yesterday] && logs[yesterday].length > 0) {
            const savedStreak = Storage.get('streak', 0);
            streak = savedStreak > 0 ? savedStreak + 1 : 1;
        } else if (!logs[today] || logs[today].length <= 1) {
            streak = 1;
        } else {
            streak = Storage.get('streak', 1);
        }

        Storage.set('streak', streak);
    },

    checkDailyReset() {
        const lastCheck = Storage.get('lastCheck');
        const today = this.getDateKey(new Date());
        if (lastCheck !== today) {
            Storage.set('lastCheck', today);
            // 新的一天，如果昨天没有运动，重置连续天数
            const logs = Storage.get('logs', {});
            const yesterday = this.getDateKey(new Date(Date.now() - 86400000));
            if (!logs[yesterday] || logs[yesterday].length === 0) {
                const todayLogs = logs[today] || [];
                if (todayLogs.length === 0) {
                    Storage.set('streak', 0);
                }
            }
        }
    },

    // ==================== 仪表盘更新 ====================
    updateDashboard() {
        const logs = Storage.get('logs', {});
        const today = this.getDateKey(new Date());
        const todayLogs = logs[today] || [];
        const weekLogs = this.getWeekLogs(logs);

        // 今日次数
        document.getElementById('today-count').textContent = todayLogs.length;

        // 进度
        const pct = Math.min(100, Math.round((todayLogs.length / this.settings.target) * 100));
        document.getElementById('progress-text').textContent = `${pct}%`;
        document.getElementById('progress-bar').style.width = `${pct}%`;
        document.getElementById('progress-circle').style.strokeDasharray = `${pct} ${100 - pct}`;

        // 连续天数
        const streak = Storage.get('streak', 0);
        document.getElementById('streak-days').textContent = streak;

        // 本周次数
        document.getElementById('week-count').textContent = weekLogs.length;

        // 今日记录列表
        const logContainer = document.getElementById('today-log');
        if (todayLogs.length === 0) {
            logContainer.innerHTML = `<p class="text-sm text-slate-400 text-center py-4">今天还没有运动记录，快开始第一次吧！</p>`;
        } else {
            logContainer.innerHTML = todayLogs.slice().reverse().map((log, i) => {
                const d = new Date(log.timestamp);
                const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                const ex = EXERCISES.find(e => e.id === log.id);
                return `
                    <div class="log-item flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700" style="animation-delay: ${i * 0.05}s">
                        <div class="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                            <i data-lucide="${ex ? ex.icon : 'activity'}" class="w-4 h-4"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">${log.name}</p>
                            <p class="text-xs text-slate-400">${time}</p>
                        </div>
                        <span class="text-xs font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-full">完成</span>
                    </div>
                `;
            }).join('');
        }

        lucide.createIcons();
    },

    getWeekLogs(logs) {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        let count = 0;
        for (const [dateKey, dayLogs] of Object.entries(logs)) {
            const [y, m, d] = dateKey.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            if (date >= monday) {
                count += dayLogs.length;
            }
        }
        return { length: count };
    },

    // ==================== 成就弹窗 ====================
    showAchievement() {
        const logs = Storage.get('logs', {});
        const today = this.getDateKey(new Date());
        const count = (logs[today] || []).length;

        const titles = [
            { min: 1, title: '迈出了第一步！', desc: `今日第 ${count} 次运动打卡成功` },
            { min: 3, title: '渐入佳境！', desc: `已完成 ${count} 次，继续保持` },
            { min: 5, title: '今日运动达人！', desc: `已完成 ${count} 次，太棒了` },
            { min: 8, title: '完美的一天！', desc: '达成今日目标，你真棒' }
        ];
        const match = [...titles].reverse().find(t => count >= t.min) || titles[0];

        document.getElementById('achievement-title').textContent = match.title;
        document.getElementById('achievement-desc').textContent = match.desc;

        const overlay = document.getElementById('achievement-overlay');
        overlay.classList.remove('hidden');
        requestAnimationFrame(() => overlay.classList.add('show'));
    }
};

// ==================== 启动 ====================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 页面可见性变化时处理
let hiddenTime = 0;
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        hiddenTime = Date.now();
    } else {
        // 从后台切回前台，检查是否错过提醒
        if (hiddenTime > 0 && App.state.nextReminderTime && Date.now() > App.state.nextReminderTime) {
            if (!App.state.reminderOpen && !App.isDndActive()) {
                App.triggerReminder();
            }
        }
        hiddenTime = 0;
        App.updateDashboard();
        lucide.createIcons();
    }
});
