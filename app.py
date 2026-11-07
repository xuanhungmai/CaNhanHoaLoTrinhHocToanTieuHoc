from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# Hàm đọc dữ liệu từ file JSON
def load_roadmap():
    json_file = "lotrinh.json"
    if not os.path.exists(json_file):
        return {}
    with open(json_file, "r", encoding="utf-8") as f:
        return json.load(f)

# Route 1: Trả về giao diện chính
@app.route('/')
def index():
    return render_template('index.html')

# Route 2: API lấy lộ trình theo trình độ
@app.route('/api/get_roadmap', methods=['POST'])
def get_roadmap():
    data = request.json
    level = data.get('level')
    roadmap_data = load_roadmap()
    level_data = roadmap_data.get(level, [])
    return jsonify(level_data)

# Route 3: API xử lý Chat AI (Giữ nguyên toàn bộ logic của bản Desktop)
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').strip()
    msg_lower = message.lower()

    if "cách làm bài toán" in msg_lower or "giải thích" in msg_lower:
        reply = (
            "AI Tutor: Để giải một bài toán tiểu học, em hãy làm theo 3 bước:\n"
            "1. Đọc kỹ đề bài để xác định cái đã cho (giả thiết) và cái phải tìm (kết luận).\n"
            "2. Tóm tắt bài toán bằng lời hoặc sơ đồ đoạn thẳng.\n"
            "3. Chọn phép tính thích hợp (cộng, trừ, nhân, chia) và trình bày lời giải rõ ràng!\n"
        )
    elif "diện tích" in msg_lower and "hình thang" in msg_lower:
        reply = (
            "AI Tutor: Thầy/cô gửi em công thức:\n"
            "- Diện tích hình thang: Bằng tổng độ dài hai đáy nhân với chiều cao (cùng một đơn vị đo) rồi chia cho 2.\n"
            "  Công thức: S = [(a + b) * h] / 2\n"
            "- Diện tích hình tròn: Bằng bình phương bán kính nhân với số 3.14.\n"
            "  Công thức: S = r * r * 3.14\n"
        )
    elif "chuyển động đều" in msg_lower:
        reply = (
            "AI Tutor: Với dạng toán chuyển động đều ở lớp 5, em cần nắm chắc 3 đại lượng chính (Quãng đường S, Vận tốc v, Thời gian t):\n"
            "- Tính quãng đường: S = v * t\n"
            "- Tính vận tốc: v = S / t\n"
            "- Tính thời gian: t = S / v\n"
            "Lưu ý quan trọng: Phải đổi các đơn vị đo về cùng một hệ thống (ví dụ: km và giờ, hoặc mét và phút) trước khi tính toán nhé!\n"
        )
    elif "quy đồng" in msg_lower or "phân số" in msg_lower:
        reply = (
            "AI Tutor: Cách quy đồng mẫu số hai phân số:\n"
            "1. Tìm mẫu số chung (thường là bội chung nhỏ nhất của hai mẫu số).\n"
            "2. Tìm thừa số phụ cho từng phân số bằng cách lấy mẫu số chung chia cho mẫu số cũ.\n"
            "3. Nhân cả tử và mẫu của mỗi phân số với thừa số phụ tương ứng.\n"
        )
    else:
        reply = (
            f"AI Tutor: Thầy/cô đã ghi nhận câu hỏi của em: '{message}'. Em hãy cố gắng đọc kỹ đề bài, "
            "áp dụng đúng quy tắc tính toán hoặc đưa thêm chi tiết bài toán cụ thể để thầy/cô hướng dẫn chi tiết hơn nhé!\n"
        )
    
    return jsonify({"reply": reply})

if __name__ == '__main__':
    # Lưu ý: Mình đổi sang port 5001 để tránh lỗi "Address already in use" trên Mac của bạn nhé!
    app.run(host='0.0.0.0', port=5001, debug=True)