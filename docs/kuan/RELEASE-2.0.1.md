# 宽 API 2.0.1

2026-11-24（北京时间）。原生 Android `2.0.1 / code 4`，包名仍是
`com.kuanapi.app.nativepreview`，沿用 2.0.0 证书。经典版 `1.6.10 / code 33`
继续独立安装、独立检查更新。[公网下载](https://kuanapi.kuankuan.de5.net/downloads/android.html#native)
和[镜像](https://ai.larryllr.cc.cd/downloads/android.html#native)共用版本清单。

## 改动地图

| 位置 | 改动与验收 |
| --- | --- |
| `ChatDrawer.kt`、`RouteActivity.kt` | 原侧栏生图入口打开专业生图。触发原 RikkaHub 图片/视频记录的入口保留在专业生图顶部菜单。 |
| `KuanStudioPage.kt`、`KuanStudio.kt` | 原生群组弹出菜单与已有账号集成。基于授权组目录动态判断可用生图模型。沿用 `POST /v1/images/generations` 和 `POST /v1/images/edits`；没有其它 API 路由或账号。 |
| `app/src/main/assets/kuan-studio`、`tools/kuan-studio` | 与旧版相同的案例、模板、对比、生成参数和任务记录。HTML 和内容索引随 APK；图片走受限来源。WebView 没有 API Key、宽 API 账号 token、设备文件或通用网络权限。 |
| `StudioReferences.kt`、`StudioExports.kt` | 参考图通过系统选择器和一次性只读本机 URL；保存相册保留图像原字节；模板和 ZIP 走系统文件保存。保存后可再次尝试打开，不重复下载已存在的媒体。 |
| `tools/publish_classic_native_entry.py` | 以经 SHA-256 验证的正式经典版为输入，仅更新设置内的 2.0 链接及对应资源。原 1.6.10 APK、更新清单、EXE 启动器不改。 |

## 构建与验证

1. 先按 [工作台源码说明](../../tools/kuan-studio/README.md) 重建资源，再按 [Android 构建说明](BUILD.md) 编译。不要将测试签名发到原生更新渠道。
2. 跑 Android 测试 `KuanStudioTest`、`KuanNativeContractTest` 和 `KuanFollowUpsTest`。验证目录、真 WebView UI、系统选择结果、接口形状与下载原件；夹具不调用计费上游。签名 APK 另做 `2.0.0 → 2.0.1` 覆盖及与经典版并装检查。
3. 维护主机使用两把正式发布锁。新版下载项先发布
   `mobile-native/2.0.1/`、`mobile-native/latest.json` 和 `android.html`；
   正式资源候选先运行 `publish_classic_native_entry.py prepare`，用浏览器点验后再
   `publish`。两边都用同一份经典版批准清单作验证，不用旧仓工作区覆盖现网。
4. 两域分别核对下载页和清单、资源 ZIP、新 APK 与对应源码 SHA-256。设置链接到经典版资源启用后才可见；经典 APK 不应显示原生版为安装包更新。

## 撤回

- 原生渠道：用原发布输入及其 `previous/` 运行
  `publish_kuan_android.py withdraw <staging>`。恢复 2.0.0 下载页和清单，
  私下保留 2.0.1 安装包；已经安装的 2.0.1 不会远程降级。
- 经典渠道：用原 staging 和 `rollback.json` 运行
  `publish_classic_native_entry.py rollback <staging>`，只恢复 Chat/审批/资源指针。
- 两项撤回都不操作账号、密钥、数据库、网关、官方 Sub2API、Grok 或 Copilot。
