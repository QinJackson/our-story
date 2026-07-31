# 《我们的故事》项目交接与协作日志

> **项目状态**: 活跃开发中  
> **仓库**: https://github.com/QinJackson/our-story  
> **线上地址**: https://qinjackson.github.io/our-story/  
> **协作模式**: 多 AI 模型（海鸥 / GLM 5.2）共享此日志轮换维护

---

## 📋 一、项目概览

| 项目 | 内容 |
|------|------|
| 项目名称 | 《我们的故事》 |
| 项目类型 | 手机端 H5 双人纪念空间（互动数字礼物） |
| 技术栈 | HTML5 + CSS3 + 原生 JavaScript + Canvas 2D |
| 依赖 | 零外部依赖（无框架 / 无 npm / 无 CDN） |
| 兼容 | Chrome / Safari / QQ 内置浏览器 |
| 定位 | 私人定制双人纪念空间，温暖/克制/治愈/有故事感 |

### 核心流程

```
加载画面(5s) → 文字星海(12s) → 汇聚成心(~9s) → "我们的故事"标题(4s)
→ 时间轴(10s) → 头像展示(3.5s+8s) → 照片卡片(4s+8s)
→ MV播放(视频长度) → 最终结尾(10s) → 回归头像+照片界面
```

---

## 🗂️ 二、文件结构

```
/
├── index.html              # 单页入口
├── PROJECT_ANALYSIS.md     # 项目分析报告（旧文档，已过时）
├── PROJECT_LOG.md          # 本文件：项目交接与协作日志 ★
├── css/
│   └── style.css           # 全部样式（玻璃拟态/动画/响应式）
├── js/
│   ├── config.js           # 所有可配置参数（时间/文字/路径/颜色）
│   ├── particle.js         # 粒子系统（尾迹/3D旋转/三层景深）
│   ├── heart.js            # 爱心呼吸+脉冲发光
│   ├── timeline.js         # 时间轴+实时计数器
│   ├── music.js            # 背景音乐管理
│   ├── video.js            # 沉浸MV播放器（花海粒子）
│   ├── transition.js       # 场景过渡动画（fade/radial/wipe）
│   ├── audioVisualizer.js  # 音频可视化（Web Audio API）
│   ├── easterEgg.js        # 彩蛋展示+触摸涟漪
│   └── main.js             # 主控制器（流程编排/性能检测）
├── assets/
│   ├── avatar/  me.jpg + her.jpg       # 情侣头像
│   ├── photo/   1.jpg + 2.jpg + 3.jpg  # 回忆照片（3.jpg已压缩）
│   ├── video/   memory.mp4             # 回忆视频（H.264建议）
│   └── music/   music.mp3              # 背景音乐
└── githubResource/
    └── RESEARCH.md         # GitHub资源调研报告
```

---

## 🔧 三、配置说明（js/config.js）

所有可定制参数集中在 `config.js`：

| 配置段 | 用途 | 关键项 |
|--------|------|--------|
| `timeline` | 时间节点 | firstMeet / becomeCouple |
| `messages` | 文字粒子内容 | 24条温暖语句（含"舟舟，你好"等） |
| `texts` | 各阶段文案 | 标题/时间轴/MV过渡/最终结尾 |
| `paths` | 资源路径 | 头像/照片/视频/音乐 |
| `particles` | 粒子参数 | 数量/大小/速度/汇聚速度 |
| `colors` | 颜色配置 | 色调范围(280-360)/饱和度/明度 |
| `timing` | 各阶段时长 | loadingDuration=5000, floatDuration=12000 等 |
| `performance` | 性能 | retinaScale / autoReduce |

**⚠️ 时间配置注意**：main.js 中时间轴显示(10s)、头像停留(8s)、照片停留(8s) 在部分版本中为硬编码，新模型修改时请统一改为读取 `CONFIG.timing`。

---

## 🚀 四、部署信息

### GitHub 仓库

- **仓库地址**: https://github.com/QinJackson/our-story
- **仓库可见性**: Public（供 GPT 网页版查看）
- **默认分支**: main
- **部署方式**: GitHub Pages（legacy build，直接服务 main 分支）

### GitHub Pages

- **访问地址**: https://qinjackson.github.io/our-story/
- **部署状态**: ✅ 已启用（手动 push 后约 2-5 分钟生效）

### 推送命令

```bash
git add -A
git commit -m "描述性提交信息"
git push origin main
```

---

## 📜 五、更新日志

### 2026-07-29 · v1.0 初始版本（海鸥）

**完成内容：**
- ✅ 完整页面流程：加载 → 文字星海 → 爱心汇聚 → 时间轴 → 头像 → 照片 → MV → 最终结尾
- ✅ Canvas 粒子系统（星空/文字/爱心/环绕）
- ✅ 玻璃拟态 UI 设计
- ✅ 实时计数器（认识至今 天/时/分）
- ✅ 背景音乐系统（自动播放尝试+开关+淡入淡出）
- ✅ 沉浸式 MV 播放器（全屏/无UI/文字叠加）
- ✅ 手机震动反馈（navigator.vibrate）
- ✅ Retina 适配 / 响应式布局
- ✅ GitHub Pages 部署

### 2026-07-29 · v1.1 视觉升级（海鸥）

**完成内容：**
- ✅ 粒子尾迹效果（每粒子5帧轨迹环形缓冲）
- ✅ 三层景深星空（远景蓝调/中景白星/近景带光晕）
- ✅ 爱心 3D 旋转（Z轴+透视投影）
- ✅ 增强发光效果（文字双层光晕/轨道粒子光晕）
- ✅ 场景过渡系统（fade/radial/wipe）
- ✅ 音频可视化基础模块（audioVisualizer.js）
- ✅ 性能自适应检测（低帧率自动降级）
- ✅ 加载进度圆环
- ✅ 触摸涟漪反馈
- ✅ MV 花海粒子效果

**修复：**
- 🐛 particle.js `pulseSize` 未定义导致 JS 崩溃
- 🐛 music.js `{once:true}` 监听器导致首次点击后无法重试
- 🐛 照片查看器关闭按钮事件丢失
- 🐛 3.png (7.17MB) 过大导致移动端加载卡死 → 压缩为 3.jpg (834KB)

### 2026-07-31 · 交接文档建立（海鸥）

- ✅ 创建本 PROJECT_LOG.md 交接文档
- ✅ 确认 GitHub 仓库为 Public，供 GPT 网页版查看

---

## ⚠️ 六、已知问题与注意事项

### 当前已知问题

1. **音乐自动播放**：手机浏览器限制自动播放，需用户点击屏幕后播放
2. **视频编码**：memory.mp4 使用 isom 格式，建议转码为 H.264+AAC 保证全平台兼容
3. **照片墙 3.jpg**：已从 7MB PNG 压缩为 834KB JPG，但画质可能下降
4. **音频可视化**：audioVisualizer.js 已创建但未完全接入粒子/爱心动画驱动（particle.js 和 heart.js 中有 `_vizData` 读取逻辑但 main.js 的 updateViz() 可能因 AudioContext 限制不工作）
5. **QQ 内置浏览器**：部分 CSS（backdrop-filter）和 Canvas API（ellipse）可能不支持
6. **PROJECT_ANALYSIS.md**：为旧文档，内容已过时，需在下次更新时同步或删除

### 协作约定

1. 每次修改后**必须**在本文档「更新日志」追加记录
2. 修改 config.js 时注意保持路径与资源文件名一致
3. 新增 JS 模块需在 index.html 中按依赖顺序引用
4. 保持零外部依赖原则（除非有强理由）
5. 所有 JS 使用 ES5 兼容语法（var/function/for），避免箭头函数/模板字符串/解构赋值
6. 修改后推送 GitHub，Pages 自动部署

---

## 🎯 七、后续优化方向

### 高优先级

1. [ ] 音频可视化实际驱动粒子/爱心动画（打通 audioVisualizer → particle/heart 链路）
2. [ ] 视频转码为 H.264+AAC 标准格式
3. [ ] 场景切换过渡动画实际接入（transition.js 已存在但 main.js 未完全调用）
4. [ ] 更新 PROJECT_ANALYSIS.md 或删除

### 中优先级

5. [ ] 加载预加载策略（提前加载视频首帧/音乐/图片）
6. [ ] 移动端触摸交互增强（滑动照片墙/双指缩放）
7. [ ] 3D 照片墙（Three.js 按需加载）
8. [ ] 多语言支持

### 低优先级

9. [ ] PWA 支持（添加到桌面）
10. [ ] 分享卡片生成
11. [ ] 数据统计（谁看了/看了多久）

---

## 🤝 八、协作说明

### 给后续 AI 模型的提示

1. **先读本文档**：了解项目全貌和最近更新
2. **检查最新代码**：不要只依赖文档描述，以实际代码为准
3. **修改后更新日志**：在「更新日志」追加一行，说明改了什么
4. **遵守 ES5 语法**：所有 JS 保持 var/function/for 风格
5. **资源路径**：assets/ 下的文件路径在 config.js 中配置，修改文件时同步更新配置

### 给人类用户的提示

- 每次让不同模型修改前，建议说一句「先读 PROJECT_LOG.md」
- 修改完成后让模型在日志中记录变更
- 有冲突时以「最新日志」为准

---

*End of Log — 欢迎下一个模型在此继续*
