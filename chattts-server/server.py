"""
ChatTTS本地服务器
用于为浏览器应用提供高质量语音合成
"""
from flask import Flask, request, send_file
from flask_cors import CORS
import ChatTTS
import torch
import io
import numpy as np
import scipy.io.wavfile as wavfile

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化ChatTTS
print("正在加载ChatTTS模型...")
chat = ChatTTS.Chat()
chat.load_models(compile=False)  # 设置为True需要GPU
print("ChatTTS模型加载完成！")

@app.route('/tts', methods=['POST'])
def text_to_speech():
    """
    文本转语音API
    接收JSON: {"text": "要转换的文本", "temperature": 0.3}
    返回: WAV音频文件
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return {"error": "文本不能为空"}, 400
        
        # ChatTTS参数配置
        params_infer_code = {
            'spk_emb': chat.sample_random_speaker(),  # 随机说话人
            'temperature': data.get('temperature', 0.3),  # 控制随机性，越小越稳定
            'top_P': 0.7,  # nucleus采样
            'top_K': 20,   # top-k采样
        }
        
        # 生成语音
        wavs = chat.infer([text], params_infer_code=params_infer_code)
        
        # 转换为WAV格式
        audio_data = np.array(wavs[0], dtype=np.float32)
        
        # 创建内存中的WAV文件
        byte_io = io.BytesIO()
        wavfile.write(byte_io, 24000, audio_data)  # ChatTTS默认24kHz
        byte_io.seek(0)
        
        return send_file(
            byte_io,
            mimetype='audio/wav',
            as_attachment=False,
            download_name='speech.wav'
        )
        
    except Exception as e:
        print(f"错误: {str(e)}")
        return {"error": str(e)}, 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查"""
    return {"status": "ok", "model": "ChatTTS"}

if __name__ == '__main__':
    print("ChatTTS服务器启动在 http://localhost:9527")
    app.run(host='0.0.0.0', port=9527, debug=False)
