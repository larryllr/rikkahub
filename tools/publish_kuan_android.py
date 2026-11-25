"""Advance the native Android channel without changing the classic APK or update manifest."""

from argparse import ArgumentParser
from hashlib import sha256 as new_sha256
from pathlib import Path
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from urllib.request import Request, urlopen


VERSION = '2.0.7'
VERSION_CODE = 10
PREVIOUS_VERSION = '2.0.6'
PREVIOUS_CODE = 9
PREVIOUS_MANIFEST_SHA = '6c271715bd5aaabc6b427260839884b3d4608ab421ba02138e716181b5aff337'
PREVIOUS_PAGE_SHA = 'ed6b1425a09147a324f3fecaa22d06837ce2e4437dc63b1eabdb9ab496658a0d'
PACKAGE = 'com.kuanapi.app.nativepreview'
ORIGIN = 'https://kuanapi.kuankuan.de5.net'
PUBLIC = Path('/opt/kuanapi-ha/sub2api/data/public/downloads')
CORE = Path('/opt/kuanapi-ha/sub2api/sub2api')
FRONTEND = Path('/opt/sub2api/frontend-dist/current')
PAGE = PUBLIC / 'android.html'
CHANNEL = PUBLIC / 'mobile-native'
ABIS = ('arm64-v8a', 'x86_64')
SOURCE_REPO = 'larryllr/rikkahub'


def sha256(path):
    digest = new_sha256()
    with path.open('rb') as src:
        for block in iter(lambda: src.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def require(condition, message):
    if not condition:
        raise ValueError(message)


def protected_snapshot(approval):
    current = FRONTEND.resolve(strict=True)
    require(approval.APPROVAL.read_bytes() == approval.approval_record(current),
            'The active Chat frontend differs from its approved checksum manifest')
    legacy = read_json(PUBLIC / 'mobile-latest.json')
    require(legacy.get('version') == '1.6.10' and legacy.get('app_code') == 33,
            'The legacy download changed; review the edition listed in android.html')
    legacy_apk = PUBLIC / 'kuanapi-1.6.10.apk'
    require(sha256(legacy_apk) == legacy.get('sha256'), 'The original APK differs from its public manifest')
    protected = (
        CORE, approval.APPROVAL, current / 'files.sha256', current / 'index.html',
        PUBLIC / 'mobile-latest.json', PUBLIC / 'kuanapi.apk', legacy_apk,
        PUBLIC / 'chat-resources/latest.json', PUBLIC / 'kuanapi-download-center.html',
        PUBLIC.parent / 'launcher/latest.json', PUBLIC / 'CodexSub2APIOnlineLauncher.exe',
        Path('/etc/kuanapi/gateway/runtime.json'),
    )
    return {'chat': current.name, 'files': {path.name if path.parent == current else str(path): sha256(path)
                                           for path in protected}}


def verify_release(channel, version, code, *, exact=False):
    require(not channel.is_symlink() and channel.is_dir(), 'Expected a real channel directory')
    release = channel / version
    require(not release.is_symlink() and release.is_dir(), 'Expected a real release directory')
    manifest = read_json(channel / 'latest.json')
    require(manifest.get('packageName') == PACKAGE and manifest.get('version') == version
            and manifest.get('versionCode') == code, 'Unexpected update identity')
    entries = manifest.get('downloads', [])
    require(len(entries) == len(ABIS) and {item['abi'] for item in entries} == set(ABIS),
            'Each supported architecture needs one release APK')
    for item in entries:
        name = f"kuanapi-{version}-{item['abi']}.apk"
        file = release / name
        require(item['name'] == name and item['url'] == f'{ORIGIN}/downloads/mobile-native/{version}/{name}'
                and item['bytes'] == file.stat().st_size and item['sha256'] == sha256(file), 'APK differs from update metadata')
    names = {'logo.png', *(item['name'] for item in entries)}
    if code >= 10:
        require(manifest.get('source_url') == f'https://github.com/{SOURCE_REPO}/tree/kuanapi-v{version}'
                and re.fullmatch(r'[0-9a-f]{40}', manifest.get('source_commit', '')),
                'The equivalent GitHub source is not recorded in the manifest')
    else:
        names.add(f'kuanapi-{version}-source.zip')
    expected = {}
    for line in (release / 'SHA256SUMS.txt').read_text(encoding='ascii').splitlines():
        checksum, name = line.split('  ', 1)
        require(name in names and name not in expected and sha256(release / name) == checksum,
                'Release checksum file does not match')
        expected[name] = checksum
    require(set(expected) == names and {path.name for path in release.iterdir()} == names | {'SHA256SUMS.txt'}
            and not (channel / 'latest.json').is_symlink()
            and not any(path.is_symlink() for path in release.iterdir()), 'Unexpected release members')
    if exact:
        require({p.name for p in channel.iterdir()} == {version, 'latest.json'}, 'Unexpected staging channel members')
    return {'manifest': sha256(channel / 'latest.json'), 'release': expected}


def verify_source_ref(version, expected):
    url = f'https://api.github.com/repos/{SOURCE_REPO}/git/ref/tags/kuanapi-v{version}'
    request = Request(url, headers={'User-Agent': 'KuanAPI-Release-Verification/1.0'})
    with urlopen(request, timeout=20) as response:
        require(response.status == 200 and response.url == url, 'GitHub source tag unavailable')
        obj = json.load(response)['object']
    require(obj['type'] == 'commit' and obj['sha'] == expected, 'GitHub tag does not match the APK source commit')


def replace_public(source, target):
    with tempfile.TemporaryDirectory(prefix='.kuan-native-pointer-', dir=target.parent) as temporary:
        candidate = Path(temporary) / target.name
        shutil.copyfile(source, candidate)
        candidate.chmod(0o644)
        candidate.replace(target)


def switch_pointers(manifest, page):
    replace_public(page, PAGE)
    replace_public(manifest, CHANNEL / 'latest.json')


def main():
    import frontend_approval as approval

    parser = ArgumentParser()
    parser.add_argument('action', choices=('publish', 'withdraw'))
    parser.add_argument('staging', type=Path)
    args = parser.parse_args()
    incoming = args.staging.resolve(strict=True)
    prepared = verify_release(incoming / CHANNEL.name, VERSION, VERSION_CODE, exact=True)
    staging_page = incoming / PAGE.name
    require(staging_page.is_file() and not staging_page.is_symlink(), 'Missing public Android download page')
    page_sha = sha256(staging_page)
    content = staging_page.read_text(encoding='utf-8')
    require('id="native"' in content and f'mobile-native/{VERSION}/kuanapi-{VERSION}-arm64-v8a.apk' in content
            and 'kuanapi-1.6.10.apk' in content and '-source.zip' not in content
            and not re.search(r'<a\b[^>]*href=["\'][^"\']*github\.com', content, re.I),
            'The Android download page must list both editions and no source downloads')
    previous = incoming / 'previous'
    old_page = previous / PAGE.name
    old_manifest = previous / 'latest.json'
    live_manifest = CHANNEL / 'latest.json'
    published = CHANNEL / VERSION

    with approval.publication_locks():
        baseline = protected_snapshot(approval)
        if args.action == 'withdraw':
            require(verify_release(CHANNEL, VERSION, VERSION_CODE) == prepared and sha256(PAGE) == page_sha,
                    'The live release no longer matches staging')
            require(sha256(old_page) == PREVIOUS_PAGE_SHA and sha256(old_manifest) == PREVIOUS_MANIFEST_SHA,
                    'The saved rollback bytes do not match the previous release')
            private = Path(tempfile.mkdtemp(prefix='kuan-native-withdrawn-', dir=PUBLIC.parent.parent))
            try:
                switch_pointers(old_manifest, old_page)
                verify_release(CHANNEL, PREVIOUS_VERSION, PREVIOUS_CODE)
                published.rename(private / VERSION)
            except Exception:
                switch_pointers(incoming / CHANNEL.name / 'latest.json', staging_page)
                raise
            require(protected_snapshot(approval) == baseline, 'A protected legacy release changed concurrently')
            print(json.dumps({'withdrawn': VERSION, 'files_moved_to': str(private)}))
            return

        old_release = verify_release(CHANNEL, PREVIOUS_VERSION, PREVIOUS_CODE)
        require(sha256(PAGE) == PREVIOUS_PAGE_SHA and old_release['manifest'] == PREVIOUS_MANIFEST_SHA,
                f'The public {PREVIOUS_VERSION} baseline changed; review before advancing the channel')
        require(not os.path.lexists(published), 'Release version already published')
        source_commit = read_json(incoming / CHANNEL.name / 'latest.json')['source_commit']
        verify_source_ref(VERSION, source_commit)
        if previous.exists():
            require(sha256(old_page) == PREVIOUS_PAGE_SHA and sha256(old_manifest) == PREVIOUS_MANIFEST_SHA,
                    'Previous release was not fully restored')
        else:
            previous.mkdir(mode=0o700)
            shutil.copyfile(PAGE, old_page)
            shutil.copyfile(live_manifest, old_manifest)
        with tempfile.TemporaryDirectory(prefix='kuan-native-publish-', dir=PUBLIC.parent.parent) as temporary:
            staged = Path(temporary)
            shutil.copytree(incoming / CHANNEL.name, staged / CHANNEL.name)
            shutil.copyfile(staging_page, staged / PAGE.name)
            for path in (staged / CHANNEL.name, *(staged / CHANNEL.name).rglob('*'), staged / PAGE.name):
                path.chmod(0o755 if path.is_dir() else 0o644)
            require(verify_release(staged / CHANNEL.name, VERSION, VERSION_CODE, exact=True) == prepared and sha256(staged / PAGE.name) == page_sha,
                    'The staged public bytes changed during transfer')
            (staged / CHANNEL.name / VERSION).rename(published)
            try:
                switch_pointers(staged / CHANNEL.name / 'latest.json', staged / PAGE.name)
                require(verify_release(CHANNEL, VERSION, VERSION_CODE) == prepared and sha256(PAGE) == page_sha,
                        'The live native files do not match the staged release')
                require(all(sha256(CHANNEL / PREVIOUS_VERSION / name) == checksum
                            for name, checksum in old_release['release'].items()), 'The previous native release changed concurrently')
                require(protected_snapshot(approval) == baseline, 'A protected legacy release changed concurrently')
                subprocess.run([sys.executable, '-B', str(Path(__file__).with_name('verify_kuan_android_public.py')),
                                str(incoming), str(PUBLIC / 'mobile-latest.json')], check=True, timeout=220)
            except Exception:
                switch_pointers(old_manifest, old_page)
                published.rename(staged / CHANNEL.name / VERSION)
                raise
        print(json.dumps({'published': VERSION, 'source_commit': source_commit, 'source_channel': prepared, 'download_page': page_sha,
                          'legacy_untouched': True, 'chat': baseline['chat']}))


if __name__ == '__main__':
    main()
