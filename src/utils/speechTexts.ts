/**
 * 算法步骤的详细语音讲解文本
 */

export interface StepExplanation {
  title: string;
  description: string;
  speechText: string;
  visualTips?: string[];
}

/**
 * 哈希表算法的详细讲解
 */
export const hashMapExplanations = {
  introduction: {
    title: '算法介绍',
    description: '前缀和加哈希表是解决子数组和问题的最优方法',
    speechText: `
      嘿！大家好！今天我们要学习一个超级厉害的算法——前缀和加哈希表！
      这可是解决"和为K的子数组"问题的最优解法哦！时间复杂度只需要O(n)，简直太棒了！
      
      那么，这个算法的核心思想是什么呢？
      其实很简单：如果当前的前缀和，减去K之后的那个值，曾经在哈希表里出现过，
      那就说明，一定存在一个子数组，它的和正好等于K！是不是很神奇？
      
      我们用哈希表来记录每个前缀和出现的次数，
      这样只需要O(1)的时间，就能查到有多少个符合条件的子数组啦！
      
      准备好了吗？让我们开始这段精彩的算法之旅吧！
    `,
    visualTips: [
      '注意观察右侧的哈希表，它会实时显示前缀和的变化',
      '蓝色高亮表示正在处理的元素',
      '绿色高亮表示找到了符合条件的子数组',
    ],
  },

  initialization: {
    title: '初始化阶段',
    description: '创建哈希表并初始化',
    speechText: `
      好的！首先呢，我们要初始化一个哈希表，
      并且，要在里面放入一个特殊的键值对：0对应1。
      
      你可能会问，为什么要放0呢？
      这是个非常聪明的技巧！因为啊，如果数组从开头一直加到某个位置，前缀和刚好等于K，
      那么从数组开头到当前位置的这整个子数组，就是我们要找的答案呀！
      
      记住哦：哈希表的键，是前缀和；值，是这个前缀和出现的次数！
      明白了吗？那我们继续往下走！
    `,
  },

  stepByStep: (index: number, value: number, prefixSum: number, target: number, found: number) => ({
    title: `处理第${index + 1}个元素`,
    description: `当前元素: ${value}, 当前前缀和: ${prefixSum}`,
    speechText: `
      好！现在来看第${index + 1}个元素，它的值是${value}${value > 0 ? '，是个正数' : value < 0 ? '，是个负数' : '，是零'}。
      
      第一步呢，我们要计算当前的前缀和。
      怎么算呢？很简单！把之前的前缀和，加上当前这个元素的值，
      算出来就是 ${prefixSum} 啦！
      
      第二步，计算目标值！
      我们要找的目标值是什么呢？就是用当前前缀和 ${prefixSum}，减去K，
      得到 ${target}。
      
      第三步，关键来了！在哈希表中查找这个目标值！
      ${found > 0 
        ? `哇！找到了！太棒了！目标值 ${target} 在哈希表中出现了 ${found} 次！
           这意味着什么呢？意味着有 ${found} 个以当前位置结尾的子数组，它们的和正好等于K！
           快！把计数器加上 ${found}！`
        : `嗯...目标值 ${target} 在哈希表中没找到，
           也就是说，暂时还没有以当前位置结尾、和为K的子数组。没关系，继续找！`
      }
      
      第四步，更新哈希表！
      现在把当前的前缀和 ${prefixSum} 记录到哈希表里，
      如果它已经存在了，就把它的计数加1！
      
      ${found > 0 ? '耶！又找到符合条件的子数组了！真是太好了！' : '好的，继续处理下一个元素吧！'}
    `,
    visualTips: [
      `当前元素 ${value} 用黄色高亮显示`,
      `哈希表中的目标值 ${target} 会特别标记`,
      found > 0 ? '绿色表示找到匹配' : '继续处理下一个元素',
    ],
  }),

  completion: (totalCount: number) => ({
    title: '算法完成',
    description: `找到了${totalCount}个符合条件的子数组`,
    speechText: `
      太棒了！算法执行完毕啦！让我们庆祝一下！
      
      你猜怎么着？我们总共找到了 ${totalCount} 个和为K的子数组${totalCount > 5 ? '！数量还不少呢！' : totalCount > 0 ? '！' : '。虽然没找到，但算法执行得很完美！'}
      
      现在，让我来帮你总结一下这个超棒的算法吧！
      
      第一个要点：前缀和的妙用！
      记住哦，任意子数组的和，其实都可以用两个前缀和的差值来表示。这个技巧简直太聪明了！
      
      第二个要点：哈希表的威力！
      有了哈希表，我们只需要O(1)的时间，就能瞬间查到某个前缀和是否出现过！快得不可思议吧？
      
      第三个要点：一遍搞定！
      我们一边计算前缀和，一边在哈希表中查询和更新，
      只需要遍历数组一次！时间复杂度只有O(n)！
      
      相比暴力解法那慢吞吞的O(n²)，我们这个算法简直快了不知道多少倍！
      
      怎么样？是不是觉得算法特别有意思？继续加油学习吧！
    `,
    visualTips: [
      '所有找到的子数组都会用不同颜色标记',
      '最终的哈希表包含了所有前缀和的信息',
      '时间复杂度 O(n)，空间复杂度 O(n)',
    ],
  }),
};

/**
 * 前缀和算法的详细讲解
 */
export const prefixSumExplanations = {
  introduction: {
    title: '前缀和算法介绍',
    description: '使用前缀和数组优化子数组和的计算',
    speechText: `
      现在让我们学习前缀和算法。
      
      这个算法的核心思想是：预先计算好每个位置的前缀和，
      然后通过两个前缀和的差值，快速计算任意子数组的和。
      
      公式是：子数组[i,j]的和 等于 前缀和[j+1] 减去 前缀和[i]。
      
      虽然这个算法还是需要两层循环，时间复杂度是O(n²)，
      但比暴力解法要好，因为我们避免了重复计算子数组和。
    `,
  },
};

/**
 * 暴力解法的详细讲解
 */
export const bruteForceExplanations = {
  introduction: {
    title: '暴力解法介绍',
    description: '枚举所有可能的子数组',
    speechText: `
      首先，让我们看看最直观的暴力解法。
      
      这个方法很简单：用两层循环枚举所有可能的子数组，
      然后计算每个子数组的和，看是否等于K。
      
      外层循环确定子数组的起始位置，
      内层循环确定子数组的结束位置。
      
      虽然这个方法容易理解，但时间复杂度是O(n²)，
      当数组很大的时候，效率会比较低。
      
      不过，作为学习的起点，暴力解法能帮助我们理解问题的本质。
    `,
  },
};

/**
 * 关键概念讲解
 */
export const conceptExplanations = {
  prefixSum: {
    title: '什么是前缀和？',
    description: '前缀和是指从数组开头到当前位置所有元素的累加和',
    speechText: `
      嘿！让我来告诉你什么是前缀和，这可是个超级实用的概念！
      
      前缀和呢，说白了，就是从数组的第一个元素开始，
      一直加、一直加，加到当前位置为止，所有元素的总和！
      
      来看个例子吧！假如数组是 [1, 2, 3, 4]，
      那么各个位置的前缀和是这样的：
      位置0：就是1，对吧？
      位置1：1加2，等于3！
      位置2：1加2加3，等于6！
      位置3：全加起来，1加2加3加4，等于10！
      
      有了前缀和这个神器，我们就能超快地算出任意子数组的和啦！
      比如说，要算[2,3]的和，只要用前缀和6减去前缀和1，就得到5啦！是不是很棒？
    `,
  },

  hashMap: {
    title: '为什么用哈希表？',
    description: '哈希表能在O(1)时间内查询和更新',
    speechText: `
      那你一定很好奇，为什么我们非要用哈希表呢？
      
      告诉你个秘密！哈希表有一个超级、超级强大的特性：
      不管哈希表里有多少数据，1个、100个、还是10000个，
      查询和插入操作都只需要O(1)的时间！就是一瞬间！简直不可思议吧？
      
      在我们这个问题中啊，需要频繁地查询某个前缀和是不是出现过。
      如果用普通数组，每次查询都要O(n)的时间，太慢了！
      但是！用哈希表呢？只需要O(1)！嗖的一下就查完了！
      
      这就是为什么，前缀和加哈希表的神仙组合，
      能把时间复杂度从慢吞吞的O(n²)，优化到飞快的O(n)！
      哈希表，简直就是算法优化的超级英雄！
    `,
  },

  subarraySum: {
    title: '子数组和的计算',
    description: '理解子数组和与前缀和的关系',
    speechText: `
      好！现在让我们来聊聊，子数组的和到底是怎么算出来的！
      
      假设啊，我们要算从位置i到位置j这一段的和。
      如果傻傻地一个一个加，需要遍历i到j的每个元素，时间复杂度就是O(j减i)，很慢！
      
      但是！如果我们有前缀和这个秘密武器呢？情况就完全不一样啦！
      子数组从i到j的和，等于什么呢？就是前缀和j，减去前缀和i减1！
      
      这样一来，不管子数组有多长，100个元素也好，1000个元素也罢，
      我们都只需要一次减法操作！一次！就搞定了！
      
      来看个实例吧：数组[1,2,3,4]，要算[2,3]这段的和。
      前缀和1是3，前缀和3是10，对吧？
      子数组和就是10减3，等于7！
      我们验证一下：3加4，确实等于7！完美！
      
      看到没？前缀和就是这么神奇！
    `,
  },
};

/**
 * 获取步骤的语音文本
 */
export function getSpeechText(
  algorithmType: 'brute-force' | 'prefix-sum' | 'hash-map',
  stepType: 'introduction' | 'step' | 'completion',
  data?: any
): string {
  switch (algorithmType) {
    case 'hash-map':
      if (stepType === 'introduction') {
        return hashMapExplanations.introduction.speechText;
      } else if (stepType === 'completion') {
        return hashMapExplanations.completion(data?.totalCount || 0).speechText;
      } else if (stepType === 'step' && data) {
        return hashMapExplanations.stepByStep(
          data.index,
          data.value,
          data.prefixSum,
          data.target,
          data.found
        ).speechText;
      }
      break;
    case 'prefix-sum':
      return prefixSumExplanations.introduction.speechText;
    case 'brute-force':
      return bruteForceExplanations.introduction.speechText;
  }
  return '';
}
