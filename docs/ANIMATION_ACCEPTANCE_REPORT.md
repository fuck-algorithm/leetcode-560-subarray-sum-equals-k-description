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

## B1–B7

- B1：FAIL。主动画路径处理紫色与整屏刷新，但外围旧组件未完整审计。
- B2：FAIL。type-check、unit、lint、build 通过；coverage 80% 门槛失败；test:e2e 未配置。
- B3：FAIL。Playwright 必过集未执行。
- B4：FAIL。AC-001~AC-024 未逐条验证；AC-023 缺播放与 reduced-motion 证据。
- B5：未确认。没有全量 E2E 不能签署 P0/P1 为 0。
- B6：未评分。缺少完整视觉和交互证据。
- B7：FAIL。缺 E2E 报告、录屏、跨分辨率截图与 trace。

## 结论

**FAIL（不宣称完成）**。修改仅在本地工作树，未提交、未部署；线上网站仍为旧版。本地目前找不到 Little Code skill，故用户指定规范这一项无法确认已满足。