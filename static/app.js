/* LeetCode 遗忘曲线 — 前端 SPA */

const API = '/api';

// ---------- 工具函数 ----------
async function api(path, opts = {}) {
    const res = await fetch(API + path, {
        headers: { 'Content-Type': 'application/json' },
        ...opts,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Request failed');
    }
    return res.json();
}

function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = toast toast-${type};
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function diffBadge(diff) {
    return <span class="diff-${diff} px-2 py-0.5 rounded text-xs font-medium">${diff}</span>;
}

function statusLabel(status) {
    const map = { new: '未开始', learning: '学习中', review: '复习中', mastered: '已掌握' };
    return <span class="status-${status} px-2 py-0.5 rounded text-xs">${map[status] || status}</span>;
}

// ---------- 路由 ----------
const router = {
    current: 'today',
    go(page) {
        this.current = page;
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.nav === page);
        });
        render();
    },
};

// ---------- 页面：今日任务 ----------
async function renderToday() {
    const data = await api('/today');
    const all = [...data.new.map(p => ({ ...p, isNew: true })), ...data.review.map(p => ({ ...p, isNew: false }))];

    if (all.length === 0) {
        return `
            <div class="card text-center py-12">
                <p class="text-gray-400 text-lg">今天没有需要刷的题目 🎉</p>
                <p class="text-gray-400 text-sm mt-2">可以去"题目总览"手动添加新题，或者等明天再来</p>
            </div>`;
    }

    return `
        <div class="space-y-3">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">今日任务</h2>
                <span class="text-sm text-gray-500">${all.length} 道题</span>
            </div>
            ${all.map(p => renderTodayItem(p)).join('')}
        </div>`;
}

function renderTodayItem(p) {
    const tag = p.isNew
        ? '<span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">新题</span>'
        : '<span class="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">复习</span>';

    return `
        <div class="card problem-row" id="problem-${p.id}">
            <div class="flex items-center justify-between cursor-pointer" onclick="toggleExpand(${p.id})">
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 text-sm w-8">#${p.id}</span>
                    <span class="font-medium text-gray-800">${p.title}</span>
                    ${diffBadge(p.difficulty)}
                    ${tag}
                </div>
                <svg class="w-4 h-4 text-gray-400 transition-transform" id="arrow-${p.id}" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
            </div>
            <div class="expand-content" id="expand-${p.id}">
                <div class="pt-4 border-t mt-3">
                    <p class="text-sm text-gray-500 mb-3">做完后给自己打分：</p>
                    <div class="flex gap-2 mb-2">
                        ${[0,1,2,3,4,5].map(q => `
                            <button class="quality-btn q${q}" onclick="submitReview(${p.id}, ${q})" title="${qualityDesc(q)}">${q}</button>
                        `).join('')}
                    </div>
                    <div class="flex gap-4 text-xs text-gray-400 mt-2">
                        <span>0-2: 不会</span>
                        <span>3: 勉强</span>
                        <span>4: 犹豫</span>
                        <span>5: 轻松</span>
                    </div>
                </div>
            </div>
        </div>`;
}

function qualityDesc(q) {
    return ['完全不记得','看到答案才想起来','勉强回忆','勉强答对','答对但犹豫','轻松答对'][q];
}

function toggleExpand(id) {
    const content = document.getElementById(expand-${id});
    const arrow = document.getElementById(arrow-${id});
    content.classList.toggle('open');
    arrow.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : '';
}

async function submitReview(problemId, quality) {
    try {
        await api(/review/${problemId}, {
            method: 'POST',
            body: JSON.stringify({ quality }),
        });
        toast(已评分: ${quality} - ${qualityDesc(quality)});
        render(); // 刷新
    } catch (e) {
        toast(e.message, 'error');
    }
}

// ---------- 页面：题目总览 ----------
async function renderProblems() {
    const problems = await api('/problems');

    return `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-800">题目总览</h2>
                <button onclick="showAddProblem()" class="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600">+ 添加题目</button>
            </div>

            <!-- 筛选栏 -->
            <div class="flex gap-2 flex-wrap">
                <select id="filter-status" onchange="render()" class="border rounded-md px-2 py-1 text-sm">
                    <option value="">全部状态</option>
                    <option value="new">未开始</option>
                    <option value="review">复习中</option>
                    <option value="mastered">已掌握</option>
                </select>
                <select id="filter-diff" onchange="render()" class="border rounded-md px-2 py-1 text-sm">
                    <option value="">全部难度</option>
                    <option value="简单">简单</option>
                    <option value="中等">中等</option>
                    <option value="困难">困难</option>
                </select>
                <select id="filter-category" onchange="render()" class="border rounded-md px-2 py-1 text-sm">
                    <option value="">全部分类</option>
                    ${[...new Set(problems.map(p => p.category).filter(Boolean))].map(c =>
                        <option value="${c}">${c}</option>
                    ).join('')}
                </select>
            </div>

            <!-- 添加题目表单 -->
            <div id="add-form" class="card hidden">
                <h3 class="font-medium mb-3">添加新题目</h3>
                <div class="grid grid-cols-2 gap-3">
                    <input id="new-title" placeholder="题目名称" class="border rounded-md px-3 py-2 text-sm">
                    <select id="new-diff" class="border rounded-md px-3 py-2 text-sm">
                        <option value="简单">简单</option>
                        <option value="中等">中等</option>
                        <option value="困难">困难</option>
                    </select>
                    <input id="new-category" placeholder="分类（可选）" class="border rounded-md px-3 py-2 text-sm">
                    <input id="new-url" placeholder="LeetCode 链接（可选）" class="border rounded-md px-3 py-2 text-sm">
                </div>
                <div class="flex gap-2 mt-3">
                    <button onclick="addProblem()" class="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-600">添加</button>
                    <button onclick="document.getElementById('add-form').classList.add('hidden')" class="text-gray-500 px-4 py-1.5 rounded-md text-sm hover:bg-gray-100">取消</button>
                </div>
            </div>

            <!-- 题目列表 -->
            <div class="card p-0 overflow-hidden">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 text-gray-500">
                        <tr>
                            <th class="px-4 py-2 text-left w-12">#</th>
                            <th class="px-4 py-2 text-left">题目</th>
                            <th class="px-4 py-2 text-left w-20">难度</th>
                            <th class="px-4 py-2 text-left w-24">分类</th>
                            <th class="px-4 py-2 text-left w-20">状态</th>
                            <th class="px-4 py-2 text-left w-28">下次复习</th>
                            <th class="px-4 py-2 text-left w-20">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filterProblems(problems).map(p => `
                            <tr class="problem-row border-t">
                                <td class="px-4 py-2 text-gray-400">${p.id}</td>
                                <td class="px-4 py-2 font-medium">${p.title}</td>
                                <td class="px-4 py-2">${diffBadge(p.difficulty)}</td>
                                <td class="px-4 py-2 text-gray-500">${p.category || '-'}</td>
                                <td class="px-4 py-2">${statusLabel(p.status)}</td>
                                <td class="px-4 py-2 text-gray-400 text-xs">${p.next_review || '-'}</td>
                                <td class="px-4 py-2">
                                    ${p.status === 'new' ? `<button onclick="markKnown(${p.id})" class="text-green-600 text-xs hover:underline">标记已会</button>` : ''}
                                    ${!p.is_preset ? `<button onclick="deleteProblem(${p.id})" class="text-red-500 text-xs hover:underline ml-2">删除</button>` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
}

function filterProblems(problems) {
    const status = document.getElementById('filter-status')?.value || '';
    const diff = document.getElementById('filter-diff')?.value || '';
    const cat = document.getElementById('filter-category')?.value || '';
    return problems.filter(p =>
        (!status || p.status === status) &&
        (!diff || p.difficulty === diff) &&
        (!cat || p.category === cat)
    );
}

function showAddProblem() {
    document.getElementById('add-form').classList.remove('hidden');
}

async function addProblem() {
    const title = document.getElementById('new-title').value.trim();
    if (!title) return toast('请输入题目名称', 'error');
    try {
        await api('/problems', {
            method: 'POST',
            body: JSON.stringify({
                title,
                difficulty: document.getElementById('new-diff').value,
                category: document.getElementById('new-category').value,
                url: document.getElementById('new-url').value,
            }),
        });
        toast('添加成功');
        render();
    } catch (e) {
        toast(e.message, 'error');
    }
}

async function markKnown(id) {
    try {
        await api(/problems/${id}/mark-known, { method: 'POST' });
        toast('已标记为已掌握');
        render();
    } catch (e) {
        toast(e.message, 'error');
    }
}

async function deleteProblem(id) {
    if (!confirm('确定删除此题？')) return;
    try {
        await api(/problems/${id}, { method: 'DELETE' });
        toast('已删除');
        render();
    } catch (e) {
        toast(e.message, 'error');
    }
}

// ---------- 页面：统计 ----------
async function renderStats() {
    const stats = await api('/stats');
    const { counts, today_reviewed, streak, daily, difficulty } = stats;
    const masteredPercent = counts.total ? Math.round((counts.mastered / counts.total) * 100) : 0;
    const reviewedPercent = counts.total ? Math.round(((counts.review + counts.mastered) / counts.total) * 100) : 0;

    return `
        <div class="space-y-6">
            <h2 class="text-lg font-semibold text-gray-800">学习统计</h2>

            <!-- 概览卡片 -->
            <div class="grid grid-cols-4 gap-4">
                <div class="card text-center">
                    <p class="text-3xl font-bold text-blue-500">${counts.total}</p>
                    <p class="text-sm text-gray-500 mt-1">总题数</p>
                </div>
                <div class="card text-center">
                    <p class="text-3xl font-bold text-green-500">${counts.mastered}</p>
                    <p class="text-sm text-gray-500 mt-1">已掌握</p>
                </div>
                <div class="card text-center">
                    <p class="text-3xl font-bold text-yellow-500">${today_reviewed}</p>
                    <p class="text-sm text-gray-500 mt-1">今日已刷</p>
                </div>
                <div class="card text-center">
                    <p class="text-3xl font-bold text-purple-500">${streak}</p>
                    <p class="text-sm text-gray-500 mt-1">连续打卡</p>
                </div>
            </div>

            <!-- 进度环 -->
            <div class="card flex items-center gap-8">
                <div class="relative" style="width:120px;height:120px">
                    <svg class="progress-ring" width="120" height="120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#22c55e" stroke-width="10"
                            stroke-dasharray="${2 * Math.PI * 52}"
                            stroke-dashoffset="${2 * Math.PI * 52 * (1 - masteredPercent / 100)}"
                            stroke-linecap="round"/>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-xl font-bold text-gray-800">${masteredPercent}%</span>
                    </div>
                </div>
                <div class="flex-1">
                    <h3 class="font-medium mb-2">总体进度</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span>未开始</span><span class="font-medium">${counts.new}</span></div>
                        <div class="flex justify-between"><span>复习中</span><span class="font-medium">${counts.review}</span></div>
                        <div class="flex justify-between"><span>已掌握</span><span class="font-medium">${counts.mastered}</span></div>
                    </div>
                </div>
            </div>

            <!-- 各难度完成率 -->
            <div class="card">
                <h3 class="font-medium mb-3">各难度完成率</h3>
                <div class="space-y-3">
                    ${Object.entries(difficulty).map(([diff, d]) => {
                        const pct = d.total ? Math.round((d.done / d.total) * 100) : 0;
                        return `
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>${diffBadge(diff)}</span>
                                    <span class="text-gray-500">${d.done}/${d.total} (${pct}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full" style="width:${pct}%"></div>
                                </div>
                            </div>`;
                    }).join('')}
                </div>
            </div>

            <!-- 最近 7 天 -->
            <div class="card">
                <h3 class="font-medium mb-3">最近 7 天</h3>
                <div class="flex items-end gap-2 h-32">
                    ${renderDailyChart(daily)}
                </div>
            </div>
        </div>`;
}

function renderDailyChart(daily) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('zh-CN', { weekday: 'short' });
        const item = daily.find(x => x.day === key);
        days.push({ label, count: item ? item.count : 0 });
    }
    const max = Math.max(...days.map(d => d.count), 1);
    return days.map(d => {
        const h = Math.max((d.count / max) * 100, 4);
        return `
            <div class="flex-1 flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500">${d.count}</span>
                <div class="w-full bg-blue-400 rounded-t" style="height:${h}%"></div>
                <span class="text-xs text-gray-400">${d.label}</span>
            </div>`;
    }).join('');
}

// ---------- 页面：设置 ----------
async function renderSettings() {
    const settings = await api('/settings');
    return `
        <div class="space-y-6">
            <h2 class="text-lg font-semibold text-gray-800">设置</h2>
            <div class="card space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">每日新题数量</label>
                    <input id="set-new" type="number" value="${settings.new_per_day || 3}" min="0" max="20"
                        class="border rounded-md px-3 py-2 w-32 text-sm">
                    <p class="text-xs text-gray-400 mt-1">每天学习几道新题（设为 0 则只复习）</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">每日复习上限</label>
                    <input id="set-review" type="number" value="${settings.max_review_per_day || 10}" min="0" max="100"
                        class="border rounded-md px-3 py-2 w-32 text-sm">
                    <p class="text-xs text-gray-400 mt-1">每天最多复习几道题</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">已掌握标准 — 连续正确次数</label>
                    <input id="set-consec" type="number" value="${settings.mastered_consecutive || 5}" min="1" max="20"
                        class="border rounded-md px-3 py-2 w-32 text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">已掌握标准 — 间隔天数</label>
                    <input id="set-interval" type="number" value="${settings.mastered_interval || 21}" min="1" max="365"
                        class="border rounded-md px-3 py-2 w-32 text-sm">
                    <p class="text-xs text-gray-400 mt-1">连续正确且间隔超过此天数后标记为"已掌握"</p>
                </div>
                <button onclick="saveSettings()" class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600">保存</button>
            </div>
        </div>`;
}

async function saveSettings() {
    try {
        await api('/settings', {
            method: 'PUT',
            body: JSON.stringify({
                new_per_day: parseInt(document.getElementById('set-new').value),
                max_review_per_day: parseInt(document.getElementById('set-review').value),
                mastered_consecutive: parseInt(document.getElementById('set-consec').value),
                mastered_interval: parseInt(document.getElementById('set-interval').value),
            }),
        });
        toast('设置已保存');
    } catch (e) {
        toast(e.message, 'error');
    }
}

// ---------- 渲染入口 ----------
async function render() {
    const app = document.getElementById('app');
    try {
        const renderers = {
            today: renderToday,
            problems: renderProblems,
            stats: renderStats,
            settings: renderSettings,
        };
        app.innerHTML = await renderers[router.current]();
    } catch (e) {
        app.innerHTML = `<div class="card text-center py-8 text-red-500">${e.message}</div>`;
    }
}

// ---------- 启动 ----------
router.go('today');
