# 宽 API 原生候选：构建与验收

记录日期：2026-11-24（北京时间）。此分支从 RikkaHub 3.3.1 派生，宽 API 2.0 使用与经典版分离的分发渠道。见 [2.0.3 发布与撤回](RELEASE-2.0.3.md)、[2.0.2 入口](RELEASE-2.0.2.md)、[2.0.1 生图接入](RELEASE-2.0.1.md) 和 [2.0.0 首次发布](RELEASE-2.0.md)。

## 源码与版本

- 上游：<https://github.com/rikkahub/rikkahub/tree/2435dbdf4690fe26d424b8d1ab778bcde9c6cd75>，标签 `3.3.1`。
- 基准宽 API 正式 Android：`1.6.10 / code 33`。安装包和安装包更新清单不改；经典版设置中新下载链接随单独的 Chat 资源包发布。
- 2.0 保留预览的包名 `com.kuanapi.app.nativepreview`，版本为 `2.0.3 / code 6`，Debug 变体额外有 `.debug`。它与经典宽 API `com.kuanapi.app` 及官方 RikkaHub 并装；用原生版签名可升级早期 2.0。
- 对应客户端源保留 AGPL-3.0 和原作者版权，参见根目录 `LICENSE`。对外分发派生 APK 时同时提供与安装包精确对应的完整源码、补丁、许可证和构建步骤。此仓只调用服务端 HTTP 公开接口，不包含私有服务端源码、数据库、用户内容、生产签名或配置。

## 构建要求

JDK 21，Gradle 9.6.0（仓库 wrapper），AGP 9.4.0，Kotlin 2.4.21。安装 Android SDK `platforms;android-37.2`、`platforms;android-37.0`、`build-tools;37.0.0`、`platform-tools`，CMake 3.22.1 和 Gradle 根据 AGP 请求的 NDK。Node 22+ / pnpm 11，先执行 `web-ui` 冻结依赖安装，即使只用安卓，也要编译上游手机 Web 服务资源。最小 Android API 26；GitHub 渠道包含上游 Phone Use，Play 渠道不自更新。工具或能力仍须用户主动授权。

本分支移除了上游 Firebase 统计及其 Gradle 构建依赖，不需要上游 README 提到的 `app/google-services.json`。

```powershell
corepack pnpm --dir web-ui install --frozen-lockfile
npm --prefix tools/kuan-presentation ci
npm --prefix tools/kuan-presentation test
npm --prefix tools/kuan-presentation run build
npm --prefix tools/kuan-studio ci
npm --prefix tools/kuan-studio test
npm --prefix tools/kuan-studio run build
.\gradlew.bat --console=plain :app:assembleGithubDebug :app:testGithubDebugUnitTest
.\gradlew.bat --console=plain :app:assembleGithubRelease
```

设置 `JAVA_HOME` 与 `ANDROID_HOME`，IDE 用户可用本地 SDK。Windows 非 ASCII 路径如触发 AGP 路径检查，以命令行传入 `-Pandroid.overridePathCheck=true`；CMake 若仍不支持该路径，用 ASCII 路径的独立检出。Gradle 镜像下载必须对比 Gradle 官方 SHA-256，不随意替换 AGP、Kotlin、SDK 或上游依赖版本。不要在携带生产密钥的进程环境下构建。

Windows 若因路径编码导致 Gradle JVM test worker 加载失败，显式执行 `--no-configuration-cache -I tools/kuan-jvm-classpath.gradle :ai:bundleLibRuntimeToJarDebug :app:writeKuanJvmClasspath`。它会更新 `:ai` 的运行时 JAR 并导出测试类路径到 `app/build/kuan-jvm-classpath.txt`。在 Java argfile 中为 `-cp` 提供用引号包裹的 ASCII 路径，各路径以分号连接，再运行 `org.junit.runner.JUnitCore` 加测试类全名。上游依赖含 `sqlite-android:-SNAPSHOT`，当前构建记录覆盖这台机器的依赖集。

Android 设备用例使用 `:app:assembleGithubDebugAndroidTest`。安装 Debug 和测试 APK 后，在测试设备运行以下用例。夹具在 OkHttp 拦截请求并返回合成数据。

```powershell
adb -s <test-device> shell am instrument -w -r -e class "me.rerere.rikkahub.data.kuan.KuanNativeContractTest,me.rerere.rikkahub.data.kuan.KuanFollowUpsTest,me.rerere.rikkahub.data.kuan.KuanStudioTest" com.kuanapi.app.nativepreview.debug.test/androidx.test.runner.AndroidJUnitRunner
```

`tools/kuan-presentation` 是 `app/src/main/assets/kuan-presentation.js` 的对应源码。它源于宽 API 维护仓的 `frontend/openui/{web-presentation,declarative-forms}.mjs`，维护基准记录为 `45c62fb5380a9d2608b10ecbb42810ae2f79f1c8`。本次扩展了动作标识、空值输入和历史文本投影。仓内包含 Acorn 8.15.0 和 Acorn JSX 5.3.2 的许可证文本与 npm 锁定记录。

默认 Debug 使用本机 debug 签名，不能作为发布签名。RikkaHub 上游的 release 构建可通过本机忽略的 `local.properties` 提供 `storeFile`、`storePassword`、`keyAlias`、`keyPassword`。也可在输出未签名 APK 后用 SDK 的 `zipalign` 和 `apksigner` 独立签名；只用候选专用密钥，不用正式宽 API 或 RikkaHub 签名。不要把密钥或含密钥的配置写进命令历史、审计包或源码。

预览专用签名也支持在受保护的本机进程环境设置 `KUAN_PREVIEW_KEYSTORE` 和 `KUAN_PREVIEW_STORE_PASSWORD`；别名为 `kuan-native-preview`，私钥密码与库密码相同。使用该路径构建时传 `--no-configuration-cache`，不要把真实密码作为 Gradle 命令行参数。复现代码和产物结构不要求获得交付的签名私钥；在另一台机器用独立签名时必须使用独立安装渠道。

验收要保存 `aapt dump badging` 的包名、版本、API、ABI，`apksigner verify --print-certs` 的证书 SHA-256，文件 SHA-256、大小，以及设备 `adb -s <候选测试设备> install` 后的启动、冷启、离线与业务交互证据。上游官方仅分发 ARM64 GitHub APK；x86_64 只能用本地分包验证，不能拿 ARM64 安装包在不具备兼容层的 x86_64 模拟器上做通过结论。

## 2.0 更新渠道

GitHub Release 构建默认读取 `https://kuanapi.kuankuan.de5.net/downloads/mobile-native/latest.json`。调试构建不访问在线更新渠道。本机离线发行可使用 `-PkuanUpdateManifest=`，隔离安装测试可在相同包名、签名下指定独立清单；不要指向经典版或上游 RikkaHub。示意（SHA-256 占位值不是可用配置）：

```json
{
  "packageName": "com.kuanapi.app.nativepreview",
  "version": "2.0.0",
  "versionCode": 3,
  "publishedAt": "2026-11-23T00:00:00Z",
  "changelog": "",
  "downloads": [{
    "name": "kuanapi-native-preview-arm64.apk",
    "url": "https://updates.example.test/native/kuanapi-native-preview-arm64.apk",
    "size": "19 MB",
    "bytes": 19000000,
    "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "abi": "arm64-v8a"
  }]
}
```

生成候选 APK 后先验证签名和精确字节，再写清单。更新只接受同 HTTPS 源的 APK，不跟随重定向，检查 ABI、大小、SHA-256、严格递增整数版本、Android 安装包名和与已安装应用相同的签名，用系统安装器由用户确认。不能静默安装，Play 渠道不用此更新器。还没有经过两个实际版本间的线上升级测试。

## 生产边界

不要运行上游 `.github/workflows/release.yml` 或打发布标签作为本地验收。原生 2.0 单独分发；只有经典版独立的下载入口改动会更新 Chat 静态资源指针，不能用原生 APK 构建改经典版清单、开发运行时、服务配置、DNS/Tunnel 或正式账号数据，也不重启 Sub2API、Grok、Copilot。旧历史需走显式导入，本机私有目录不会自动迁移。
