/**
 * TTS (Text-To-Speech) 语音合成工具
 * 使用浏览器原生 Web Speech API
 */

export class TTSService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isEnabled: boolean = true;
  private rate: number = 0.9; // 语速（稍慢一点更自然）
  private pitch: number = 1.1; // 音调（稍高一点更活泼）
  private volume: number = 1.0; // 音量

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    
    // 监听语音列表变化（某些浏览器需要）
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  /**
   * 加载可用的语音列表
   */
  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  /**
   * 获取中文语音
   */
  private getChineseVoice(): SpeechSynthesisVoice | null {
    // 优先选择中文语音
    const chineseVoice = this.voices.find(
      voice => voice.lang === 'zh-CN' || voice.lang.startsWith('zh')
    );
    
    return chineseVoice || this.voices[0] || null;
  }

  /**
   * 朗读文本
   */
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled) {
        resolve();
        return;
      }

      // 停止当前朗读
      this.stop();

      // 创建新的语音对象
      this.utterance = new SpeechSynthesisUtterance(text);
      
      // 设置语音参数
      const voice = this.getChineseVoice();
      if (voice) {
        this.utterance.voice = voice;
      }
      
      this.utterance.rate = this.rate;
      this.utterance.pitch = this.pitch;
      this.utterance.volume = this.volume;
      this.utterance.lang = 'zh-CN';

      // 监听事件
      this.utterance.onend = () => {
        resolve();
      };

      this.utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        reject(event);
      };

      // 开始朗读
      this.synthesis.speak(this.utterance);
    });
  }

  /**
   * 停止朗读
   */
  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  /**
   * 暂停朗读
   */
  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  /**
   * 恢复朗读
   */
  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * 设置语速 (0.1 - 10)
   */
  setRate(rate: number) {
    this.rate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * 设置音调 (0 - 2)
   */
  setPitch(pitch: number) {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  /**
   * 设置音量 (0 - 1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 启用/禁用TTS
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * 检查是否支持TTS
   */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * 检查是否正在朗读
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * 获取可用的语音列表
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// 单例模式
let ttsInstance: TTSService | null = null;

export function getTTSService(): TTSService {
  if (!ttsInstance) {
    ttsInstance = new TTSService();
  }
  return ttsInstance;
}
