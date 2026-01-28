import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { getTTSService } from '@/utils/tts';

interface TTSControlProps {
  onEnabledChange?: (enabled: boolean) => void;
}

export const TTSControl: React.FC<TTSControlProps> = ({ onEnabledChange }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  const tts = getTTSService();

  useEffect(() => {
    if (!tts.isSupported()) {
      alert('您的浏览器不支持语音合成功能，请使用Chrome、Edge或Safari浏览器。');
    }
  }, []);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    tts.setEnabled(newEnabled);
    onEnabledChange?.(newEnabled);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    tts.setRate(newRate);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(e.target.value);
    setPitch(newPitch);
    tts.setPitch(newPitch);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    tts.setVolume(newVolume);
  };

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
    }}>
      {/* 主控制按钮 */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={handleToggle}
          style={{
            padding: '10px 20px',
            background: isEnabled ? '#2ecc71' : '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
          }}
          title={isEnabled ? '关闭语音' : '开启语音'}
        >
          {isEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          {isEnabled ? '语音开启' : '语音关闭'}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: '10px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="语音设置"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          background: 'white',
          border: '1px solid #bdc3c7',
          borderRadius: '8px',
          padding: '20px',
          minWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#2c3e50',
          }}>
            语音设置
          </h3>

          {/* 语速控制 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#34495e',
              fontWeight: 'bold',
            }}>
              语速: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#7f8c8d',
              marginTop: '4px',
            }}>
              <span>慢速 0.5x</span>
              <span>正常 1.0x</span>
              <span>快速 2.0x</span>
            </div>
          </div>

          {/* 音调控制 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#34495e',
              fontWeight: 'bold',
            }}>
              音调: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={handlePitchChange}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#7f8c8d',
              marginTop: '4px',
            }}>
              <span>低音 0.5</span>
              <span>正常 1.0</span>
              <span>高音 2.0</span>
            </div>
          </div>

          {/* 音量控制 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#34495e',
              fontWeight: 'bold',
            }}>
              音量: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#7f8c8d',
              marginTop: '4px',
            }}>
              <span>静音 0%</span>
              <span>最大 100%</span>
            </div>
          </div>

          {/* 提示信息 */}
          <div style={{
            padding: '10px',
            background: '#ecf0f1',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#7f8c8d',
            lineHeight: '1.6',
          }}>
            <strong>提示：</strong>语音讲解会在每个算法步骤自动播放。
            您可以随时调整语速、音调和音量。
          </div>
        </div>
      )}
    </div>
  );
};

export default TTSControl;
