# 宽 API 2.0.4

2026-11-24（北京时间）。版本码 `7`。沿用原生版包名与签名，可覆盖 2.0.3。经典版 `1.6.10 / 33` 及其更新通道继续独立。

| 改动 | 审计入口、限制和单项回退 |
| --- | --- |
| 消息生图/改图 | `ChatPage`、`KuanChatImageDialog`、`KuanChatImage`、`ChatRequestFactory`、`KuanProvider`。由当前分组发现模型，原始会话中选定的前缀及原附件交给同一套托管任务协议。回退时先去掉消息动作，保留历史消息元数据可读；不把旧生图请求自动改发普通文字请求。 |
| 专业生图续接 | `KuanStudioTasks` 在应用进程内保存任务和原图回执，`KuanStudioPage` 与 `tools/kuan-studio` 只负责触发、显示状态和领取。关闭 WebView 不取消，用户主动停止仍取消；进程被杀时未知结果不自动重发。回退时先领取或结束进行中的任务，同时回退原生消息桥和对应的 JS。 |
| 经典云历史 | `KuanCloudHistory`、`KuanHistory`、`KuanFiles`。明确确认才写；使用 `If-Match` / `If-None-Match`，验证上传摘要，不覆盖冲突行和附件。仅同步当前对话分支，原生完整备份与经典导入独立。回退只关闭同步入口，不清除本地对话或云数据。 |
| 经典项目 ZIP | `ClassicProjectArchive`、`WorkspaceRepository`、`WorkspacePage`。创建新本地工作区，校验路径、条目数与大小，不运行归档内容，不恢复旧任务。回退入口不删已导入项目。 |
| 网页富回复 | `KuanWebCards`、`KuanWebReplyCards` 和 `WebSearchResultDetails` 保留网页搜索阶段、真实来源、原图预览和带链接卡片。使用持久化的消息数据，不执行任意脚本。旧问答与引用 UI 保持；控件和协议差异见[对照表](FEATURE-MATRIX.md)。 |
| Responses 终止 | `KuanStreamDecoder.closeFrames` 区分正常 EOF 和未收到终态的断开。前者不再强制要求额外的 `[DONE]`；不用丢弃异常结果来让测试通过。 |

## 上游贡献

[RikkaHub 对比分支](https://github.com/rikkahub/rikkahub/compare/master...larryllr:rikkahub:codex/web-search-rich-replies)，头提交 `0bdf454`。范围是通用 Responses 搜索记录、查询和可折叠来源，保留原生引用和 `ask_user`。不含宽 API 品牌、服务地址、账号、云存档或私有协议。上游仓库限制为仅协作者可开 PR；分支已推送，未创建正式 PR。

## 发行、验证与回退

先运行 [构建与验收](BUILD.md) 中的 JS/JVM/设备用例，用原签名在同一 Android 测试设备覆盖安装。设备业务夹具不产生线上计费，不代表所有上游账号可用。对照经典版及尚未实测的能力见 [功能矩阵](FEATURE-MATRIX.md)。

`tools/stage_kuan_android.ps1` 核对两个 ABI 的包名、版本码、证书、APK 内资源和对应源码。发布仅切换原生渠道和两版下载页；`tools/publish_kuan_android.py withdraw <staging>` 可恢复 2.0.3 下载指针，不修改设备数据或远程降级。官方 Sub2API、经典 Chat、Grok/Copilot、账号调度和域名不在此次发布范围。
