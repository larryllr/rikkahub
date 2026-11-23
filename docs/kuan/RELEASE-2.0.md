# 宽 API 2.0 发行

宽 API 原生 2.0 基于 RikkaHub 3.3.1，与经典版共同保留。2.0 沿用原生预览签名和包名 `com.kuanapi.app.nativepreview`，版本 `2.0.0`、版本码 `3`；经典版为独立包 `com.kuanapi.app`。无账号和密钥的数据目录共享。需迁移经典版历史时使用原生备份页的显式导入。

## 用户入口

- [Android 下载](https://kuanapi.kuankuan.de5.net/downloads/android.html) · [镜像](https://ai.larryllr.cc.cd/downloads/android.html)：均列出原生 2.0 和经典 1.6.10，并提供对应原生 APK、源码和 SHA-256。
- 2.0 无可用模型时，聊天首卡使用原版宽 API 图标。主按钮进入宽 API 账号；「自定义」进入 RikkaHub 原快速入门。模型选择器、助手、侧栏和动效不改。
- 原生更新清单：`/downloads/mobile-native/latest.json`。经典版继续使用 `/downloads/mobile-latest.json` 与原资源更新地址。两个渠道包名、签名和版本独立。

## 打包和验收

1. 在同一提交构建两种 ABI 的 release 并使用原生版签名。核对 APK 证书、包名、code 3、实际 Min API 与 ABI。源码由 Git 提交导出，不带签名、生产环境变量、本机缓存、私人会话或服务器凭据。
2. 在测试模拟器验证经典版和原生版共存、原生版启动和两条导航、同签名的原生预览覆盖升级。用实包测试更新清单，不用 APK 改名或测试数据冒充生产。
3. 待发布路径限 `android.html`、`mobile-native/2.0.0/*` 和 `mobile-native/latest.json`。先校验上传内容，再使用 `tools/publish_kuan_android.py publish <staging>`；脚本依赖维护仓的 `frontend_approval.py` 和正式发布的两把锁，校对完整 Chat 清单及审批、旧 APK、旧更新清单和 Sub2API 程序的 SHA-256。
4. 从两个公网域名分别获取页面、清单、新 APK 和源码并核对内容。验证经典 APK 的版本和字节仍与原清单一致。设备截图、版本和精确文件校验见对应的本机交付记录。

## 撤回

发布后公网验证失败时，用相同 staging 目录运行 `tools/publish_kuan_android.py withdraw <staging>`。脚本复查线上内容确实属于该发布，再将两处新内容移动到同文件系统的私有目录；经典版清单、APK、Chat、服务和 Caddy 不改。已安装 2.0 不会被远程卸载或降级。
