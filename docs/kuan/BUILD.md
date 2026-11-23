# 宽 API 原生候选：构建与验收

记录日期：2026-11-23（北京时间）。这是 RikkaHub 3.3.1 的本地派生工作，不是宽 API 线上发布。

## 源码与版本

- 上游：<https://github.com/rikkahub/rikkahub/tree/2435dbdf4690fe26d424b8d1ab778bcde9c6cd75>，标签 `3.3.1`。
- 基准宽 API 正式 Android：`1.6.10 / code 33`，Chat 资源 `7fedc4145d4207ee1a0a`，来源是两个域名的公开清单。本分支不会改它们。
- 候选身份：`com.kuanapi.app.nativepreview`，`2.0.0-preview.1 / code 1`；Debug 变体额外有 `.debug`。候选与旧宽 API、原 RikkaHub 并存，不能覆盖安装或访问它们的私有目录。
- 对应客户端源保留 AGPL-3.0 和原作者版权，参见根目录 `LICENSE`。对外分发派生 APK 时同时提供与安装包精确对应的完整源码、补丁、许可证和构建步骤。此仓只调用服务端 HTTP 公开接口，不包含私有服务端源码、数据库、用户内容、生产签名或配置。

## 构建要求

JDK 21，Gradle 9.6.0（仓库 wrapper），AGP 9.4.0，Kotlin 2.4.21。安装 Android SDK `platforms;android-37.2`、`platforms;android-37.0`、`build-tools;37.0.0`、`platform-tools`，CMake 3.22.1 和 Gradle 根据 AGP 请求的 NDK。Node 22+ / pnpm 11，先执行 `web-ui` 冻结依赖安装，即使只用安卓，也要编译上游手机 Web 服务资源。最小 Android API 26；GitHub 渠道包含上游 Phone Use，Play 渠道不自更新。工具或能力仍须用户主动授权。

```powershell
corepack pnpm --dir web-ui install --frozen-lockfile
.\gradlew.bat --console=plain :app:assembleGithubDebug :app:testGithubDebugUnitTest
.\gradlew.bat --console=plain :app:assembleGithubRelease
```

设置 `JAVA_HOME` 与 `ANDROID_HOME`，IDE 用户可用本地 SDK。Windows 非 ASCII 路径如触发 AGP 路径检查，以命令行传入 `-Pandroid.overridePathCheck=true`；CMake 若仍不支持该路径，用 ASCII 路径的独立检出。Gradle 镜像下载必须对比 Gradle 官方 SHA-256，不随意替换 AGP、Kotlin、SDK 或上游依赖版本。不要在携带生产密钥的进程环境下构建。

Windows 若因路径编码导致 Gradle JVM test worker 加载失败，可用 `--no-configuration-cache -I tools/kuan-jvm-classpath.gradle :app:writeKuanJvmClasspath` 导出同一 Android 变体的编译后测试类路径（`app/build/kuan-jvm-classpath.txt`）。将每条路径转成同一机器可访问的 ASCII 路径，以 `;` 分隔并不加空格，Java argfile 传入 `-cp` 和引号包裹的类路径，然后运行 `org.junit.runner.JUnitCore` 加上测试类全名。此方法与 APK 编译、Lint、设备验收分开；只能据此报告实际执行的测试类。上游仍有 `sqlite-android:-SNAPSHOT`；两台干净机器的依赖锁定和字节可重现性不是本次已验证结论。

默认 Debug 使用本机 debug 签名，不能作为发布签名。RikkaHub 上游的 release 构建可通过本机忽略的 `local.properties` 提供 `storeFile`、`storePassword`、`keyAlias`、`keyPassword`。也可在输出未签名 APK 后用 SDK 的 `zipalign` 和 `apksigner` 独立签名；只用候选专用密钥，不用正式宽 API 或 RikkaHub 签名。不要把密钥或含密钥的配置写进命令历史、审计包或源码。

预览专用签名也支持在受保护的本机进程环境设置 `KUAN_PREVIEW_KEYSTORE` 和 `KUAN_PREVIEW_STORE_PASSWORD`；别名为 `kuan-native-preview`，私钥密码与库密码相同。使用该路径构建时传 `--no-configuration-cache`，不要把真实密码作为 Gradle 命令行参数。复现代码和产物结构不要求获得交付的签名私钥；在另一台机器用独立签名时必须使用独立安装渠道。

验收要保存 `aapt dump badging` 的包名、版本、API、ABI，`apksigner verify --print-certs` 的证书 SHA-256，文件 SHA-256、大小，以及设备 `adb -s <候选测试设备> install` 后的启动、冷启、离线与业务交互证据。上游官方仅分发 ARM64 GitHub APK；x86_64 只能用本地分包验证，不能拿 ARM64 安装包在不具备兼容层的 x86_64 模拟器上做通过结论。

## 可更新的候选渠道

默认未配置在线渠道。构建参数 `-PkuanUpdateManifest=https://<隔离HTTPS主机>/<路径>/manifest.json` 只给相同包名、签名的候选版；不要指向旧 1.6.10 或上游 RikkaHub。示意（SHA-256 占位值不是可用配置）：

```json
{
  "packageName": "com.kuanapi.app.nativepreview",
  "version": "2.0.0-preview.2",
  "versionCode": 2,
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

不要运行上游 `.github/workflows/release.yml` 或打发布标签作为本地验收。没有授权部署、改 DNS/Tunnel、发布更新清单、替换正式包、现网账号写入或升级 Sub2API、Grok、Copilot。正式晋升应另建验收并明确历史迁移、包名、原证书和服务端权限，不从预览应用不透明地替换。
