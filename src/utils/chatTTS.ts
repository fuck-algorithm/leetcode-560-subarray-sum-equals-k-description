/**
 * ChatTTS 客户端
 * 调用本地ChatTTS服务进行高质量语音合成
 */

export class ChatTTSService {
  private serverUrl: string;
  private isEnabled: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;
  private temperature: number = 0.3;

  constructor(serverUrl: string = 'http://localhost:9527') {
    this.serverUrl = serverUrl;
  }

  /**
   * 检查服务是否可用
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        mode: 'cors',
      });
      return response.ok;
    } catch (error) {
      console.warn('ChatTTS服务不可用，将使用浏览器原生TTS');
      return false;
    }
  }

  /**
   * 朗读文本
   */
  async speak(text: string): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      // 停止当前播放
      this.stop();

      // 调用ChatTTS API
      const response = await fetch(`${this.serverUrl}/tts`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          temperature: this.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`ChatTTS服务错误: ${response.status}`);
      }

      // 获取音频数据
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // 播放音频
      this.currentAudio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.currentAudio) {
          reject(new Error('音频创建失败'));
          return;
        }

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        this.currentAudio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        this.currentAudio.play().catch(reject);
      });

    } catch (error) {
      console.error('ChatTTS错误:', error);
      throw error;
    }
  }

  /**
   * 停止朗读
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  /**
   * 暂停朗读
   */
  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  /**
   * 恢复朗读
   */
  resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  /**
   * 设置温度参数（控制语音变化程度）
   */
  setTemperature(temperature: number) {
    this.temperature = Math.max(0.1, Math.min(1.0, temperature));
  }

  /**
   * 启用/禁用
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * 检查是否正在播放
   */
  isSpeaking(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}

// 单例
let chatTTSInstance: ChatTTSService | null = null;

export function getChatTTSService(): ChatTTSService {
  if (!chatTTSInstance) {
    chatTTSInstance = new ChatTTSService();
  }
  return chatTTSInstance;
}
