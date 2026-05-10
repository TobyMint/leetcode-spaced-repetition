/* 共享组件和工具函数 */

const API = '/api';

// ── API 请求 ──
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

// ── Toast ──
function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ── 标签辅助 ──
function diffBadge(diff) {
    return `<span class="diff-${diff} px-2 py-0.5 rounded text-xs font-medium">${diff}</span>`;
}

function statusLabel(status) {
    const map = { new: '未开始', learning: '学习中', review: '复习中', mastered: '已掌握' };
    return `<span class="status-${status} px-2 py-0.5 rounded text-xs whitespace-nowrap">${map[status] || status}</span>`;
}

function qualityDesc(q) {
    return ['完全不记得', '看到答案才想起来', '勉强回忆', '勉强答对', '答对但犹豫', '轻松答对'][q];
}

function leetcodeSearchUrl(title) {
    return `https://leetcode.cn/problemset/?search=${encodeURIComponent(title)}`;
}

// ── 快速复习弹窗 ──
function showQuickReview(id, title) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="quick-review-overlay" class="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onclick="if(event.target===this)closeQuickReview()">
            <div class="modal-box bg-white rounded-xl p-6 w-80 shadow-2xl" onclick="event.stopPropagation()">
                <p class="font-medium text-gray-800 mb-1">#${id} ${title}</p>
                <p class="text-sm text-gray-500 mb-3">这道题做得怎么样？</p>
                <div class="flex gap-2 mb-3">
                    ${[0, 1, 2, 3, 4, 5].map(q => `
                        <button class="quality-btn q${q}" onclick="quickReviewAndClose(${id}, ${q})" title="${qualityDesc(q)}">${q}</button>
                    `).join('')}
                </div>
                <div class="flex gap-3 text-xs text-gray-400">
                    <span>0-2: 不会</span><span>3: 勉强</span><span>4: 犹豫</span><span>5: 轻松</span>
                </div>
            </div>
        </div>`);
}

function closeQuickReview() {
    document.getElementById('quick-review-overlay')?.remove();
}

async function quickReviewAndClose(id, quality) {
    try {
        await api(`/review/${id}`, { method: 'POST', body: JSON.stringify({ quality }) });
        toast(`#${id} 已评分: ${quality} - ${qualityDesc(quality)}`);
        closeQuickReview();
        render();
    } catch (e) {
        toast(e.message, 'error');
    }
}

// ── 重置确认弹窗 ──
function showResetConfirm(id, title) {
    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onclick="if(event.target===this)closeResetConfirm()">
            <div class="modal-box bg-white rounded-xl p-6 w-96 shadow-2xl" onclick="event.stopPropagation()">
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-2xl">⚠️</span>
                    <h3 class="text-lg font-semibold text-gray-800">确认重置</h3>
                </div>
                <p class="text-sm text-gray-600 mb-2">确定要重置 <strong>#${id} ${title}</strong> 的学习进度吗？</p>
                <p class="text-xs text-red-500 mb-4">这将清除所有复习记录和间隔数据，题目回到"未开始"状态。</p>
                <div class="flex gap-2 justify-end">
                    <button onclick="closeResetConfirm()" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">取消</button>
                    <button onclick="resetProgress(${id})" class="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">确认重置</button>
                </div>
            </div>
        </div>`);
}

function closeResetConfirm() {
    document.querySelector('.modal-overlay')?.remove();
}

// ── 单题活动日志弹窗 ──
async function showProblemActivity(id, title) {
    const logs = await api(`/problems/${id}/activity`);

    const actionLabels = { review: '复习评分', add: '添加题目', reset: '重置进度' };
    const actionColors = {
        review: 'text-blue-600 bg-blue-50',
        add: 'text-green-600 bg-green-50',
        reset: 'text-orange-600 bg-orange-50',
    };

    const logHtml = logs.length === 0
        ? '<p class="text-gray-400 text-sm text-center py-4">暂无记录</p>'
        : logs.map(log => {
            const date = new Date(log.created_at);
            const timeStr = date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            return `
                <div class="flex items-center gap-2 text-sm py-2 border-b border-gray-100 last:border-0">
                    <span class="text-xs text-gray-400 w-24 shrink-0">${timeStr}</span>
                    <span class="text-xs px-1.5 py-0.5 rounded ${actionColors[log.action] || 'text-gray-600 bg-gray-100'}">${actionLabels[log.action] || log.action}</span>
                    <span class="text-gray-500 text-xs">${log.detail || ''}</span>
                </div>`;
        }).join('');

    document.body.insertAdjacentHTML('beforeend', `
        <div id="problem-activity-overlay" class="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onclick="if(event.target===this)closeProblemActivity()">
            <div class="modal-box bg-white rounded-xl p-6 w-96 max-h-96 overflow-y-auto shadow-2xl" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-gray-800">#${id} ${title}</h3>
                    <button onclick="closeProblemActivity()" class="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                </div>
                <p class="text-xs text-gray-400 mb-3">操作记录</p>
                ${logHtml}
            </div>
        </div>`);
}

function closeProblemActivity() {
    document.getElementById('problem-activity-overlay')?.remove();
}
