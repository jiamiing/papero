# Papero · 纸间

**把日常，剪成另一种想象。** A local-first AI visual journal for Web, iOS and Android.

初版定位：照片编辑 → 物体/封闭区域选择 → 纸张/图案/文字填充 → 图层拼贴 → 深度探索 → 本地导出。

## 现在可以做什么

- 导入照片（本地读取，最长边缩至 1600px）；PNG、JPEG、WebP，系统解码器支持时可读其他格式。
- 魔棒连通区域选择、手动闭合圈选、按点击提示的 SlimSAM 物体分割。
- 六类本地生成的拼贴纸张：旧日报、云、星空、棋盘、玫瑰纸、文字；填充所选区域。
- 六种原创 SVG 剪贴素材，支持导入自己的透明 PNG；移动、缩放、旋转、透明度、层序、隐藏、复制、删除。
- Bodoni Moda 高对比衬线与斜体文字，参考所提供的第三张字体图的气质；不是对原字体的识别或复刻。
- 图层距离、投影和指针/触屏拖动的空间视差；Depth Anything V2 Small 本地生成、预览和导出相对深度图。
- IndexedDB 手帐库、自动保存、撤销/重做、PNG 与可编辑 JSON 项目文件导出/导入。
- 移动端通过原生分享菜单保存/分享导出的文件。

**能力边界**：这是可运行 MVP。拼贴替换是对蒙版内做材质合成，不是生成式图像补绘。魔棒不等于语义 AI。AI 深度图目前用于预览/导出；空间动画由手动图层深度驱动，尚未用深度图重建网格。没有任意视角 3D、视频导出、云同步、账号、付费素材市场或 Pinterest 抓取。

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

模型仅在选择 AI 选区/生成深度时下载；首次使用需要网络，下载与推理速度由设备决定。当前实现采用 WASM 单线程兼容路径，在独立 Worker 中运行；没有声称使用 WebGPU。照片作为本地 data URL 输入，不向推理服务上传。模型从 Hugging Face 下载，下载请求会把常规网络信息发送给托管方；不是完全无网络应用。

分割模型为 [`Xenova/slimsam-77-uniform`](https://huggingface.co/Xenova/slimsam-77-uniform)，深度模型为 [`onnx-community/depth-anything-v2-small`](https://huggingface.co/onnx-community/depth-anything-v2-small)，两份 ONNX 模型卡标注 Apache-2.0。发布时仍须复核权重/依赖条款，模型下载失败时继续使用魔棒和圈选。量化模型仍可能占用数百 MB 运行内存；低内存手机需实际测试。用户可随时取消 Worker 任务。

本地保存仅属于当前浏览器/设备；清理网站数据或卸载应用可能丢失手帐，请导出 `.papero.json` 备份。最多保留 15 步撤销快照。

## 部署与服务器

第一版 **0 个业务服务器 / 0 个推理 API / 0 个数据库**。Web 构建产物 `dist/` 可交给任意 HTTPS 静态托管，移动应用内置相同资源。

完整取舍、最轻量可选服务和上线路线见 [架构说明](docs/ARCHITECTURE.md) 与 [后续工作](docs/ROADMAP.md)。

## 素材

内置剪贴图形、示例风景、纸张纹理由本项目代码绘制。用户提供的参考图未打包进应用，也没有下载 Pinterest 素材。可以导入自己有权使用的图片。字体许可证和依赖许可随 npm 包分发。项目未设置开源许可，保持私有，后续由仓库所有者决定授权方式。
