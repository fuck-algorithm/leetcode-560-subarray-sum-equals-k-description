import React from 'react';

interface StepExplanationProps {
  step: number;
  totalSteps: number;
  currentValue?: number;
  prefixSum?: number;
  target?: number;
  found?: number;
  k?: number;
}

export const StepExplanation: React.FC<StepExplanationProps> = ({
  step,
  totalSteps,
  currentValue,
  prefixSum,
  target,
  found,
  k,
}) => {
  const getExplanation = () => {
    if (step === 0) {
      return {
        icon: '👉',
        title: '开始',
        action: '点击"前进"按钮开始',
        description: `目标：找出有多少组连续的数字加起来等于 ${k}`,
        keyPoints: [
          '我会从左到右，一个一个看数组里的数字',
          '用一个"记事本"（哈希表）记住我看过的和',
          '当发现匹配的时候，就找到了一组答案'
        ],
        details: [
          { label: '要找的和', value: `${k}`, color: '#10b981' },
          { label: '进度', value: '准备开始', color: '#64748b' },
        ],
        formula: undefined,
      };
    } else if (currentValue !== undefined && prefixSum !== undefined && target !== undefined) {
      const isFound = found && found > 0;
      
      // 构建更通俗的说明
      const simpleExplanation = isFound
        ? `太好了！之前我记录过和为 ${target} 的情况。\n这意味着从那个位置到现在这个位置，所有数字加起来正好等于 ${k}！`
        : `现在从开头到这里的总和是 ${prefixSum}。\n我需要找"之前有没有总和是 ${target} 的位置"。\n因为如果有的话，那个位置到现在的和就是 ${k} 了。\n可惜这次没找到，继续往下看...`;
      
      return {
        icon: isFound ? '🎯' : '🔍',
        title: `看第 ${step} 个数：${currentValue}`,
        action: isFound ? `✅ 找到了 ${found} 组答案！` : '正在寻找...',
        description: simpleExplanation,
        keyPoints: isFound ? [
          `当前总和 ${prefixSum} - 之前的总和 ${target} = ${k} ✓`,
          `这说明中间这段数字加起来正好等于 ${k}`,
          `记下当前总和 ${prefixSum}，继续找下一个`
        ] : [
          `看到数字 ${currentValue}`,
          `加上之前的，现在总和是 ${prefixSum}`,
          `查找"记事本"看有没有 ${target}`,
          `把 ${prefixSum} 记到"记事本"上`
        ],
        details: [
          { label: '当前数字', value: `${currentValue}`, color: '#f59e0b' },
          { label: '累计总和', value: `${prefixSum}`, color: '#8b5cf6' },
          { label: isFound ? '找到✓' : '在找', value: isFound ? `${found}组` : `需要${target}`, color: isFound ? '#10b981' : '#ec4899' },
        ],
        formula: `${prefixSum} - ${k} = ${target}`,
      };
    }
    
    return {
      icon: '🎉',
      title: '全部找完了',
      action: '任务完成',
      description: `找到了所有和为 ${k} 的连续数字组合`,
      keyPoints: [
        `遍历了数组中的每个数字`,
        `用"记事本"快速查找，避免重复计算`,
        `比暴力枚举快得多（只需要看一遍）`
      ],
      details: [],
      formula: undefined,
    };
  };

  const explanation = getExplanation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {/* 操作提示卡片 - 最醒目 */}
      <div style={{
        background: explanation.icon === '🎯' 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : explanation.icon === '🎉'
          ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
          : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: '12px',
        padding: '16px',
        border: explanation.icon === '🎯' ? '2px solid #34d399' : explanation.icon === '🎉' ? '2px solid #a78bfa' : '2px solid #60a5fa',
        boxShadow: explanation.icon === '🎯' 
          ? '0 4px 20px rgba(16, 185, 129, 0.4)' 
          : explanation.icon === '🎉'
          ? '0 4px 20px rgba(139, 92, 246, 0.4)'
          : '0 4px 20px rgba(59, 130, 246, 0.3)',
        animation: explanation.icon === '🎯' ? 'pulse 0.5s ease-in-out' : 'none',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ 
            fontSize: '36px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}>{explanation.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '2px',
            }}>
              {explanation.title}
            </div>
            <div style={{
              color: '#dbeafe',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              {explanation.action}
            </div>
          </div>
        </div>
      </div>

      {/* 当前状态说明 */}
      <div style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '16px',
        border: '2px solid #334155',
      }}>
        <div style={{
          color: '#f1f5f9',
          fontSize: '14px',
          marginBottom: '12px',
          lineHeight: '1.6',
        }}>
          {explanation.description}
        </div>

        {/* 关键步骤列表 */}
        {explanation.keyPoints && explanation.keyPoints.length > 0 && (
          <div style={{
            background: '#0f172a',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #1e293b',
          }}>
            {explanation.keyPoints.map((point, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '6px 0',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                <span style={{
                  color: '#3b82f6',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  {point.startsWith('✓') ? '✓' : '▸'}
                </span>
                <span>{point.replace(/^✓\s*/, '')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 数据指标 */}
      {explanation.details.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {explanation.details.map((detail, idx) => (
            <div
              key={idx}
              style={{
                background: '#1e293b',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #334155',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                marginBottom: '6px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {detail.label}
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: detail.color,
              }}>
                {detail.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 公式 */}
      {explanation.formula && (
        <div style={{
          background: '#1e293b',
          padding: '12px',
          borderRadius: '8px',
          border: '2px solid #334155',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '10px',
            color: '#64748b',
            marginBottom: '6px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}>
            计算公式
          </div>
          <div style={{
            fontFamily: 'monospace',
            color: '#f1f5f9',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>
            {explanation.formula}
          </div>
        </div>
      )}

      {/* 进度指示 */}
      <div style={{
        background: '#1e293b',
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #334155',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{
            fontSize: '11px',
            color: '#64748b',
            fontWeight: '600',
          }}>
            执行进度
          </span>
          <span style={{
            fontSize: '13px',
            color: '#f1f5f9',
            fontWeight: 'bold',
          }}>
            {step} / {totalSteps}
          </span>
        </div>
        <div style={{
          height: '6px',
          background: '#0f172a',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
            width: `${(step / totalSteps) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
    </div>
  );
};

export default StepExplanation;
