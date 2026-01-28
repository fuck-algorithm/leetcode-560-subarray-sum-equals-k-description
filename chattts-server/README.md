# ChatTTS 本地服务器

为算法可视化应用提供高质量的中文语音合成服务。

## 快速开始

### 1. 安装依赖

```bash
# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python server.py
```

服务将在 `http://localhost:9527` 启动。

首次启动会自动下载ChatTTS模型（约2-4GB），请耐心等待。

### 3. 测试服务

```bash
# 健康检查
curl http://localhost:9527/health

# 测试语音合成
curl -X POST http://localhost:9527/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "你好，这是ChatTTS测试"}' \
  --output test.wav
```

## API文档

### POST /tts

**请求体：**
```json
{
  "text": "要转换的文本",
  "temperature": 0.3
}
```

**参数说明：**
- `text` (必填): 要转换的文本
- `temperature` (可选): 控制随机性，范围0.1-1.0，默认0.3
  - 越小越稳定，越大越有变化

**响应：**
- 成功：返回WAV音频文件（24kHz采样率）
- 失败：返回JSON错误信息

### GET /health

健康检查接口，返回服务状态。

## 性能优化

### GPU加速（推荐）

如果有NVIDIA GPU：

```bash
# 安装CUDA版本的PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

然后修改 `server.py`：
```python
chat.load_models(compile=True)  # 启用编译加速
```

### CPU运行

CPU也可以运行，但速度较慢。建议：
- 使用较短的文本
- 适当增加超时时间

## 故障排除

### 模型下载失败

手动下载模型文件到 `~/.cache/ChatTTS/`

### 内存不足

ChatTTS需要至少8GB内存。可以：
- 关闭其他应用
- 使用更小的batch size

### 端口被占用

修改 `server.py` 中的端口号：
```python
app.run(host='0.0.0.0', port=9528, debug=False)
```
