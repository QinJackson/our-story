# 《我们的故事》—— 项目分析报告

> 生成日期:2026-07-31(同步至 v2.1)
> 项目类型:手机端 H5 双人纪念空间
> 运行方式:单页面,零依赖,浏览器直接打开(推荐部署 GitHub Pages 以保证日记 JSON 正常加载)

---

## 一、项目定位

私人定制的「双人纪念空间」H5 页面。
不是普通表白网页,定位为**高级数字礼物 / 互动纪念册**。

整体情绪:温暖 · 克制 · 治愈 · 陪伴 · 有故事感。

---

## 二、技术栈

| 层 | 选型 |
|---|---|
| 渲染 | HTML5 + CSS3 + Canvas 2D |
| 动画循环 | requestAnimationFrame(60FPS) |
| 交互 | 原生 JavaScript(零框架) |
| 音频 | Web Audio API(AnalyserNode 频谱分析) |
| 字体 | -apple-system, PingFang SC, SF Pro Display |
| 依赖 | 纯前端,无需后端 / 无需 npm / 无需 CDN |

**代码风格说明**:核心动画层(particle / heart / music / video / easterEgg)使用 ES6 `class` 语法;Phase 3 功能层(diary / home / mood / gallery / futureLetter / audioVisualizer)使用构造函数 + prototype 风格。两者通过 `window.*` 全局挂载协作,运行时无冲突。

---

## 三、项目结构

```
/
├── index.html                 ← 单页入口
├── PROJECT_ANALYSIS.md        ← 本文档
├── PROJECT_LOG.md             ← 交接与协作日志(UTF-8)
├── css/
│   └── style.css              ← 玻璃拟态 + 动画 + 响应式
├── js/
│   ├── config.js              ← 所有可配置参数
│   ├── particle.js            ← 粒子系统(三层景深/3D旋转/文字汇聚成心)
│   ├── heart.js               ← 爱心呼吸+脉冲(已接入音频可视化)
│   ├── timeline.js            ← 时间轴 + 实时计数器
│   ├── music.js               ← 背景音乐管理
│   ├── video.js               ← 沉浸 MV 播放器
│   ├── transition.js          ← 场景过渡(fade/radial/wipe)⚠️尚未接入主流程
│   ├── audioVisualizer.js     ← 音频可视化(已接入驱动爱心)
│   ├── easterEgg.js           ← 彩蛋 + 头像/照片/MV 触发 + 点击涟漪
│   ├── diary.js               ← Phase3:日记(故事书翻页)
│   ├── futureLetter.js        ← Phase3:未来信件(日期解锁)
│   ├── mood.js                ← Phase3:心情记录(localStorage 持久化)
│   ├── gallery.js             ← Phase3:回忆相册(收集日记照片)
│   ├── home.js                ← Phase3:首页仪表盘(协调四个子模块)
│   └── main.js                ← 主控制器(流程编排 + 可视化驱动)
├── data/
│   └── diary.json             ← 日记数据源(intro/entries/futureLetter)
└── assets/
    ├── avatar/     me.jpg + her.jpg     (情侣头像)
    ├── photo/      1.jpg + 2.jpg + 3.jpg (回忆照片)
    ├── video/      memory.mp4           (回忆视频,竖屏)
    └── music/      music.mp3            (背景音乐)
```

---

## 四、核心功能模块

### A. 动画引擎层(Phase 1-2)

#### 1. 粒子系统(ParticleSystem · particle.js)
| 元素 | 数量 | 说明 |
|------|------|------|
| 星空粒子 | 80 颗 | 随机位置/大小/速度,闪烁效果 |
| 三层景深星空 | 85 颗 | far(30)/mid(40)/near(15),近层带光晕 |
| 文字粒子 | 24 条 | 彩色温暖语句,HUE 280°–360° 紫红粉色系,带 5 帧尾迹 |
| 爱心粒子 | 2000 个 | 沿 x=16sin(t)³, y=13cos(t)-5cos(2t)-2cos(3t)-cos(4t) 参数方程分布,带 z 轴深度 |
| 环绕粒子 | 60 颗 | 绕爱心轨道旋转 |
| 光晕 | 12 个 | 漂浮的径向渐变光斑 |

状态机:`loading → floating → converging → heart/timeline`,通过 `setPhase()` 切换。

#### 2. 爱心动画(HeartAnimation · heart.js)
- 呼吸效果:sin 波控制缩放,振幅 8%,**叠加音频 avgFreq 增强**
- 脉冲光波:心跳节奏扩散,**叠加音频 lowFreq 驱动强度与大小**
- 闪烁轮廓粒子:30 颗在爱心边缘
- 3D 旋转:rotation3D 绕轴旋转 + 透视投影

#### 3. 时间轴(TimelineManager · timeline.js)
- 2 个时间节点卡片(玻璃拟态)
- 相识时间:2026-07-23 04:31 / 情侣关系:2026-07-27
- 实时计数器:天 / 时 / 分,RAF 驱动每帧更新

#### 4. 沉浸 MV 播放器(VideoManager · video.js)
- 无 UI 全屏播放 / 播放前过渡文字 / 播放中叠加温暖文字(渐显渐隐)
- 背景音乐自动暂停 / 恢复 / 自动降级静音播放

#### 5. 背景音乐(MusicManager · music.js)
- 自动播放尝试(被拦截时显示播放按钮)/ 淡入淡出 / 循环播放
- 音频元素被 AudioVisualizer 接管路由(analyser → destination)

#### 6. 彩蛋系统(EasterEggManager · easterEgg.js)
- 头像展示:两张头像从两侧出现,缓慢靠近,光环环绕
- 照片卡片:三张照片扇形分布,点击放大
- 最终结尾:渐显双行文字 → 回归头像+照片 → 触发 `window.__showHome()`
- 全局点击涟漪 + 触摸震动反馈

### B. Phase 3 功能层(我们的日记)

#### 7. 首页仪表盘(HomeManager · home.js)
- 主流程结束后由 `window.__showHome()` 触发显示
- 今日记录卡片(展示最新日记) + 底部导航(首页/日记/心情/相册)
- 协调四个子模块的打开/关闭与返回回调

#### 8. 日记(DiaryManager · diary.js)
- XHR 加载 `data/diary.json`,倒序展示(最新在前)
- 故事书翻页动画(flip-in/flip-out)
- 封面 + 日记页(每页一篇) + 封底「未完待续」
- 照片点击放大查看

#### 9. 心情记录(MoodManager · mood.js)
- 8 种 Emoji 心情选项(开心/心动/美好/平静/甜蜜/低落/疲惫/兴奋)
- localStorage 持久化(key: `ourstory_moods`)
- 统计:总数 + 各心情占比条形图 + 最近 7 天记录
- 同一天覆盖旧记录

#### 10. 回忆相册(GalleryManager · gallery.js)
- 自动收集 `CONFIG.paths.photos` + 日记中的所有照片(去重)
- 全屏滑动浏览(支持触摸滑动 + 桌面拖拽)
- 圆点指示器 + 计数

#### 11. 未来信件(FutureLetterManager · futureLetter.js)
- 数据来自 diary.json 的 futureLetter 字段
- 解锁逻辑:`now >= new Date(unlockDate + 'T00:00:00+08:00')`
- 锁定状态显示倒计时(天/时/分,每分钟更新),到点自动重开

### C. 已存在但未接入的模块

#### 12. 场景过渡(TRANSITION · transition.js)
- 支持 fade / radial / wipe 三种过渡
- ⚠️ 模块完整但 main.js 从未调用 `TRANSITION.start()`,实际未生效

#### 13. 音频可视化(AudioVisualizer · audioVisualizer.js)
- ✅ v2.1 已接入:由 main.js 实例化,每帧 `update()` 读取频谱
- 输出 `avgFreq / lowFreq / midFreq / highFreq / beat` 五个指标
- 注入 HeartAnimation 驱动呼吸与脉冲

---

## 五、完整流程(时间线)

```
[加载画面] ...................... 5s
  ↓
[文字星海漂浮] ................. 12s
  24条彩色文字随机漂浮,三层星空闪烁
  ↓
[汇聚成爱心] ................... ~9s
  文字粒子可见地飘向心形(z 轴 3D 旋转)
  ↓
[「我们的故事」标题] ........... 4s
  ↓
[时间轴] ....................... 10s
  两张玻璃卡片 + 实时计数器
  ↓
[头像展示] ..................... 3.5s 动画 + 8s 停留
  ↓
[照片卡片] ..................... 4s 动画 + 8s 停留
  ↓
[MV 播放] ...................... 视频长度
  头像照片隐藏,背景音乐暂停
  ↓ 视频结束 → 音乐恢复
[最终结尾] ..................... 10s
  「谢谢你来到我的世界。」
  「愿以后的每一天,都能成为新的纪念日。」
  ↓ 淡出
[回归界面] ..................... 头像 + 照片卡片重新显示
  ↓
[window.__showHome() 触发] ..... 首页仪表盘 + 底部导航出现
  ↓
[Phase 3 持续可用] ............. 日记 / 心情 / 相册 / 未来信
```

---

## 六、音频可视化数据流(v2.1 新增)

```
music.mp3
  ↓ (HTMLAudioElement)
MusicManager.audio
  ↓ (createMediaElementSource)
AudioVisualizer.analyser (AnalyserNode, fftSize=128)
  ↓ (getByteFrequencyData → Uint8Array)
AudioVisualizer 计算:avgFreq / lowFreq / midFreq / highFreq / beat
  ↓ (main.js 主循环每帧调用 viz.update())
HeartAnimation.viz
  ├─ drawGlow():  viz.avgFreq 增强呼吸幅度 (+0.12 * avgFreq)
  └─ drawBeat():  viz.lowFreq 驱动脉冲强度 (+0.18) 与大小 (*1+0.6*lowFreq)
```

**自动播放策略应对**:AudioVisualizer 在构造时监听首次 `touchstart`/`click`,自动 `resume()` AudioContext(浏览器要求用户交互后才能启动音频)。

---

## 七、配置文件说明(config.js)

所有可定制参数集中在 `js/config.js`:

| 分类 | 内容 |
|------|------|
| timeline | 相识时间、情侣关系时间 |
| loadingText | 加载时显示的文字 |
| messages | 24 条文字粒子内容(可增删) |
| texts | 各阶段文案:标题、时间轴、MV 过渡、最终结尾、视频叠加文字 |
| paths | 头像 / 照片 / 视频 / 音乐的资源路径 |
| particles | 粒子数量、字体大小范围、汇聚速度、呼吸参数 |
| colors | 色调范围、饱和度、明度、爱心颜色 |
| timing | 各阶段持续时间 |
| eggs | 三击/长按阈值 |
| performance | Retina 适配、帧率目标 |

**⚠️ 硬编码时长**:时间轴显示(10s)、头像停留(8s)、照片停留(8s)目前硬编码在 main.js,未读取 `CONFIG.timing`。

---

## 八、性能与兼容

- **Canvas Retina 适配**:按 devicePixelRatio(1x ~ 2x)缩放
- **60FPS 动画**:requestAnimationFrame 驱动
- **手机适配**:375px–768px 响应式 + safe-area 全面屏适配
- **浏览器兼容**:Chrome / Safari / QQ 内置浏览器
- **零外部依赖**:无需 npm / CDN,单页面运行
- **音频可视化**:Web Audio API,老旧浏览器自动降级(viz.ready=false 时爱心按默认参数动画)

---

## 九、已知问题(v2.1 后)

1. **音乐自动播放**:`{once:true}` 监听器导致首次自动播放失败后无法再触发自动播放
2. **视频编码**:memory.mp4 为 isom 格式,建议转码 H.264+AAC
3. **file:// 协议**:Chrome 下双击打开 index.html 时,diary.json 的 XHR 请求会被 CORS 拦截,日记无法加载(部署到 HTTP 服务正常)
4. **transition.js 未接入**:场景过渡模块是死代码
5. **照片查看器重复**:diary.js 与 easterEgg.js 各有一套
6. **QQ 内置浏览器**:backdrop-filter / ellipse 可能不支持

---

## 十、使用方式

1. 把情侣头像放入 `assets/avatar/`(me.jpg + her.jpg)
2. 把回忆照片放入 `assets/photo/`
3. 把竖屏回忆视频放入 `assets/video/memory.mp4`
4. 把背景音乐放入 `assets/music/music.mp3`
5. 编辑 `data/diary.json` 添加日记条目
6. 修改 `js/config.js` 中的时间、文字、颜色等参数
7. 部署到 GitHub Pages 或任意 HTTP 服务器,用手机浏览器打开

**新增日记**:只需编辑 `data/diary.json` 的 `entries` 数组,字段为 `id / date / title / content / mood / photos`,无需改代码。

**修改未来信**:编辑 `data/diary.json` 的 `futureLetter` 字段(unlockDate / title / preview / content)。

---

*End of Report*
