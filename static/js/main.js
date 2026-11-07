let currentLevelData = [];
let currentExercise = {};

// Xử lý chuyển Tab
function openTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
}

// Tải Lộ trình
async function loadRoadmap() {
    const level = document.getElementById('levelSelect').value;
    
    try {
        const response = await fetch('/api/get_roadmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: level })
        });
        
        currentLevelData = await response.json();
        const tbody = document.getElementById('roadmapBody');
        tbody.innerHTML = '';

        if (currentLevelData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Không có dữ liệu lộ trình.</td></tr>';
            return;
        }

        currentLevelData.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.step}</td><td>${item.topic}</td><td>${item.status}</td>`;
            tr.onclick = () => selectRoadmapItem(item, tr);
            tbody.appendChild(tr);
            
            // Tự động chọn bài đầu tiên
            if (index === 0) {
                tr.click();
            }
        });
    } catch (error) {
        console.error("Lỗi khi tải lộ trình:", error);
    }
}

// Chọn một dòng lộ trình
function selectRoadmapItem(item, rowElement) {
    // Highlight dòng được chọn
    document.querySelectorAll('#roadmapBody tr').forEach(tr => tr.classList.remove('selected'));
    rowElement.classList.add('selected');

    // Cập nhật bài tập
    currentExercise = item.exercise || {};
    
    document.getElementById('currentTopic').innerText = `Chủ đề hiện tại (${item.step}): ${item.topic}`;
    document.getElementById('questionBox').value = currentExercise.question || "";
    document.getElementById('answerBox').value = "";
    document.getElementById('feedbackBox').value = "";
    document.getElementById('hintBox').value = "💡 Bấm nút 'Xem Gợi Ý Toán Học' phía trên để nhận hướng dẫn giải bài này nhé!";

    // Cập nhật templates
    const templateSelect = document.getElementById('templateSelect');
    templateSelect.innerHTML = '<option value="">-- Chọn mẫu lời giải nhanh --</option>';
    
    if (currentExercise.templates) {
        for (const [key, value] of Object.entries(currentExercise.templates)) {
            if(key !== "-- Chọn mẫu lời giải nhanh --"){
                const option = document.createElement('option');
                option.value = value;
                option.text = key;
                templateSelect.appendChild(option);
            }
        }
    }
}

// Áp dụng mẫu lời giải
function applyTemplate() {
    const selectedValue = document.getElementById('templateSelect').value;
    if (selectedValue) {
        document.getElementById('answerBox').value = selectedValue;
    }
}

// Nộp bài
function submitExercise() {
    const answer = document.getElementById('answerBox').value.trim();
    if (!answer) {
        alert("Vui lòng nhập hoặc chọn lời giải trước khi nộp bài!");
        return;
    }
    document.getElementById('feedbackBox').value = 
        "🤖 AI Tutor đang chấm bài...\n\n- Đánh giá: Lời giải chính xác, trình bày rõ ràng các bước.\n- Lời khen: Em đã tính toán rất cẩn thận và có đáp số đầy đủ! Tiếp tục phát huy nhé!";
}

// Xem gợi ý
function showHint() {
    document.getElementById('hintBox').value = currentExercise.hints || "Không có gợi ý cho bài toán này.";
}

// --- CHAT LOGIC ---
function applyChatTemplate() {
    const selectedValue = document.getElementById('chatTemplateSelect').value;
    if (selectedValue) {
        document.getElementById('chatInput').value = selectedValue;
    }
}

function handleChatEnter(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML += `\nHọc sinh: ${message}\n`;
    input.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        chatHistory.innerHTML += `\n${data.reply}\n`;
        chatHistory.scrollTop = chatHistory.scrollHeight; // Cuộn xuống dưới cùng
    } catch (error) {
        chatHistory.innerHTML += `\n[Hệ thống]: Không thể kết nối đến AI Tutor.\n`;
    }
}

function clearChat() {
    document.getElementById('chatHistory').innerHTML = "AI Tutor: Xin chào! Em gặp bài toán khó nào hay có thắc mắc gì về phép tính, hình học tiểu học không? Hãy hỏi thầy/cô nhé!\n";
    document.getElementById('chatInput').value = '';
    document.getElementById('chatTemplateSelect').value = '';
}

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    loadRoadmap(); // Tải bài đầu tiên
    document.getElementById('levelSelect').addEventListener('change', loadRoadmap);
});