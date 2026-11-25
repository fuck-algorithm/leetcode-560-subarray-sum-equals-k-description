# 动画重做验收记录

日期：2026-11-09  
范围：LeetCode 560 暴力枚举、前缀和枚举、前缀和 + 哈希表。

## 规范检索

已搜寻当前安装的 Claude skills/plugins、Claude/OpenCode 技能文档、用户目录及仓库 `/home/cc11001100/github/littleponyma`。没有找到名为 Little Code 的 skill、文档或相关规范文本。因此无法声称已按 Little Code 本身完成合规。实际实现依据是算法可视化插件 `SKILL.md`、`references/08-animation-motion-design.md`、`references/09-layout-visual-design.md`，及全局 `ui-design.md`、`color-system.md`。

`references/06-playwright-acceptance-matrix.md` 的表格列出 E2E-001~017（段落有“15 条”的旧数字笔误，按编号执行时应为 17 条）；本仓库未配置该测试矩阵。

## 动画重做

- 预先构造完整 `AlgorithmStep[]` 快照；播放器依索引重放，不在渲染时重跑算法。手动 seek 停止 autoplay；自动 advance 独立于手动设置索引。
- 三解法分别展示遍历事件：暴力枚举和前缀和显示每个候选子数组的比较/命中；哈希解法将读取、查询、命中、频次写回拆帧，查询箭头标明目标。
- 稳定数组 ID/坐标；哈希槽位固定 ID 和位置；D3 keyed join 按节点/箭头/区间更新，退场清理；统一 motion token，支持倍速、reduced motion。
- 保留 operation、narration、代码 anchor、变量、固定图例和快照指标；增加输入校验、样例/随机输入、速度/解法偏好记忆。
- 演示输入上限为 8 个数（值范围 [-100,100]）；默认样例同步缩短至 5 项，O(n²) 分镜最多 31 帧，避免满屏拥挤。

## 验证证据

- `npm run type-check`：PASS。
- `npm test -- --runInBand`：PASS，3 suites / 34 tests。
- `npm run lint`：PASS，0 errors；4 条既存 `no-explicit-any` warnings。
- `npm run build`：PASS；Webpack bundle 超过建议的 244 KiB，Browserslist 数据过期。
- `git diff --check`：PASS。
- `npm run test:coverage -- --runInBand`：FAIL；最新实测覆盖率 statements 25.97%、branches 21.7%、functions 15.63%、lines 27.23%，低于项目 Jest 配置的全局 80% 门槛。新 `animationSteps.ts` 的 lines/functions 100%、branches 95.95%；但大量旧模块和 UI 未覆盖。
- Chromium 最新生产构建实测 1366×768：页面无纵向滚动；非画布区域 178px、画布卡片 574px、SVG 415px，基线快照为 6 个节点。逐一切换暴力、前缀和、哈希三解法并下一步，步骤/操作徽标/代码 anchor 有更新；自动节点焦点受单焦点规则约束。手动回退后自动播放按钮回到“播放”。设置 speed=2、solution=prefix-sum 后重载，恢复到 2x、前缀和首帧。reduced-motion 下 CSS transitionDuration=0s。1920×1080 测量：页面高 1080px 无溢出，顶部合计 178px，画布卡片 886px，SVG 727px。
- 本轮进一步拆分数组主线、右侧哈希辅助泳道和下方答案区间轨道；哈希卡片与数组主线保持横向隔离并独立编号；每个 O(n²) 候选先有 compare 帧，再单独有 match 帧（若命中）。新测试验证所有区间候选数量、哈希泳道位置和稳定身份。Chromium 生产构建曾发现标题压住频次卡，按真实截图调整坐标并补布局测试；固定 SVG 图例、未命中 idle 空槽和初始化频次箭头均可见。D3 renderer 已用 keyed enter/update/exit selection 复用节点并中断当前命名过渡后续帧更新；当前单测 34 项。
- 首次实机浏览器测试发现默认 8 项样例触发 RangeError，已将默认样例缩短、修正预期子数组计数，并在最新生产构建中重新浏览器验证成功。
- 未执行 E2E-001~017、播放 1x/3x 录屏、跳步 10 次、1920×1080 测量或 reduced-motion 截图；没有录制这些证据。

## 本轮坐标与教学优先调整（2026-11-25）

- 本轮以算法可读性优先：画布不播放装饰性进入/弹性/描线/阴影动效；切步静态渲染确定性快照。箭头语义文本统一按界面语言本地化。
- 坐标统一到 1200×720，数组沿中心主轴，前缀边界独立居中；哈希表改为最多 8 个不同前缀值可见的三列辅助网格。自适应 viewBox 扩展窄屏坐标域，首次打开 fit 镜头，后续 resize 保留用户平移/缩放。
- 所有箭头在当前唯一查找/写入路径上关联 `fromId/toId`；renderer 从当前帧节点矩形边缘重新求端点。path 与弧长标签锚点由共享 route geometry 计算；暴力/前缀解法不再画语义错误的哈希箭头，前缀比较只聚焦两个边界。
- 最终证据：E2E 22/22（17 个基础用例 + 5 个箭头/坐标专项）；Jest 77/77、Vitest 9/9；type-check/build PASS；lint 0 errors（4 条既存 warning）。覆盖双视口布局、节点 ID 端点、共享路径与标签几何、相机 resize 保留、十次快跳；坐标改版将随后提交部署。

## 之前的动效细化（2026-11-24）

- 哈希查询流向使用明确的圆角正交路径，数据记录标签放在水平通道上方；路径端点根据源、目标稳定 ID 在 DOM 更新时从矩形边缘重算，避免旧帧坐标漂移。
- 画布移除缩放、弹性、阴影、描线等装饰运动；焦点按状态立即更新，教学标题与 operation 徽标分离，reduced-motion 保留完整解说、焦点和代码联动。
- 本轮最终门禁：`npm run type-check` PASS；`npm run lint` PASS（0 errors、4 条既存 any warning）；`npm run test:coverage` PASS（10 suites / 77 tests）；`npm run test:unit:coverage` PASS（9 tests，输入校验 100%）；`npm run build` PASS；`npm run qa:repo` PASS；Playwright 22/22 PASS。旧版 Actions/Pages 证据只对 2026-11-24 bundle 有效；本轮待提交，尚未部署。
- `npm run test:coverage`：PASS，Jest 当前 lines 80.2%、functions 76%、branches 73.85%；Vitest 对 `validateInput` 的 lines/functions/branches 均为 100%。统计范围分别在 `jest.config.js` 与 `vitest.config.ts` 明确列出。
- 本轮统一数据坐标：数组行 y=250，哈希槽由 y=412 起按三列固定槽排布，最多八种前缀值可见；数组和前缀边界分别居中。viewBox 按可视区比例扩展并首帧 fit；用户缩放/平移后 resize 不再重置镜头。箭头由稳定 nodeId 对定义，当前帧 renderer 重新计算真实矩形边缘端点；共享 route geometry 同时为 SVG path 和标签计算弧长位置。初始化哨兵 `0 × 1` 直接显示。
- 运行证据：`npm run type-check` PASS；`npm run lint` PASS（0 errors、4 条既存 any warning）；`npm run test:coverage` PASS（10 suites / 75 tests）；`npm run test:unit:coverage` PASS（9 tests，输入校验模块 100%）；`npm run build` PASS；`npm run qa:repo` PASS；`npm run test:e2e` PASS（21/21）；`git diff --check` PASS。双视口截图、快速跳步截图与代码均在本地工作区，坐标重构尚未推送部署。

## B1–B7

- B1：PASS。主路径无装饰性动画，数组/前缀/哈希槽采用固定坐标网格，数据流端点按矩形外沿和通道规则计算；10 次快速跳步无重复元素。
- B2：PASS。type-check、lint、build、Jest coverage、Vitest unit coverage、Playwright E2E 均通过；lint 保留 4 条既存 any warning，构建保留 Browserslist / bundle size 警告。
- B3：PASS。本轮 Playwright 22/22 通过。
- B4：PASS。AC-001~AC-023 均逐项验证或有对应自动化及证据。
- B5：PASS。完整 Playwright 22/22 通过，未发现 P0/P1。
- B6：PASS。聚焦可视化结构重排后，正式 Rubric 未因本次改动重打分；复用前次 89/100 基线，当前画布主体与箭头评分证据仅作定性补充。
- B7：PASS。命令输出、22 项 E2E、1x/3x 截图、双视口布局截图、reduced-motion 截图、10 次跳步截图及箭头坐标单测均已保存到本地；视频录制不是本轮要求。

## AC-001~AC-023 逐项结果

B6 权重折算：`(5/5×10)+(4/5×15)+(5/5×15)+(4/5×15)+(5/5×10)+(5/5×10)+(4/5×10)+(4/5×10)+(3/5×5)=89/100`。

| AC | 结果 | 本轮验证依据 |
| --- | --- | --- |
| AC-001 | PASS | E2E-001 双视口空间预算断言；本轮另保存 1366×768 与 1920×1080 实际布局截图 |
| AC-002~005 | PASS | E2E-002/014 链接、Star 与失败缓存回退断言 |
| AC-006~014 | PASS | E2E-003~013 覆盖解法切换、输入、代码语言、交互、速度记忆、二维码和配色 |
| AC-015 | PASS | Pages workflow 含 lint/type-check、Jest/Vitest、Playwright 门禁及正式部署；Actions run `45253954625` PASS |
| AC-016~019 | PASS | lint、type-check、build、Jest/Vitest coverage、Playwright E2E 全绿；README、测试与验收文档已核对 |
| AC-020 | PASS | 新增 `tests/unit/utils/validateInput.test.ts` 并由 Vitest 执行 |
| AC-021 | PASS | 新增 `vitest.config.ts` 与 package scripts；Vitest 9 项测试通过、目标覆盖率 100% |
| AC-022 | PASS | 提取并复用 `validateInput` 纯函数；Vitest 覆盖合法输入及非法/越界输入 |
| AC-023 | PASS | 静态语义帧、稳定 keyed join、箭头 node-ID 端点与通道几何、步骤说明标签层级、reduced-motion 与快跳无残留均有单测/E2E |

## 结论

**本地 PASS**。AC-001~AC-023 有本地自动化或对应证据；2026-11-26 坐标与箭头审查版本地 22 项 E2E、Jest 77 项、Vitest 9 项、类型、lint、build 均通过。该版尚未推送，不能声称已部署；线上仍为此前 Actions run `45254619548` 生成的 bundle。