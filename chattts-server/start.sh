#!/bin/bash

echo "🎙️ ChatTTS 语音服务启动脚本"
echo "================================"

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python"
    exit 1
fi

echo "✅ Python版本: $(python3 --version)"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 首次运行，正在创建虚拟环境..."
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo "❌ 虚拟环境创建失败"
        exit 1
    fi
    
    echo "✅ 虚拟环境创建成功"
fi

# 激活虚拟环境
echo ""
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 检查依赖
if [ ! -f "venv/installed.flag" ]; then
    echo ""
    echo "📥 安装依赖包（首次运行需要几分钟）..."
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    
    touch venv/installed.flag
    echo "✅ 依赖安装完成"
fi

# 启动服务
echo ""
echo "🚀 启动ChatTTS服务..."
echo "================================"
echo "📍 服务地址: http://localhost:9527"
echo "📖 API文档: 查看 README.md"
echo "⏹️  停止服务: 按 Ctrl+C"
echo "================================"
echo ""

python server.py
