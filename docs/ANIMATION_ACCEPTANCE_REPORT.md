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

## 本轮动效细化（2026-11-24）

- 哈希查询/频次写入箭头改为二次贝塞尔路径，箭头标签锚定曲线中点；增加几何纯函数单测，并在 E2E-006 中确认哈希帧实际产生 `Q` 曲线路径。
- 新节点以轻微上浮、缩放和淡入出现；既有元素沿命名过渡更新，曲线只在新箭头进入时生长；状态反馈改为柔和阴影与圆角，reduced-motion 下跳过入场和描线。
- 运行证据：`npm run type-check` PASS；`npm run lint` PASS（0 errors、4 条既存 any warning）；`npm run test:coverage` PASS（10 suites / 71 tests，lines 100%、functions 80%、branches 77.31%）；`npm run test:unit:coverage` PASS（9 tests，输入校验模块 100%）；`npm run build` PASS（Webpack 有过期 Browserslist 与 bundle size 警告）；`npm run test:e2e` PASS（17 个基础用例 + 4 个动效验收，共 21/21）；`git diff --check` PASS。
- `npm run test:coverage`：PASS，按 Jest 配置纳入算法及产品工具模块统计；实测 lines 100%、functions 80%、branches 77.31%，高于要求的 60%/60%/50%。覆盖率范围及被排除的未使用旧组件均在 `jest.config.js` 和本报告明确列出。
- 本轮真实页面检查期间修复节点入场状态回调错误及 reduced-motion 快速切帧时退场残留。新增浏览器覆盖 reduced-motion 信息保持、哈希查询曲线、10 次快跳无重复元素和 1x/3x 播放；Playwright 全部 21/21 通过，生成曲线帧截图（1366×768、1920×1080）、reduced-motion 截图、1x/3x 播放截图及录像，均保存在 `test-results/motion-acceptance-*`。另新增快速切换 prefers-reduced-motion 时中断节点 enter transition 的保护，避免已进入动画继续推进。

## B1–B7

- B1：PASS。主路径已支持贝塞尔流向、平滑入场/状态反馈、稳定 keyed join、reduced-motion 降级和 10 次快速跳步无重复节点。
- B2：PASS。type-check、lint、build、Jest coverage、Vitest unit coverage、Playwright E2E 均通过；lint 保留 4 条既存 any warning，构建保留 Browserslist / bundle size 警告。
- B3：PASS。本轮 Playwright 21/21 通过。
- B4：PASS。AC-001~AC-023 均逐项验证或有对应自动化及证据。
- B5：PASS。完整 Playwright 21/21 通过，未发现 P0/P1。
- B6：PASS。Rubric 九项按 0–5 评分：首屏信息架构 5/5、分镜清晰度 4/5、代码同步 5/5、画布信息密度 4/5、交互可控性 5/5、多解法可比性 5/5、稳定性 4/5、工程发布质量 4/5、文档完整性 3/5；按权重折算 89/100。
- B7：PASS。命令输出记录、21 项 E2E、1x/3x 录像、双视口曲线截图、reduced-motion 截图、10 次跳步测试、trace 及缺陷闭环均已留存。

## AC-001~AC-023 逐项结果

B6 权重折算：`(5/5×10)+(4/5×15)+(5/5×15)+(4/5×15)+(5/5×10)+(5/5×10)+(4/5×10)+(4/5×10)+(3/5×5)=89/100`。

| AC | 结果 | 本轮验证依据 |
| --- | --- | --- |
| AC-001 | PASS | E2E-001 双视口空间预算及单屏断言、截图 |
| AC-002~005 | PASS | E2E-002/014 链接、Star 与失败缓存回退断言 |
| AC-006~014 | PASS | E2E-003~013 覆盖解法切换、输入、代码语言、交互、速度记忆、二维码和配色 |
| AC-015 | PASS | Pages workflow 含部署步骤、lint/type-check、Jest/Vitest、Playwright CI 门禁；`qa:repo` PASS |
| AC-016~019 | PASS | lint、type-check、build、Jest/Vitest coverage、Playwright E2E 全绿；README、测试与验收文档已核对 |
| AC-020 | PASS | 新增 `tests/unit/utils/validateInput.test.ts` 并由 Vitest 执行 |
| AC-021 | PASS | 新增 `vitest.config.ts` 与 package scripts；Vitest 9 项测试通过、目标覆盖率 100% |
| AC-022 | PASS | 提取并复用 `validateInput` 纯函数；Vitest 覆盖合法输入及非法/越界输入 |
| AC-023 | PASS | 曲线箭头、状态焦点、稳定 keyed join、退出清理、reduced-motion、快跳与播放均有 E2E 及截图/录像 |

## 结论

**PASS**。AC-001~AC-023 均有对应自动化或明确证据；动效、单测目录、Vitest 配置及输入校验单测全部已补齐。本地代码尚未推送至 GitHub。