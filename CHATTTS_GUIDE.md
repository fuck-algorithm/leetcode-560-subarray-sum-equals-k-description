# 🎙️ ChatTTS 高质量语音使用指南

## 什么是ChatTTS？

ChatTTS是一个专门为对话场景设计的**文本转语音模型**，具有以下特点：

✨ **超自然语音** - 接近真人说话的效果  
🎭 **丰富情感** - 支持多种情感和说话风格  
🇨🇳 **中文优秀** - 对中文语音效果特别好  
🎵 **韵律自然** - 语调、停顿都很自然  

## 📊 对比效果

| 特性 | ChatTTS | 浏览器原生TTS |
|------|---------|--------------|
| 语音自然度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 情感表达 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 中文效果 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 启动速度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 资源占用 | 2-4GB | 0MB |

## 🚀 快速开始

### 方式一：一键启动（推荐）

```bash
cd chattts-server
./start.sh
```

脚本会自动：
1. 检查Python环境
2. 创建虚拟环境
3. 安装依赖
4. 下载模型（首次约2-4GB）
5. 启动服务

### 方式二：手动安装

```bash
cd chattts-server

# 1. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 启动服务
python server.py
```

### 启动前端应用

```bash
# 在另一个终端
npm run dev
```

访问 http://localhost:56146

## ✨ 使用体验

启动ChatTTS后，应用会**自动检测**并使用高质量语音：

1. **自动降级** - ChatTTS不可用时自动切换到浏览器TTS
2. **无缝切换** - 用户无需任何配置
3. **状态提示** - 控制台会显示当前使用的TTS引擎

## 🎛️ 参数调节

ChatTTS支持以下参数：

### Temperature（温度）
- **范围**: 0.1 - 1.0
- **默认**: 0.3
- **说明**: 
  - 越小越稳定，适合正式讲解
  - 越大变化越多，适合生动表达

### 语音风格
每次启动会随机选择说话人，重启服务可以更换声音。

## 🔧 故障排除

### 问题1: 模型下载慢

**解决方案**:
```bash
# 使用镜像源
export HF_ENDPOINT=https://hf-mirror.com
python server.py
```

### 问题2: 内存不足

ChatTTS需要至少**8GB内存**。

**解决方案**:
- 关闭其他应用
- 使用更小的模型版本
- 增加系统swap空间

### 问题3: GPU加速

如果有NVIDIA GPU：

```bash
# 安装CUDA版PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 修改server.py
chat.load_models(compile=True)  # 启用GPU加速
```

### 问题4: 端口冲突

修改 `server.py` 的端口号：
```python
app.run(host='0.0.0.0', port=9528, debug=False)
```

同时修改 `src/utils/chatTTS.ts`：
```typescript
constructor(serverUrl: string = 'http://localhost:9528')
```

## 📈 性能对比

### 生成速度

| 设备 | 速度 | 体验 |
|------|------|------|
| GPU (RTX 3060) | 实时+ | ⭐⭐⭐⭐⭐ 流畅 |
| CPU (8核) | 1-2s延迟 | ⭐⭐⭐⭐ 可接受 |
| CPU (4核) | 3-5s延迟 | ⭐⭐⭐ 稍慢 |

### 资源占用

- **内存**: 约4-6GB
- **磁盘**: 约2-4GB（模型文件）
- **CPU**: 运行时20-50%

## 🌟 最佳实践

### 1. 开发环境
```bash
# 启动ChatTTS（一个终端）
cd chattts-server && ./start.sh

# 启动前端（另一个终端）
npm run dev
```

### 2. 生产环境

可以将ChatTTS部署到服务器：

```bash
# 使用gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:9527 server:app
```

### 3. Docker部署

```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY server.py .
CMD ["python", "server.py"]
```

## 🎯 使用建议

### 什么时候用ChatTTS？
✅ 需要高质量语音效果  
✅ 面向中文用户  
✅ 有足够的硬件资源  
✅ 可以运行本地服务  

### 什么时候用原生TTS？
✅ 快速原型开发  
✅ 资源受限环境  
✅ 不想安装额外服务  
✅ 多语言支持需求  

## 📚 更多资源

- [ChatTTS GitHub](https://github.com/2noise/ChatTTS)
- [在线Demo](https://chattts.com)
- [模型文档](https://huggingface.co/2Noise/ChatTTS)

## 💡 小贴士

1. **首次启动** - 需要下载模型，请耐心等待
2. **服务复用** - ChatTTS服务可以被多个应用共享
3. **缓存音频** - 可以预生成常用语音提高响应速度
4. **批量生成** - API支持批量处理，提高效率

## 🎉 享受高质量语音吧！

现在你的算法可视化应用拥有了**电影级**的语音讲解效果！

有任何问题，欢迎查看日志或提Issue！
