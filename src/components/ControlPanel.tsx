import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import { RootState } from '@/store';
import {
  startAnimation,
  pauseAnimation,
  resetAnimation,
  stepForward,
  stepBackward,
  setAlgorithm,
  setPlaybackSpeed,
} from '@/store/subarraySumSlice';

export const ControlPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { isPlaying, currentAlgorithm, playbackSpeed, inputData, currentStep, animationState } =
    useSelector((state: RootState) => state.subarraySum);

  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pauseAnimation());
    } else {
      dispatch(startAnimation());
    }
  };

  const handleReset = () => {
    dispatch(resetAnimation(inputData));
  };

  const handleStepForward = () => {
    dispatch(stepForward());
  };

  const handleStepBackward = () => {
    dispatch(stepBackward());
  };

  const handleAlgorithmChange = (algorithm: 'brute-force' | 'prefix-sum' | 'hash-map') => {
    dispatch(setAlgorithm(algorithm));
  };

  const handleSpeedChange = (speed: number) => {
    dispatch(setPlaybackSpeed(speed));
  };

  return (
    <div className="control-panel" style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* 后退按钮 */}
      <button
        onClick={handleStepBackward}
        disabled={currentStep === 0}
        style={{
          padding: '14px 24px',
          background: currentStep === 0 ? '#334155' : '#475569',
          color: currentStep === 0 ? '#64748b' : '#f1f5f9',
          border: '2px solid',
          borderColor: currentStep === 0 ? '#1e293b' : '#64748b',
          borderRadius: '12px',
          cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px',
          fontWeight: '600',
          transition: 'all 0.2s',
          opacity: currentStep === 0 ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (currentStep !== 0) {
            e.currentTarget.style.background = '#64748b';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentStep !== 0) {
            e.currentTarget.style.background = '#475569';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <SkipBack size={20} />
        后退
      </button>

      {/* 前进按钮 - 最醒目 */}
      <button
        onClick={handleStepForward}
        disabled={animationState.isComplete}
        style={{
          padding: '18px 36px',
          background: animationState.isComplete 
            ? '#334155' 
            : 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          border: '3px solid',
          borderColor: animationState.isComplete ? '#1e293b' : '#34d399',
          borderRadius: '16px',
          cursor: animationState.isComplete ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: animationState.isComplete 
            ? 'none' 
            : '0 4px 20px rgba(16, 185, 129, 0.5)',
          transition: 'all 0.2s',
          opacity: animationState.isComplete ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!animationState.isComplete) {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          if (!animationState.isComplete) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.5)';
          }
        }}
      >
        前进
        <SkipForward size={24} />
      </button>

      {/* 播放/暂停按钮 */}
      <button
        onClick={handlePlayPause}
        disabled={animationState.isComplete}
        style={{
          padding: '14px 28px',
          background: animationState.isComplete 
            ? '#334155' 
            : isPlaying 
            ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
            : 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: 'white',
          border: '2px solid',
          borderColor: animationState.isComplete 
            ? '#1e293b' 
            : isPlaying ? '#f87171' : '#60a5fa',
          borderRadius: '12px',
          cursor: animationState.isComplete ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px',
          fontWeight: '600',
          transition: 'all 0.2s',
          opacity: animationState.isComplete ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!animationState.isComplete) {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!animationState.isComplete) {
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isPlaying ? (
          <>
            <Pause size={20} />
            暂停
          </>
        ) : (
          <>
            <Play size={20} />
            播放
          </>
        )}
      </button>

      {/* 重置按钮 */}
      <button
        onClick={handleReset}
        style={{
          padding: '14px 24px',
          background: '#6366f1',
          color: 'white',
          border: '2px solid #818cf8',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#818cf8';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#6366f1';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <RotateCcw size={20} />
        重置
      </button>
    </div>
  );
};

export default ControlPanel;
