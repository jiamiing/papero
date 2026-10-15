# 端侧优先架构

## 一套编辑核心，三个入口

| 层 | 实现 | 数据流 |
|---|---|---|
| Web | 静态 Vite 构建 + Canvas 2D | 文件选择 → 本地解码 → 图层合成 |
| iOS | Capacitor WKWebView + SwiftPM | 共用编辑器；Filesystem/Share 导出 |
| Android | Capacitor WebView + Gradle | 共用编辑器；Filesystem/Share 导出 |
| AI 分割 | Transformers.js / ONNX WASM / SlimSAM | 下载权重 → 本地图片+点击 → 蒙版 |
| 深度 | Depth Anything V2 Small / ONNX WASM | 原始照片 → 相对深度 PNG |
| 保存 | IndexedDB | JSON 图层记录 + data URL 图片 |
| 跨设备搬运 | `.papero.json` 项目文件 | 导出/导入，不依赖云 |

UI 与 Canvas 不承担模型推理：模型在独立 Web Worker。当前单线程 WASM 不需要 COOP/COEP；先保证静态托管与 WebView 兼容性。后续应在模型级别按设备验证 WebGPU、Core ML、NNAPI，不能只根据 `navigator.gpu` 存在就认定所有模型可加速。

## 区域替换

1. 魔棒：对原始照片执行四邻域、种子颜色相似度区域生长。封闭区域边缘有缺口会泄漏；提高/降低容差后需要重新点击。
2. 圈选：轨迹闭合形成蒙版。
3. AI：原图与点击坐标进入 SlimSAM，使用最高 IoU proposal。复杂发丝、反光、透明物体仍需下一版增减点和手动修补。
4. 将纹理或重复排版与蒙版做 `destination-in` 合成，作为独立、可移动图层放在原图上。底图保留。

当前选区来源是原始照片，尚不支持对所有合并图层做 AI 选区。区域替换覆盖原区域，不自动移除原底图内容或修补背景。剪贴元素可以导入透明 PNG，按图层独立摆放。

## 立体能力的分层

- 当前：手动图层 Z 值影响视差位移和投影；AI 相对深度图预览与 PNG 导出。
- 下一步：用深度图对网格顶点位移，增加遮挡填补与相机边界，再提供轻微镜头动画。
- 未实现：真实三维场景、背面纹理、大幅度新视角生成。单张照片的深度估计无法提供这些信息。

## 最轻量部署

**MVP 推荐：只用静态托管**。打包 `dist/`，使用支持 27 MB 单文件的静态服务，或者把 ONNX runtime WASM 放在单独的大文件源并配置 `env.backends.onnx.wasm.wasmPaths`。构建中 WASM 文件约 26.9 MB（十进制），超过 Cloudflare Workers Static Assets 单文件 25 MiB 的现行限制，因此不能直接把当前原样构建拖进 Cloudflare Pages/Workers 并认定可用。

选择支持该大小的静态服务后配置 HTTPS、JS/WASM 正确 MIME、不可变哈希资源长缓存、入口短缓存。**静态托管有请求和流量成本，免业务服务器不等于保证永远免费。** 模型权重目前由 Hugging Face 托管，运行期不要求自己的 GPU 服务。

若以后用户真的需要云端能力，只加一层 Cloudflare Worker：

| 需求 | 最小新增设施 | 什么时候才需要 |
|---|---|---|
| 生成式新素材/补绘 | 一个 Worker API 网关 + 按次付费图像服务 | 端侧模型内存或质量不够时 |
| 云同步 | Worker + R2（图像/项目）+ 小型 D1（索引） | 明确需要账号与跨设备同步时 |
| 素材目录更新 | 静态 JSON 索引 + 对象存储 | 素材不随应用版本发布时 |

生成网关必须保管 provider API key、验证身份、限制用户额度与载荷大小、设置上游超时，不做开放匿名代理。仅在用户主动选择云端生成并确认上传后发送照片；本地功能不依赖网关。R2/D1 对首版不是必需项。当前未部署、未创建任何付费服务。

截至 2026-10-15 核查，Workers Free 文档列出 100,000 请求/日和每次 10ms CPU；这个额度用于轻量网关，不适合在 Worker 上运行上述神经网络。Cloudflare 计费、模型调用和对象存储须分别看，不给出无条件月成本保证。

依据：[Capacitor 安装](https://capacitorjs.com/docs/getting-started)、[Workers 定价](https://developers.cloudflare.com/workers/platform/pricing/)、[Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)、[SlimSAM 模型卡](https://huggingface.co/Xenova/slimsam-77-uniform)、[深度模型卡](https://huggingface.co/onnx-community/depth-anything-v2-small)。
