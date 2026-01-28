/**
 * 混合TTS服务
 * 优先使用ChatTTS，降级到浏览器原生TTS
 */

import { getChatTTSService } from './chatTTS';
import { getTTSService } from './tts';

export class HybridTTSService {
  private chatTTS = getChatTTSService();
  private nativeTTS = getTTSService();
  private useChatTTS: boolean = false;
  private isInitialized: boolean = false;

  /**
   * 初始化并检测可用的TTS服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🔍 检测TTS服务...');
    
    // 检查ChatTTS是否可用
    const chatTTSAvailable = await this.chatTTS.checkHealth();
    
    if (chatTTSAvailable) {
      this.useChatTTS = true;
      console.log('✅ 使用ChatTTS高质量语音');
    } else {
      this.useChatTTS = false;
      console.log('ℹ️ 使用浏览器原生TTS');
    }

    this.isInitialized = true;
  }

  /**
   * 朗读文本（自动选择最佳TTS）
   */
  async speak(text: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.useChatTTS) {
        await this.chatTTS.speak(text);
      } else {
        await this.nativeTTS.speak(text);
      }
    } catch (error) {
      console.error('TTS错误，切换到备用方案:', error);
      // ChatTTS失败，降级到原生TTS
      if (this.useChatTTS) {
        this.useChatTTS = false;
        await this.nativeTTS.speak(text);
      }
    }
  }

  /**
   * 停止朗读
   */
  stop() {
    this.chatTTS.stop();
    this.nativeTTS.stop();
  }

  /**
   * 暂停朗读
   */
  pause() {
    if (this.useChatTTS) {
      this.chatTTS.pause();
    } else {
      this.nativeTTS.pause();
    }
  }

  /**
   * 恢复朗读
   */
  resume() {
    if (this.useChatTTS) {
      this.chatTTS.resume();
    } else {
      this.nativeTTS.resume();
    }
  }

  /**
   * 设置ChatTTS温度参数
   */
  setTemperature(temperature: number) {
    this.chatTTS.setTemperature(temperature);
  }

  /**
   * 设置原生TTS参数
   */
  setRate(rate: number) {
    this.nativeTTS.setRate(rate);
  }

  setPitch(pitch: number) {
    this.nativeTTS.setPitch(pitch);
  }

  setVolume(volume: number) {
    this.nativeTTS.setVolume(volume);
  }

  /**
   * 启用/禁用
   */
  setEnabled(enabled: boolean) {
    this.chatTTS.setEnabled(enabled);
    this.nativeTTS.setEnabled(enabled);
  }

  /**
   * 检查是否正在播放
   */
  isSpeaking(): boolean {
    return this.chatTTS.isSpeaking() || this.nativeTTS.isSpeaking();
  }

  /**
   * 获取当前使用的TTS类型
   */
  getCurrentTTSType(): 'ChatTTS' | 'Native' {
    return this.useChatTTS ? 'ChatTTS' : 'Native';
  }

  /**
   * 手动切换TTS类型
   */
  async switchTTS(type: 'ChatTTS' | 'Native'): Promise<boolean> {
    if (type === 'ChatTTS') {
      const available = await this.chatTTS.checkHealth();
      if (available) {
        this.useChatTTS = true;
        return true;
      }
      return false;
    } else {
      this.useChatTTS = false;
      return true;
    }
  }
}

// 单例
let hybridTTSInstance: HybridTTSService | null = null;

export function getHybridTTSService(): HybridTTSService {
  if (!hybridTTSInstance) {
    hybridTTSInstance = new HybridTTSService();
  }
  return hybridTTSInstance;
}
