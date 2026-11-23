"""Publish or withdraw the first native Android channel without changing legacy channels."""

from argparse import ArgumentParser
from hashlib import sha256 as new_sha256
from pathlib import Path
import json
import os
import shutil
import tempfile


VERSION = '2.0.0'
VERSION_CODE = 3
PACKAGE = 'com.kuanapi.app.nativepreview'
ORIGIN = 'https://kuanapi.kuankuan.de5.net'
PUBLIC = Path('/opt/kuanapi-ha/sub2api/data/public/downloads')
CORE = Path('/opt/kuanapi-ha/sub2api/sub2api')
FRONTEND = Path('/opt/sub2api/frontend-dist/current')
PAGE = PUBLIC / 'android.html'
CHANNEL = PUBLIC / 'mobile-native'
ABIS = ('arm64-v8a', 'x86_64')


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
        PUBLIC / 'chat-resources/latest.json',
    )
    return {'chat': current.name, 'files': {path.name if path.parent == current else str(path): sha256(path)
                                           for path in protected}}


def verify_release(channel):
    require(not channel.is_symlink() and channel.is_dir(), 'Expected a real channel directory')
    release = channel / VERSION
    manifest = read_json(channel / 'latest.json')
    require(manifest.get('packageName') == PACKAGE and manifest.get('version') == VERSION
            and manifest.get('versionCode') == VERSION_CODE, 'Unexpected update identity')
    entries = manifest.get('downloads', [])
    require(len(entries) == len(ABIS) and {item['abi'] for item in entries} == set(ABIS),
            'Each supported architecture needs one release APK')
    for item in entries:
        name = f"kuanapi-{VERSION}-{item['abi']}.apk"
        file = release / name
        require(item['name'] == name and item['url'] == f'{ORIGIN}/downloads/mobile-native/{VERSION}/{name}'
                and item['bytes'] == file.stat().st_size and item['sha256'] == sha256(file), 'APK differs from update metadata')
    names = {'kuanapi-2.0.0-source.zip', 'logo.png', *(item['name'] for item in entries)}
    expected = {}
    for line in (release / 'SHA256SUMS.txt').read_text(encoding='ascii').splitlines():
        checksum, name = line.split('  ', 1)
        require(name in names and name not in expected and sha256(release / name) == checksum,
                'Release checksum file does not match')
        expected[name] = checksum
    require(set(expected) == names and {path.name for path in release.iterdir()} == names | {'SHA256SUMS.txt'}
            and {p.name for p in channel.iterdir()} == {VERSION, 'latest.json'}
            and not any(path.is_symlink() for path in channel.rglob('*')), 'Unexpected release members')
    return {'manifest': sha256(channel / 'latest.json'), 'release': expected}


def withdraw_into(destination):
    # Preserve the public bytes in a private directory on the same filesystem.
    PAGE.rename(destination / PAGE.name)
    try:
        CHANNEL.rename(destination / CHANNEL.name)
    except OSError:
        (destination / PAGE.name).rename(PAGE)
        raise


def main():
    import frontend_approval as approval

    parser = ArgumentParser()
    parser.add_argument('action', choices=('publish', 'withdraw'))
    parser.add_argument('staging', type=Path)
    args = parser.parse_args()
    incoming = args.staging.resolve(strict=True)
    prepared = verify_release(incoming / CHANNEL.name)
    staging_page = incoming / PAGE.name
    require(staging_page.is_file() and not staging_page.is_symlink(), 'Missing public Android download page')
    page_sha = sha256(staging_page)

    with approval.publication_locks():
        baseline = protected_snapshot(approval)
        if args.action == 'withdraw':
            require(verify_release(CHANNEL) == prepared and sha256(PAGE) == page_sha, 'The live release no longer matches staging')
            private = Path(tempfile.mkdtemp(prefix='kuan-native-withdrawn-', dir=PUBLIC.parent.parent))
            withdraw_into(private)
            require(protected_snapshot(approval) == baseline, 'A protected legacy release changed concurrently')
            print(json.dumps({'withdrawn': VERSION, 'files_moved_to': str(private)}))
            return

        require(not os.path.lexists(CHANNEL) and not os.path.lexists(PAGE), 'An Android native channel or shelf already exists')
        with tempfile.TemporaryDirectory(prefix='kuan-native-publish-', dir=PUBLIC.parent.parent) as temporary:
            staged = Path(temporary)
            shutil.copytree(incoming / CHANNEL.name, staged / CHANNEL.name)
            shutil.copyfile(staging_page, staged / PAGE.name)
            for path in (staged / CHANNEL.name, *(staged / CHANNEL.name).rglob('*'), staged / PAGE.name):
                path.chmod(0o755 if path.is_dir() else 0o644)
            require(verify_release(staged / CHANNEL.name) == prepared and sha256(staged / PAGE.name) == page_sha,
                    'The staged public bytes changed during transfer')
            (staged / CHANNEL.name).rename(CHANNEL)
            page_published = False
            try:
                os.link(staged / PAGE.name, PAGE)
                page_published = True
                require(protected_snapshot(approval) == baseline, 'A protected legacy release changed concurrently')
            except Exception:
                if page_published:
                    PAGE.unlink()
                CHANNEL.rename(staged / CHANNEL.name)
                raise
        print(json.dumps({'published': VERSION, 'source_channel': prepared, 'download_page': page_sha,
                          'legacy_untouched': True, 'chat': baseline['chat']}))


if __name__ == '__main__':
    main()
