# 宽 API 原生候选：改动地图

日期：2026-11-23（北京时间）。以当前候选源为准，独立于任何 Codex 对话。应用内不放维护说明。基准提交 `2435dbdf4690fe26d424b8d1ab778bcde9c6cd75`。

| 编号 | 目的与精确位置 | 依赖、撤销及验收 |
| --- | --- | --- |
| B01 | `app/build.gradle.kts` identity/version/manifest 分发、`app/src/{main,github}/AndroidManifest.xml`、`res/values*/kuan.xml`。根 `build.gradle.kts` 固定 Spotless 比较基线。移除上游 Firebase 构建和 `di/AppModule.kt`、`di/ViewModelModule.kt`、`ui/pages/chat/ChatVM.kt` 发送统计。 | 保持候选包名直到明确做迁移。单独撤回 Firebase 时需合法的独立 Google 项目配置、用户授权与隐私验收；不要直接放入上游凭据。包名和签名改动不做同签名升级承诺。 |
| A01 | `app/.../data/kuan/KuanApi.kt`：固定源、无重定向专用 OkHttp、严格读 JSON envelope、有限错误返回；`KuanSession.kt`：账号密码、注册、2FA、刷新、单账号拥有者、Keystore、`noBackupFilesDir`、会话代际。 | 移除账号接入需要先移除组目录、任务、附件和管理调用；不能把宽 API token 改存普通 RikkaHub 设置。回归错密码、普通账号、管理员、第二个账号、登出重入、误重定向、冷启离线。 |
| A02 | `RouteActivity.kt::Screen.KuanAccount`、`ui/pages/setting/KuanAccountPage.kt` / `SettingPage.kt`：只在现有设置添加账号页；`KuanOperations.kt`：个人及管理员用量、Chat 分组可见性。 | 账号可保留但单独移除管理员操作和显示区不影响模型发送。测试普通用户无管理员入口，独立测试 token 对同接口收到拒绝，管理员保存前需确认；不改官方 Sub2API 运营后台。 |
| M01 | `data/kuan/KuanCatalog.kt`：`managedModels`、`KuanRoute`、`refresh`、`resolve`、`key`。在 `ai/.../provider/ProviderSetting.kt` 增加无密钥作用域标记，`Model.kt` 保存已发现推理强度，`ProviderManager.kt` 按管理型配置分派；`di/DataSourceModule.kt` 接入。 | 只用服务端真实目录和授予的分组。撤销时先停用管理型 Provider，不把已有会话转送任意 BYOK。验收新增未知 model ID、同一 ID 分组隔离、普通用户没有管理员模型、401/403、无假默认、密钥只在内存。 |
| M02 | `ui/components/ai/ModelList.kt` 同一个原生 BottomSheet，`KuanModelControl.kt` 组、刷新、登录项；`ChatInput.kt` 原生选择器与推理控制；`ReasoningPicker.kt` 原生动画组件过滤选项；`SettingProviderPage.kt` 不把分组当 BYOK 供方配置。 | UI 可以独立重做或移除快捷行，不能去掉服务端分组和权限检查。建议保持 RikkaHub 原有图标、搜索、收藏、拖动、滑块和导航，不添加第二套聊天、选择器或首页。 |
| C01 | `data/kuan/KuanProvider.kt`：一次请求、协议路由、限域输入、结构化事件与终止检查；`ai/.../providers/openai/OpenAIWire.kt` 复用原编码/解码，`ChatRequestFactory.kt`、`ConversationConfig.kt` 绑定现有会话保存和处理流程。 | 不允许“请求失败改用另一组/模式”或客户端自动重发整轮；直接 SSE 不当作后台。撤销可先关掉托管 Provider；不要移除会话模型缺失时停止发送的保护。 |
| C02 | `data/kuan/KuanJobs.kt`、`ChatService.kt::{restoreKuanJob,canAttach,runTurn,stopGeneration}`、`ai/.../agent/AgentLoop.kt`、`StreamChunk.kt`：独立候选的原生服务器任务回执、同 ID 按游标读取、重试重置和继续原消息。 | 单独回退时，先让待领取任务完成或用已验证会话领取；禁用 `backgroundTarget` 后才可让新请求走前台。禁止迁移时删除服务器结果。验证丢首次响应、事件跳序、切组、进程死亡、同一分支、停止、重置、失败和数据库落盘后领取。 |
| F01 | `data/kuan/KuanAssets.kt`：只上传受管理目录里的原件，流式文件体，回执校验 SHA-256 和大小；两个 OpenAI encoder 接已验证的 `kuan-asset://...`；跳过托管路线本地文本替换，从压缩前消息补回仍存在的附件。 | 保留源文件与原始文件名、后缀，引用不进另一账号；不用持久化明文 Key。撤掉此项会退回上游本地解析，不再具备相同历史文件和扫描件语义，不可假称等价。测试 PDF、图片、200 件历史、过期和错误 MIME。 |
| U01 | `utils/UpdateChecker.kt`、`ui/pages/setting/KuanUpdateGroup.kt`、GitHub manifest 安装权限。替换上游更新源，候选清单默认关闭，校验摘要及已安装证书。 | UI 可放原有设置，但不要恢复上游 URL 或指向现网旧 APK。撤销先关闭独立预览发布清单，避免安装不匹配；验证相同签名正常升级、异证书/截断/错 ABI/旧版拒绝、普通 Android 安装确认。 |
| S01 | `web/WebServerManager.kt`、`WebApiModule.kt`：绑定宽 API 本机档案后，内置 Web 仅在回环且设密码时暴露 API，已有开放服务也运行时复核。 | 保留 RikkaHub 原功能但不能因开启局域网模式泄露托管对话或账户调用权限。回退托管功能前不要拆此检查。分别测 BYOK、回环有密码、LAN 无密码、登录时已启动、登出后仍受保护。 |
| H01 | `data/kuan/KuanHistory.kt::{import,readKuanArchive}`、`KuanFiles.kt::cloudArchive`、`ChatService.kt::mergeKuanHistory`、`ui/pages/backup/BackupVM.kt` 和 `tabs/ImportExportTab.kt` 提供旧格式 ZIP 或当前账号云备份导入。 | 先撤备份页入口和 DI，保留本机已导入的正常 RikkaHub 对话。导入逐个会话增量落盘，稳定 ID 去重，ZIP 有条目和字节上限，账号云备份先核对摘要。旧格式只有平铺消息，可用原件原样导入，缺失件显示占位。 |
| F02 | `data/kuan/KuanFiles.kt::{kuanFileLink,save,cached}`、`ui/components/richtext/KuanFileLinks.kt`、`RouteActivity.kt` 的链接处理。 | 识别自有域下载地址和人工可下载附件，旧 HTTP 链接归到固定 HTTPS 源。下载保留文件名和字节，系统应用从临时授权 URI 打开，另存在系统文件页。回退可移除对应链接入口，`KuanHistory` 继续复用文件仓储及账号云备份。 |
| A03 | `KuanOperations.kt::{webAccounts,setWebAccount,billing,savePrice}` 与 `ui/pages/setting/KuanAdminTools.kt` 接入网页账号调度、模型及推理档费率和最低金额。 | 先读服务端版本再按当前 revision 提交，UI 操作可从账号页独立撤回。默认费率保留，其他模型和档位记录随原策略提交。分组管理和原生 Dashboard 分别使用各自接口。 |
| M03 | `KuanCatalog.kt` 取实时推理档，`Assistant.kt`、`ConversationConfig.kt` 保存选值，`ChatInput.kt` 和 `ReasoningPicker.kt::ManagedReasoningButton` 复用上游滑块，`KuanProvider.kt::streamText` 传原始 effort。 | 目录缺档时发送路由使用服务端默认，切模型清理不适用的快照。移除此项可先恢复原滑块绑定，随后拆序列化字段与 wire 参数；保留本机旧档案可读。 |
| P01 | `tools/kuan-presentation`、`data/kuan/KuanPresentation.kt`、`ChatRequestFactory.kt` 与 `ChatService.kt::restoreKuanJob` 以受限解析器把富输出投影为 Markdown 与题目数据。 `ChatMessage.kt`、`KuanFollowUps.kt`、`ChatList.kt` 和 `ChatPage.kt` 用原生输入控件呈现真实题干与选项并追加草稿。 | 如需独立撤回，要一起拆流式和结束时的投影及 UI 回调；历史回复中的元数据留作兼容读取。解析器只解释声明式字段，副作用交给原聊天发送，用户仍可直接写文字。 |
| V01 | `app/src/test/.../data/kuan/KuanContractsTest.kt`：动态目录、群组身份、附件序列化、流结束、更新源校验。 | 源码断言不等于真实账号、安装或支付验收。按交付验收表追加设备与服务器隔离试验，不用现网改数据凑结果。 |
| V02 | `app/src/androidTest/.../data/kuan/{KuanNativeContractTest,KuanFollowUpsTest}.kt` 和 `tools/kuan-presentation/presentation.test.mjs`。 | 以合成账号核对分组密钥、原件、回执、重复导入和实际 Compose 交互。脚本覆盖前后链接、源码、公式、多题和手填输入。 |

## 分阶段撤回方法

对比上游标签与候选，导出将要撤回的模块范围并在新分支审查。不要用整树恢复覆盖其他改动。同文件含有多项改动的，在补丁中只撤指定符号，例如 `ChatService.kt` 的生任务与收入领取是一组，不能只删其中一端。数据库和旧应用由不同包管理，卸载预览只会删除其自身内容；要保留该预览聊天，先走显式备份再卸载。任何数据迁移都需要对应逆迁移或明确停机与恢复步骤，不能靠换 APK 将数据结构倒回。
