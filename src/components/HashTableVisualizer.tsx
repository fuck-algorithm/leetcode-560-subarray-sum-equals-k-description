import React from 'react';
import { HashMapState } from '@/types';

interface HashTableVisualizerProps {
  hashMapState?: HashMapState;
  k?: number;
}

export const HashTableVisualizer: React.FC<HashTableVisualizerProps> = ({ hashMapState, k = 0 }) => {
  if (!hashMapState) return null;

  const entries = Array.from(hashMapState.hashMap.entries()).sort((a, b) => a[0] - b[0]);
  const targetCount = hashMapState.hashMap.get(hashMapState.targetKey) || 0;

  return (
    <div style={{ width: '100%' }}>
      {/* 标题和查询逻辑说明 */}
      <div style={{
        background: '#0f172a',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '2px solid #334155',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}>
          <span style={{ fontSize: '20px' }}>📓</span>
          <span style={{
            color: '#f1f5f9',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>记事本（记录看过的总和）</span>
        </div>

        {/* 查询逻辑说明 */}
        {hashMapState.currentSum > 0 && (
          <div style={{
            background: '#1e293b',
            borderRadius: '8px',
            padding: '10px',
            marginTop: '8px',
          }}>
            <div style={{
              color: '#f59e0b',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
            }}>
              🤔 我在想什么
            </div>
            <div style={{
              color: '#cbd5e1',
              fontSize: '13px',
              lineHeight: '1.8',
            }}>
              <div style={{ marginBottom: '6px' }}>
                💭 现在总和是 <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{hashMapState.currentSum}</span>
              </div>
              <div style={{ marginBottom: '6px' }}>
                💭 要找的和是 <span style={{ color: '#10b981', fontWeight: 'bold' }}>{k}</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                💭 所以我需要找"之前总和是 <span style={{ color: '#ec4899', fontWeight: 'bold' }}>{hashMapState.targetKey}</span> 的位置"
              </div>
              <div style={{
                padding: '10px',
                background: targetCount > 0 ? '#065f46' : '#334155',
                borderRadius: '6px',
                color: targetCount > 0 ? '#10b981' : '#94a3b8',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                {targetCount > 0 
                  ? `✅ 找到了 ${targetCount} 次记录！这意味着找到了 ${targetCount} 组答案`
                  : `❌ 记事本里没有找到 ${hashMapState.targetKey}`}
              </div>
              {targetCount > 0 && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: '#0f172a',
                  borderRadius: '6px',
                  color: '#10b981',
                  fontSize: '12px',
                  lineHeight: '1.6',
                }}>
                  💡 <strong>为什么？</strong><br/>
                  如果之前某个位置的总和是 {hashMapState.targetKey}，<br/>
                  那从那个位置到现在，中间的数字加起来就是：<br/>
                  {hashMapState.currentSum} - {hashMapState.targetKey} = {k} ✓
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 哈希表内容标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <span style={{
          color: '#cbd5e1',
          fontSize: '14px',
          fontWeight: '600',
        }}>📝 记事本内容（总和 → 出现次数）</span>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {entries.map(([key, count]) => {
          const isTarget = key === hashMapState.targetKey;
          const isCurrent = key === hashMapState.currentKey;
          
          return (
            <div
              key={key}
              style={{
                background: isTarget 
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : isCurrent
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : '#404b63',
                borderRadius: '8px',
                padding: '12px 16px',
                minWidth: '80px',
                boxShadow: isTarget || isCurrent 
                  ? '0 8px 24px rgba(245, 158, 11, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                transform: isTarget || isCurrent ? 'scale(1.05)' : 'scale(1)',
                border: isTarget ? '2px solid #fbbf24' : isCurrent ? '2px solid #34d399' : 'none',
              }}
            >
              <div style={{
                fontSize: '11px',
                color: isTarget || isCurrent ? '#fef3c7' : '#94a3b8',
                marginBottom: '4px',
                fontWeight: '600',
              }}>
                {isTarget ? '🎯 正在找这个' : isCurrent ? '✨ 刚记下的' : '总和'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
              }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                  {key}
                </span>
                <span style={{
                  fontSize: '13px',
                  color: isTarget || isCurrent ? '#fef3c7' : '#94a3b8',
                }}>
                  ×{count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#64748b',
          padding: '40px',
          background: '#334155',
          borderRadius: '12px',
          border: '2px dashed #475569',
        }}>
          哈希表为空
        </div>
      )}
    </div>
  );
};

export default HashTableVisualizer;
