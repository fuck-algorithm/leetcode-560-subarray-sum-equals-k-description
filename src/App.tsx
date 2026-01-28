import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { stepForward, stepBackward, startAnimation, pauseAnimation, resetAnimation } from '@/store/subarraySumSlice';
import ArrayVisualizer from '@/components/ArrayVisualizer';
import HashTableVisualizer from '@/components/HashTableVisualizer';
import StepExplanation from '@/components/StepExplanation';
import ControlPanel from '@/components/ControlPanel';
import { COMPLEXITY_INFO } from '@/utils/constants';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { animationState, isPlaying, playbackSpeed, currentStep, inputData } =
    useSelector((state: RootState) => state.subarraySum);

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying || animationState.isComplete) return;

    const interval = setInterval(() => {
      dispatch(stepForward());
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, animationState.isComplete, dispatch]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框中触发
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch(e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (!animationState.isComplete) {
            dispatch(stepForward());
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentStep > 0) {
            dispatch(stepBackward());
          }
          e.preventDefault();
          break;
        case ' ':
        case 'Enter':
          if (!animationState.isComplete) {
            if (isPlaying) {
              dispatch(pauseAnimation());
            } else {
              dispatch(startAnimation());
            }
          }
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          dispatch(resetAnimation(inputData));
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, currentStep, isPlaying, animationState.isComplete, inputData]);

  // 获取当前步骤的数据
  const getCurrentStepData = () => {
    if (currentStep === 0) {
      return {
        currentValue: undefined,
        prefixSum: 0,
        target: undefined,
        found: undefined,
      };
    }
    
    const currentValue = animationState.arrayElements[currentStep - 1]?.value;
    const prefixSum = animationState.hashMap?.currentSum || 0;
    const target = animationState.hashMap?.targetKey;
    const found = target !== undefined ? (animationState.hashMap?.hashMap.get(target) || 0) : 0;
    
    return { currentValue, prefixSum, target, found };
  };

  // 计算前缀和数组
  const getPrefixSums = () => {
    const sums: number[] = [];
    let sum = 0;
    for (let i = 0; i < Math.min(currentStep, inputData.nums.length); i++) {
      sum += inputData.nums[i];
      sums.push(sum);
    }
    return sums;
  };

  const stepData = getCurrentStepData();
  const prefixSums = getPrefixSums();

  return (
    <div style={{
      height: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header with stats */}
      <div style={{
        padding: '16px 32px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: currentStep === 0 || animationState.isComplete ? '12px' : '0',
        }}>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#f1f5f9',
              marginBottom: '2px',
            }}>
              LeetCode 560: 和为K的子数组
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
            }}>
              找出有多少组连续的数字加起来等于目标值
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '20px',
          }}>
            <div style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '10px',
              border: '2px solid #34d399',
            }}>
              <span style={{ color: '#d1fae5', fontSize: '12px', fontWeight: '600' }}>目标和 </span>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>{inputData.k}</span>
            </div>
            <div style={{
              padding: '10px 16px',
              background: animationState.totalCount > 0 
                ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                : '#0f172a',
              borderRadius: '10px',
              border: animationState.totalCount > 0 ? '2px solid #fbbf24' : '2px solid #334155',
            }}>
              <span style={{ 
                color: animationState.totalCount > 0 ? '#fef3c7' : '#64748b', 
                fontSize: '12px',
                fontWeight: '600' 
              }}>找到 </span>
              <span style={{ 
                color: animationState.totalCount > 0 ? '#fff' : '#94a3b8', 
                fontWeight: 'bold', 
                fontSize: '18px' 
              }}>{animationState.totalCount}</span>
            </div>
          </div>
        </div>
        
        {/* 初始提示 - 只在第一步显示 */}
        {currentStep === 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '10px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid #60a5fa',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          }}>
            <span style={{ fontSize: '20px' }}>👇</span>
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '2px',
              }}>
                点击底部的“前进”按钮开始演示
              </div>
              <div style={{
                color: '#dbeafe',
                fontSize: '12px',
              }}>
                右侧会显示每一步的详细说明 · 快捷键：→ 前进 ← 后退 空格 播放/暂停
              </div>
            </div>
          </div>
        )}
        
        {/* 完成提示 - 只在完成时显示 */}
        {animationState.isComplete && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '10px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid #34d399',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            animation: 'slideDown 0.5s ease-out',
          }}>
            <span style={{ fontSize: '24px' }}>🎉</span>
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: 'bold',
                marginBottom: '2px',
              }}>
                演示完成！找到了 {animationState.totalCount} 个和为 {inputData.k} 的子数组
              </div>
              <div style={{
                color: '#d1fae5',
                fontSize: '13px',
              }}>
                点击"重置"按钮重新观看 · 快捷键：R
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gap: '16px',
        padding: '16px',
        overflow: 'hidden',
      }}
      className="main-content"
      >
        {/* Left panel - Visualizations */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflow: 'auto',
        }}>
          {/* Array Visualizer */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '16px',
            border: '2px solid #334155',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '24px' }}>🔢</span>
              <span style={{
                color: '#f1f5f9',
                fontSize: '18px',
                fontWeight: 'bold',
              }}>数字列表</span>
              <div style={{
                marginLeft: 'auto',
                fontSize: '13px',
                color: '#64748b',
                fontWeight: '600',
              }}>
                <span style={{ color: '#3b82f6' }}>■</span> 正数 
                <span style={{ marginLeft: '12px', color: '#ef4444' }}>■</span> 负数
                <span style={{ marginLeft: '12px', color: '#f59e0b' }}>◆</span> 正在看
              </div>
            </div>
            <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
              <ArrayVisualizer
                elements={animationState.arrayElements}
                width={Math.max(900, animationState.arrayElements.length * 90)}
                height={200}
                prefixSums={prefixSums}
                currentIndex={currentStep > 0 ? currentStep - 1 : -1}
                targetSum={inputData.k}
              />
            </div>
          </div>

          {/* Hash Table Visualizer */}
          {animationState.showHashTable && (
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '16px',
              border: '2px solid #334155',
            }}>
              <HashTableVisualizer hashMapState={animationState.hashMap} k={inputData.k} />
            </div>
          )}
        </div>

        {/* Right panel - Step explanation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'auto',
          paddingRight: '4px',
        }}>
          {/* 简单原理说明 - 只在开始时显示 */}
          {currentStep === 0 && (
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '16px',
              border: '2px solid #334155',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <span style={{
                  color: '#f1f5f9',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}>核心思路</span>
              </div>
              <div style={{
                color: '#cbd5e1',
                fontSize: '13px',
                lineHeight: '1.6',
              }}>
                <div style={{ marginBottom: '12px' }}>
                  假设我们要找和为 <span style={{ color: '#10b981', fontWeight: 'bold' }}>{inputData.k}</span> 的连续数字。
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#f59e0b' }}>关键技巧：</strong><br/>
                  如果从开头到位置A的总和是 <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>X</span>，<br/>
                  从开头到位置B的总和是 <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Y</span>，<br/>
                  那么从A到B的和就是：<span style={{ color: '#10b981', fontWeight: 'bold' }}>Y - X</span>
                </div>
                <div style={{
                  padding: '12px',
                  background: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                }}>
                  <strong style={{ color: '#3b82f6' }}>所以我们：</strong><br/>
                  1️⃣ 边走边算总和<br/>
                  2️⃣ 把总和记到"记事本"上<br/>
                  3️⃣ 每次查找"记事本"看之前有没有合适的总和<br/>
                  4️⃣ 一遍就能找到所有答案！
                </div>
              </div>
            </div>
          )}
          
          <StepExplanation
            step={currentStep}
            totalSteps={inputData.nums.length}
            currentValue={stepData.currentValue}
            prefixSum={stepData.prefixSum}
            target={stepData.target}
            found={stepData.found}
            k={inputData.k}
          />
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        padding: '20px',
        background: '#1e293b',
        borderTop: '1px solid #334155',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <ControlPanel />
      </div>
    </div>
  );
};

export default App;
