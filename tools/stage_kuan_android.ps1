param(
    [Parameter(Mandatory)][string]$Stage,
    [Parameter(Mandatory)][string]$BuildTools
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$stageRoot = [IO.Path]::GetFullPath($Stage)
$version = '2.0.1'
$code = 4
$package = 'com.kuanapi.app.nativepreview'
$origin = 'https://kuanapi.kuankuan.de5.net/downloads/mobile-native'
$certificate = '184f05de36ac9a6e5807f26bef7f848f1b65f849058d461b234da42c4e7ecf59'
$apkRoot = Join-Path $repo 'app/build/outputs/apk/github/release'
$assets = Join-Path $repo 'app/src/main/assets/kuan-studio'

if (Test-Path -LiteralPath $stageRoot) { throw 'Staging directory must be new' }
$pending = & git -C $repo status --short --untracked-files=no
if ($LASTEXITCODE -ne 0 -or $pending) { throw 'The corresponding source must be committed before staging' }
$channel = Join-Path $stageRoot 'mobile-native'
$release = Join-Path $channel $version
New-Item -ItemType Directory -Path $release | Out-Null

$downloads = foreach ($abi in 'arm64-v8a','x86_64') {
    $apk = Join-Path $apkRoot "app-github-$abi-release.apk"
    $identity = (& (Join-Path $BuildTools 'aapt.exe') dump badging $apk) -join "`n"
    if ($LASTEXITCODE -ne 0 -or !$identity.Contains("name='$package' versionCode='$code' versionName='$version'") -or
        !$identity.Contains("native-code: '$abi'") -or !$identity.Contains("sdkVersion:'26'")) {
        throw "Unexpected APK identity: $abi"
    }
    $signature = (& (Join-Path $BuildTools 'apksigner.bat') verify --print-certs $apk) -join "`n"
    if ($LASTEXITCODE -ne 0 -or !$signature.Contains("Signer #1 certificate SHA-256 digest: $certificate")) {
        throw "Unexpected APK signing certificate: $abi"
    }
    $zip = [IO.Compression.ZipFile]::OpenRead($apk)
    try {
        foreach ($file in Get-ChildItem -File -Recurse -LiteralPath $assets) {
            $relative = [IO.Path]::GetRelativePath($assets, $file.FullName).Replace('\','/')
            $entry = $zip.GetEntry("assets/kuan-studio/$relative")
            if (!$entry) { throw "Missing asset in $abi APK: $relative" }
            $stream = $entry.Open()
            try {
                if ((Get-FileHash -InputStream $stream).Hash -ne (Get-FileHash -LiteralPath $file.FullName).Hash) {
                    throw "Stale asset in $abi APK: $relative"
                }
            } finally { $stream.Dispose() }
        }
    } finally { $zip.Dispose() }
    $name = "kuanapi-$version-$abi.apk"
    $target = Join-Path $release $name
    Copy-Item -LiteralPath $apk -Destination $target
    $bytes = (Get-Item -LiteralPath $target).Length
    [ordered]@{
        name = $name
        url = "$origin/$version/$name"
        size = ("{0:0.0} MiB" -f ($bytes / 1MB))
        bytes = $bytes
        sha256 = (Get-FileHash -LiteralPath $target).Hash.ToLowerInvariant()
        abi = $abi
    }
}

$source = Join-Path $release "kuanapi-$version-source.zip"
& git -C $repo archive --format=zip "--prefix=kuanapi-$version/" "--output=$source" HEAD
if ($LASTEXITCODE -ne 0) { throw 'Source export failed' }
Copy-Item -LiteralPath (Join-Path $repo 'app/src/main/res/drawable-nodpi/kuan_logo.png') -Destination (Join-Path $release 'logo.png')
Copy-Item -LiteralPath (Join-Path $repo 'distribution/android.html') -Destination (Join-Path $stageRoot 'android.html')
$hashes = foreach ($file in Get-ChildItem -File -LiteralPath $release | Sort-Object -Property Name) {
    (Get-FileHash -LiteralPath $file.FullName).Hash.ToLowerInvariant() + '  ' + $file.Name
}
$hashes | Set-Content -Encoding ascii -LiteralPath (Join-Path $release 'SHA256SUMS.txt')
[ordered]@{
    packageName = $package
    version = $version
    versionCode = $code
    publishedAt = [DateTimeOffset]::UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'")
    changelog = 'Adds Kuan API Image Studio with dynamic image models, reference editing, a prompt library, and gallery export. Original media projects remain available.'
    downloads = @($downloads)
} | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8NoBOM -LiteralPath (Join-Path $channel 'latest.json')
$hashes
