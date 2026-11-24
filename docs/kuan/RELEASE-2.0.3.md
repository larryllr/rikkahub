# 宽 API 2.0.3

2026-11-24，北京时间。版本码 `6`，沿用 2.0.2 包名和原签名。经典 1.6.10 的安装和更新渠道独立。更新目标为 [Android 下载](https://kuanapi.kuankuan.de5.net/downloads/android.html#native)。

## 改动

- **专业生图：** Compose 统一管理系统栏与键盘；嵌入页填满实际 WebView，不再拿移动浏览器的动态高度决定工作区。手机展开编辑器不再和图库分屏，常驻生成按钮；发起生成后回到记录。宽屏仍并排。点击停止也会取消本机的生成 HTTP 请求；已到达上游的任务是否继续由上游决定。
- **问答：** GPT、Work、任务恢复和经典历史导入使用同一声明式解析。题干、选项和提交值保留；草稿或附件存在时只追加。旧有原生工具提问不受影响。
- **折叠来源：** 仅识别明确的参考来源区及有结构的引用。正文链接、代码和文件下载通道保留。将网页备用 Markdown 当快照处理，不作为第二段答案追加。
- [功能矩阵](FEATURE-MATRIX.md) 列出仍缺项、设计替换和未做真实账号验证的功能。

## 验收与发布

重建 `tools/kuan-studio` 和 `tools/kuan-presentation` 的 APK 资源，运行 JavaScript、JVM 和 Android 回归。原生页必须在手机竖屏、短横屏、宽屏及键盘弹出时实测。用原证书对 ARM64 与 x86_64 签名，并从正式 2.0.2 覆盖安装确认应用数据不需要清除。

`tools/stage_kuan_android.ps1` 核对 APK 内生图、问答资源与对应源码；`tools/publish_kuan_android.py` 只切换原生清单、发行目录和两版下载页，校验经典 APK/更新清单、已审批 Chat 资源和官方 Sub2API 的状态不变。回退使用本次 staging 运行 `publish_kuan_android.py withdraw <staging>`，指针恢复到 2.0.2；不会远程降级已安装的 2.0.3 或清除用户数据。
