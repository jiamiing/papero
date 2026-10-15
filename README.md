# Papero · 纸间

在线使用：https://jiamiing.github.io/papero/

**把日常，剪成另一种想象。** A local-first AI visual journal for Web, iOS and Android.

初版定位：照片编辑 → 物体/封闭区域选择 → 纸张/图案/文字填充 → 图层拼贴 → 深度探索 → 本地导出。

## 现在可以做什么

- 导入照片（本地读取，最长边缩至 1600px）；PNG、JPEG、WebP，系统解码器支持时可读其他格式。
- 默认直接点照片，由 SlimSAM 智能识别完整区域；自动清理碎片、小孔和细裂缝。照片打开时提前准备模型并缓存图像特征，连续点选只采用最后一次结果。
- 选好后在区域旁自动弹出「颜色 / 文字 / 素材」面板；可直接换色、输入文字铺满，或把图案/原创素材填进选区，无需切换侧栏或二次确认应用。
- 8 个色块，支持自定义颜色；纯色、网点、双色、文字铺满、棋盘和杂志纸填充。连续试色修改同一个区域层，照片填充位于文字/贴纸下方。
- 8 种原创图像生成材质素材，支持导入自己的透明图片；移动、缩放、旋转、透明度、层序、隐藏、复制、删除。
- 大字无衬线、小字等宽、Bodoni Moda 斜体三种文字样式；字号、颜色、旋转和位置可以调整，原有项目继续兼容。
- 图层距离、投影和指针/触屏拖动的空间视差；Depth Anything V2 Small 本地生成、预览和导出相对深度图。
- IndexedDB 手帐库、自动保存、撤销/重做、PNG 与可编辑 JSON 项目文件导出/导入。
- 移动端通过原生分享菜单保存/分享导出的文件。

**能力边界**：这是可运行 MVP。默认点选为本机语义分割，识别准确度随照片和设备而变化，不保证每次选择恰好符合意图。分割结果自动清理，并用连续边界显示；模型加载或推理失败时自动使用平滑连通区域作为降级，界面会说明，无需用户找修正入口；也保留手动圈选。拼贴替换是对蒙版内做材质合成，不是生成式图像补绘。AI 深度图目前用于预览/导出；空间动画由手动图层深度驱动，尚未用深度图重建网格。没有任意视角 3D、视频导出、云同步、账号、付费素材市场或 Pinterest 抓取。

## 开发

Node.js 22+（此版本使用 Node 24 验证）。

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite + React + TypeScript + Canvas 2D + Web Worker + Transformers.js 4 + Capacitor 8。字体本地打包，没有字体 CDN 依赖。生产构建注册 Service Worker；已访问的静态资源会缓存。AI 模型由模型库另行缓存，不保证操作系统不会清理缓存。

## iOS / Android

原生工程已包含在 `ios/` 与 `android/`，应用 ID 为 `studio.papero.app`。

```sh
npm run native:sync
npm run ios       # Xcode 工程
npm run android   # Android Studio 工程
```

iOS 工程采用 Swift Package Manager。原生编译、签名、商店审核与真机测试需要开发者自己的工具链和账号。当前机器仅有 Apple Command Line Tools，没有完整 Xcode 或 Java：已验证原生工程生成和同步，**没有验证 IPA/APK 编译或真机推理**。

## AI 与隐私

照片载入后会自动下载并准备分割模型；深度模型仍在请求生成时下载。首次使用需要网络，下载与推理速度由设备决定；后续同一张照片复用特征，只解码新点选。当前实现采用 WASM 单线程兼容路径，在独立 Worker 中运行；没有声称使用 WebGPU。照片作为本地 data URL 输入，不向推理服务上传。模型从 Hugging Face 下载，下载请求会把常规网络信息发送给托管方；不是完全无网络应用。

分割模型为 [`Xenova/slimsam-77-uniform`](https://huggingface.co/Xenova/slimsam-77-uniform)，深度模型为 [`onnx-community/depth-anything-v2-small`](https://huggingface.co/onnx-community/depth-anything-v2-small)，两份 ONNX 模型卡标注 Apache-2.0。发布时仍须复核权重/依赖条款，分割模型加载失败时自动使用平滑选区，圈选仍可用。量化模型仍可能占用数百 MB 运行内存；低内存手机需实际测试。深度任务可取消；选区计算中再次点选会自动切换目标。

本地保存仅属于当前浏览器/设备；清理网站数据或卸载应用可能丢失手帐，请导出 `.papero.json` 备份。最多保留 15 步撤销快照。

## 部署与服务器

第一版 **0 个业务服务器 / 0 个推理 API / 0 个数据库**。Web 构建产物 `dist/` 可交给任意 HTTPS 静态托管，移动应用内置相同资源。

GitHub Pages 仅部署本仓库的 `dist/` 到 `/papero/`，不配置自定义域名或个人主页；Service Worker 仅处理本应用路径并清理自己的缓存。

完整取舍、最轻量可选服务和上线路线见 [架构说明](docs/ARCHITECTURE.md) 与 [后续工作](docs/ROADMAP.md)。

## 素材

示例照片与 Y2K 材质素材通过内置图像生成工具原创生成，照片人物为虚构成年人；色块、图案与文字由本地 Canvas 合成。用户提供的参考海报只用于设计方向，没有打包进应用，也没有下载 Pinterest 素材。可以导入自己有权使用的图片。字体许可证和依赖许可随 npm 包分发。项目已公开，但尚未设置开源许可；后续由仓库所有者决定授权方式。
