# 《我们的故事》项目交接与协作日志

> **项目状态**:活跃开发中
> **仓库**:https://github.com/QinJackson/our-story
> **线上地址**:https://qinjackson.github.io/our-story/
> **协作模式**:多 AI 模型(海鸥 / GLM 5.2)共享本日志轮转维护
> **文件编码**:UTF-8(2026-07-31 v2.1 起统一为 UTF-8,修复历史 GBK 乱码)

---

## 📖 一、项目概览
| 项目 | 内容 |
|------|------|
| 项目名称 | 《我们的故事》 |
| 项目类型 | 手机端 H5 双人纪念空间(互动数字礼物) |
| 技术栈 | HTML5 + CSS3 + 原生 JavaScript + Canvas 2D |
| 依赖 | 零外部依赖(无框架 / 无 npm / 无 CDN) |
| 兼容 | Chrome / Safari / QQ 内置浏览器 |
| 定位 | 私人定制双人纪念空间,温暖/克制/治愈/有故事感 |

### 核心流程

```
加载画面(5s) → 文字星海(12s) → 汇聚成心(~9s) → "我们的故事"标题(4s)
→ 时间轴(10s) → 头像展示(3.5s+8s) → 照片卡片(4s+8s)
→ MV播放(视频长度) → 最终结尾(10s) → 回归头像+照片
                                            ↓
                            [window.__showHome() 触发]
                                            ↓
                            首页仪表盘 + 底部导航(日记/心情/相册/未来信)
```

---

## 🗂 二、文件结构
```
/
├── index.html              # 单页入口
├── PROJECT_ANALYSIS.md     # 项目分析报告(当前版本同步至 v2.1)
├── PROJECT_LOG.md          # 本文件:项目交接与协作日志
├── .gitignore
├── css/
│   └── style.css           # 全部样式(玻璃拟态/动画/响应式)
├── js/
│   ├── config.js           # 所有可配置参数(时间/文字/路径/颜色)
│   ├── particle.js         # 粒子系统(三层景深/3D旋转/文字汇聚成心)
│   ├── heart.js            # 爱心呼吸+脉冲发光(已接入音频可视化)
│   ├── timeline.js         # 时间轴+实时计数器
│   ├── music.js            # 背景音乐管理(淡入淡出/自动播放策略)
│   ├── video.js            # 沉浸MV播放器(花瓣海粒子)
│   ├── transition.js       # 场景过渡动画(fade/radial/wipe)⚠️尚未接入主流程
│   ├── audioVisualizer.js  # 音频可视化(Web Audio API,已接入驱动爱心)
│   ├── easterEgg.js        # 彩蛋展示+触摸消歧+点击涟漪
│   ├── diary.js            # Phase3:日记模块(故事书翻页)
│   ├── futureLetter.js     # Phase3:未来信件(日期解锁)
│   ├── mood.js             # Phase3:心情记录(Emoji+统计)
│   ├── gallery.js          # Phase3:回忆相册(收集日记照片)
│   ├── home.js             # Phase3:首页仪表盘(协调四个子模块)
│   └── main.js             # 主控制器(流程编排/性能嗅探/可视化驱动)
├── data/
│   └── diary.json          # 日记数据源(intro/entries/futureLetter)
├── assets/
│   ├── avatar/  me.jpg + her.jpg       # 情侣头像
│   ├── photo/   1.jpg + 2.jpg + 3.jpg  # 回忆照片
│   ├── video/   memory.mp4             # 回忆视频(H.264建议)
│   └── music/   music.mp3              # 背景音乐
└── githubResource/
    └── RESEARCH.md         # GitHub资源调研报告
```

---

## ⚙️ 三、配置说明(js/config.js)
所有可定制参数集中在 `config.js`:
| 配置段 | 用途 | 关键项 |
|--------|------|--------|
| `timeline` | 时间节点 | firstMeet / becomeCouple |
| `messages` | 文字粒子内容 | 24条温暖语句 |
| `texts` | 各阶段文案 | 标题/时间轴/MV过渡/最终结尾 |
| `paths` | 资源路径 | 头像/照片/视频/音乐 |
| `particles` | 粒子参数 | 数量/大小/速度/汇聚速度 |
| `colors` | 颜色配置 | 色调范围(280-360)/饱和度/明度 |
| `timing` | 各阶段时长 | loadingDuration=5000, floatDuration=12000 等 |
| `eggs` | 彩蛋触发 | 三击/长按阈值 |
| `performance` | 性能 | retinaScale / targetFPS |

**⚠️ 时间配置注意**:main.js 中时间轴显示(10s)、头像停留(8s)、照片停留(8s)为硬编码,修改时请统一改为读取 `CONFIG.timing`。

---

## 🚀 四、部署信息
### GitHub 仓库
- **仓库地址**: https://github.com/QinJackson/our-story
- **仓库可见性**: Public(供 GPT 网页版查看)
- **默认分支**: main
- **部署方式**: GitHub Pages(legacy build,直接服务 main 分支)

### GitHub Pages
- **访问地址**: https://qinjackson.github.io/our-story/
- **部署状态**: ✅ 已启用(手动 push 后约 2-5 分钟生效)

### 推送命令
```bash
git add -A
git commit -m "描述性提交信息"
git push origin main
```

---

## 📅 五、更新日志

### 2026-07-31 · v2.3 架构重构 + 日记增强 + 粒子优化(GLM)

**架构重构:**
- ✅ [config.js](file:///js/config.js) 统一时间配置:main.js 中所有硬编码时间迁移到 CONFIG.timing
- ✅ [state.js](file:///js/state.js) 新增:统一管理项目状态(phase),支持监听器
- ✅ [storage.js](file:///js/storage.js) 新增:统一存储管理(diary/mood/photo/futureLetter)
  - 封装 localStorage 和 IndexedDB,提供统一 load/save/delete 接口
  - 内部根据数据类型自动分发到对应存储后端
- ✅ [transition.js](file:///js/transition.js) 正式接入主流程
  - 场景切换时调用 TRANSITION.start() 实现过渡动画(fade/radial/wipe)
  - 动画循环中调用 TRANSITION.update(dt) 驱动过渡

**日记增强(核心功能):**
- ✅ [diary.js](file:///js/diary.js) 新增字段:
  - `weather`: 天气选择(☀️⛅☁️🌧⛈❄️🌫🌬)
  - `song`: 歌曲输入(今天在听的歌)
  - 完整字段:date / weather / mood / song / content / photos
- ✅ 编辑器 UI 增加:天气选择按钮组、歌曲输入框
- ✅ 故事书页面显示:心情+天气同行显示、歌曲斜体显示
- ✅ 接入 STORAGE 模块:数据持久化委托统一存储
- ✅ 修复异步初始化:diary 就绪后才创建依赖模块(home/calendar)

**粒子优化:**
- ✅ [particle.js](file:///js/particle.js) 增加粒子生命周期
  - 生命周期:淡入(前15%)→稳定→淡出(后25%)→重生
  - 淡入淡出:基于生命周期计算 alpha
  - 自然运动:多频正弦扰动 + 微小随机加速度 + 速度阻尼
  - 重生机制:生命周期结束后在新位置重生

**验收:**
- ✅ 开场动画正常(观看/跳过选择)
- ✅ 日记正常(含 weather/song 新字段)
- ✅ 相册正常(网格视图)
- ✅ 日历正常(整月显示)
- ✅ 无 JS 错误
- ✅ 新增数据无需修改核心代码(config.js 统一配置)

### 2026-07-31 · v2.2 日历系统 + IndexedDB 图片存储 + 相册重构(GLM)

**新增模块:**
- ✅ 日历系统:[calendar.js](file:///js/calendar.js) 月历视图,聚合日记/心情/照片
  - 日期格子显示心情 emoji(与日期并排) + 日记/照片彩色圆点标记
  - 点击日期查看当天详情(心情/日记/照片),支持直接写日记
  - 月份切换、今天定位、邻月补格
- ✅ IndexedDB 图片存储:[photoStore.js](file:///js/photoStore.js) 封装 IndexedDB 操作
  - 容量远大于 localStorage,支持 save/get/getMany/delete/isPhotoId
  - 日记图片从 localStorage 迁移到 IndexedDB,entry.photos 存 img_ id
  - 异步加载显示,删除日记时同步清理 IndexedDB 图片

**功能优化:**
- ✅ 日记编写:[diary.js](file:///js/diary.js) 支持图片上传(最多6张)、压缩、编辑/删除
- ✅ 加载选择:[main.js](file:///js/main.js) 加载完成后显示"观看开场动画/直接进入"两个按钮
- ✅ 相册重构:[gallery.js](file:///js/gallery.js) 改为两段式:缩略图网格(3列) → 点击全屏放大滑动浏览
- ✅ 日历心情回退:无 MoodManager 记录时,回退显示日记自带的心情
- ✅ 点击遮挡修复:[home.js](file:///js/home.js) 隐藏主流程遗留元素 + 禁用主画布指针事件

**布局调整:**
- 日历格子高度固定 38px,emoji 与日期并排,整月完整可见
- 相册网格 3 列正方形缩略图,全屏查看器黑色背景

### 2026-07-31 · v2.1 致命 Bug 修复 + 音频可视化接入(GLM)

**修复的致命问题:**
- ✅ Phase 3 完全无法启动:[main.js](file:///js/main.js) 未注册 `window.__showHome`,主流程结束后首页/导航/日记/心情/相册全部不可达。已在 init() 末尾注册 `window.__showHome = function() { home.show(); }`
- ✅ 相册打开即崩溃:[gallery.js](file:///js/gallery.js) `_collectPhotos()` 中 `self` 在声明前使用,抛 ReferenceError。已将 `var self = this;` 移到方法开头
- ✅ 心情统计崩溃:[mood.js](file:///js/mood.js) `_renderStats()` 中 `self` 未定义,点击心情后统计区报错。已在方法开头补声明
- ✅ padStart 兼容性:[mood.js](file:///js/mood.js) `_dateKey()` 使用 ES2017 的 `String.padStart`,老安卓/IE 会崩。已改为手动补零

**新增功能:**
- ✅ 音频可视化真正接入:[audioVisualizer.js](file:///js/audioVisualizer.js) 此前是完全的死模块,现在由 [main.js](file:///js/main.js) 实例化并注入 [heart.js](file:///js/heart.js)
  - main.js 创建 `viz = new AudioVisualizer(music.audio)`,主循环每帧调用 `viz.update()`
  - heart.js 构造函数接收 viz,`drawGlow()` 用 `viz.avgFreq` 增强呼吸幅度,`drawBeat()` 用 `viz.lowFreq` 驱动脉冲强度与光波大小
  - audioVisualizer.js 新增 `_bindResume()`:监听首次 touchstart/click 自动 resume AudioContext(应对浏览器自动播放策略)

**文档同步:**
- ✅ PROJECT_LOG.md 由 GBK 转为 UTF-8,修复历史乱码
- ✅ PROJECT_ANALYSIS.md 更新至 v2.1,反映 Phase 3 与音频可视化接入

### 2026-07-31 · v2.0 Phase 3「我们的日记」上线(海鸥)

**新增模块:**
| 模块 | 文件 | 功能 |
|------|------|------|
| 日记 | `js/diary.js` + `data/diary.json` | 故事书翻页日记,JSON 数据源,倒序展示 |
| 未来信件 | `js/futureLetter.js` | 配置解锁日期,到达自动解锁 |
| 心情记录 | `js/mood.js` | Emoji 记录心情 + 统计 + 最近7天 |
| 回忆相册 | `js/gallery.js` | 收集日记照片,全屏滑动浏览 |
| 首页仪表盘 | `js/home.js` | 今日记录卡片 + 底部导航 |

**数据源:** 新增日记只需编辑 `data/diary.json`,无需改代码。日记字段:id / date / title / content / mood / photos

### 2026-07-29 · v1.1 视觉升级(海鸥)
- 粒子尾迹效果、三层景深星空、爱心 3D 旋转、增强发光、场景过渡系统、音频可视化基础模块、性能自适应、加载进度圆环、触摸消歧、MV 花瓣海粒子

### 2026-07-29 · v1.0 初始版本(海鸥)
- 完整页面流程、Canvas 粒子系统、玻璃拟态 UI、实时计数器、背景音乐、沉浸式 MV、手机震动反馈、Retina 适配、GitHub Pages 部署

---

## ⚠️ 六、已知问题与注意事项

### 当前已知问题(v2.1 后剩余)
1. **音乐自动播放**:手机浏览器限制自动播放,需用户点击屏幕后播放(v1.1 称已修 `{once:true}` 但实际仍存在,首次自动播放失败后无法再触发自动播放,只能靠音乐按钮)
2. **视频编码**:memory.mp4 使用 isom 格式,建议转码为 H.264+AAC 保证全平台兼容
3. **QQ 内置浏览器**:部分 CSS(backdrop-filter)和 Canvas API(ellipse)可能不支持
4. **transition.js 未接入**:模块存在但 main.js 从未调用 `TRANSITION.start()`,场景过渡动画实际未生效
5. **file:// 协议日记加载**:[diary.js](file:///js/diary.js) 用 XHR 加载 JSON,Chrome 的 file:// 协议会 CORS 拦截。双击打开 index.html 时日记会加载失败,GitHub Pages 部署正常
6. **照片查看器两套并存**:diary.js 自建 viewer,easterEgg.js 又用 index.html 的 `#photo-viewer`,逻辑重复
7. **ES5/ES6 混用**:particle/heart/music/video/easterEgg 用 ES6 class,Phase 3 模块用 prototype 风格。文档原称"全部 ES5"与实际不符,已在本日志更正

### 协作约定
1. 每次修改后**必须**在本文件「更新日志」追加记录
2. 修改 config.js 时注意保持路径与资源文件名一致
3. 新增 JS 模块需在 index.html 中按依赖顺序引用
4. 保持零外部依赖原则(除非有强理由)
5. 修改后推送 GitHub,Pages 自动部署

---

## 🎯 七、后续优化方向

### 高优先级
1. [ ] 接入 transition.js 场景过渡到主流程(目前是死代码)
2. [ ] 视频转码为 H.264+AAC 标准格式
3. [ ] 统一照片查看器(diary 与 easterEgg 合并)
4. [ ] 修复 music.js `{once:true}` 导致自动播放失败后无法重试

### 中优先级
5. [ ] 加载预加载策略(提前加载视频首帧/音乐/图片)
6. [ ] 移动端触摸交互增强(滑动照片、双指缩放)
7. [ ] 3D 照片墙(Three.js 按需加载)
8. [ ] 多语言支持

### 低优先级
9. [ ] PWA 支持(添加到桌面)
10. [ ] 分享卡片生成
11. [ ] 数据统计(谁看了/看了多久)

---

## 🤝 八、协作说明

### 给后续 AI 模型的提示
1. **先读本文件**:了解项目全貌和最近更新
2. **检查最新代码**:不要只依赖文档描述,以实际代码为准
3. **修改后更新日志**:在「更新日志」追加一行,说明改了什么
4. **资源路径**:assets/ 下的文件路径在 config.js 中配置,修改文件时同步更新配置

### 给人类用户的提示
- 每次让不同模型修改前,建议说一句「先读 PROJECT_LOG.md」
- 修改完成后让模型在日志中记录变更
- 有冲突时以「更新日志」为准

---

## 🤝 九、GLM 交接指南(2026-07-31 添加)

### 三方协作架构(最终版)

```
┌─────────────┐   建议/审查   ┌─────────────┐
│  GPT 网页版  │ ──────────→ │  你(协调人) │
│  (顾问/评审) │ ←────────── │             │
└─────────────┘   转达/确认  └──────┬──────┘
                                    │ 分配实施
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
              ┌─────────────┐  ┌─────────────┐
              │  海鸥(Codex) │  │  GLM 5.2   │
              │   (实施方A)  │  │  (实施方B)  │
              └─────────────┘  └─────────────┘
                     └──────────────┬──────────────┘
                                    ▼
                            ┌─────────────┐
                            │ GitHub 仓库 │
                            │ PROJECT_LOG │
                            └─────────────┘
```

### 分工
| 角色 | 职责 |
|------|------|
| **GPT 网页版** | 读仓库 → 提建议/写提示词/审查方案(不直接改代码) |
| **海鸥(Codex)** | 实施 GPT 的建议,推送代码,更新日志 |
| **GLM 5.2** | 实施 GPT 的建议,推送代码,更新日志(与海鸥轮流) |
| **你(协调人)** | 把 GPT 的建议转达给实施方;把实施结果反馈给 GPT |

### 工作流程
1. GPT 网页版访问仓库 → 给出建议/提示词
2. 你把建议发给海鸥 或 GLM(任选一方实施)
3. 实施方改代码 → 推送 GitHub → 更新 PROJECT_LOG.md
4. 你把结果反馈给 GPT → GPT 审查 → 下一轮建议
5. 双方实施前必须先读 PROJECT_LOG.md,改后必须在日志追加记录

---

*End of Log — 欢迎下一个模型在此继续*
