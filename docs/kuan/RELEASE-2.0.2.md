# 宽 API 2.0.2

2026-11-24（北京时间）。版本码 `5`，沿用 2.0.1 的包名和签名。经典版 1.6.10 仍由自身渠道分发。[Android 下载](https://kuanapi.kuankuan.de5.net/downloads/android.html#native)

## 生图入口

- `ChatDrawer.kt` 保留底部菜单中原「图像生成」的位置，点按进入宽 API 专业生图。撤下 2.0.1 临时放在侧栏列表的直达入口。
- `RouteActivity.kt` 的 `Screen.ImageGen` 和 `shortcuts.xml` 的长按快捷方式共用专业生图。Android 恢复过来的旧导航状态和旧媒体通知也进入现有工作台。
- `KuanStudioPage.kt` 保留宽 API 登录和分组选择。移除旧媒体页、设置入口及旧生成任务的自动恢复。继续保留历史设置的读取格式和媒体文件。
- 保留工作台的案例、模板、动态模型选择、上传参考图和相册下载。案例作者及 MIT 许可仍可查看，内置来源卡片改为纯文本。

## 品牌入口

- 应用、分享、导出名称、设备无障碍提示、授权回调和内置网页使用宽 API 的标识。
- 关于页的源码链接指向自己的 Android 下载页，许可链接指向 GNU 正式条款。撤下内置 GitHub 跳转和原上游社群、赞助入口。用户自行配置的 GitHub 技能导入仍可用。
- 公开源码保留上游许可证、原作者归属及变更记录；包名、数据库、备份格式和协议标识继续兼容旧版。

## 验收与发布

先重建 `tools/kuan-studio` 并更新 APK 内 JS/CSS。用现有签名构建 ARM64 和 x86_64，运行 `KuanStudioTest`、`KuanNativeContractTest` 和 `KuanFollowUpsTest`。实包检查侧栏底部菜单、原系统快捷方式、关于页和与经典版并装，夹具生成不访问计费上游。

使用 `tools/stage_kuan_android.ps1` 生成 APK、SHA-256、源码和清单。发布只更新 `/downloads/mobile-native/` 和 `/downloads/android.html`。`tools/publish_kuan_android.py` 校验经典版 APK、经典更新清单、当前 Chat 与原生 2.0.1 基线。公网用 `tools/verify_kuan_android_public.py` 分别验证两个域名。

需要撤回时，用同一次发布的 staging 运行 `publish_kuan_android.py withdraw <staging>`。公网指针恢复到 2.0.1，已经安装的 2.0.2 仍保有本机资料。
