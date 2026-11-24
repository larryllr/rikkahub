"""Advance the native Android channel without changing the classic APK or update manifest."""

from argparse import ArgumentParser
from hashlib import sha256 as new_sha256
from pathlib import Path
import json
import os
import shutil
import tempfile


VERSION = '2.0.3'
VERSION_CODE = 6
PREVIOUS_VERSION = '2.0.2'
PREVIOUS_CODE = 5
PREVIOUS_MANIFEST_SHA = '7e68ae5a18ffb413886056e46f3be1f65493e41ce848d6063b680726b1056dd7'
PREVIOUS_PAGE_SHA = '87e486bf3543f24d7ec298825a98a6e2b2aa596f13197969dac965f8255110b5'
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
    names = {f'kuanapi-{version}-source.zip', 'logo.png', *(item['name'] for item in entries)}
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
            and 'kuanapi-1.6.10.apk' in content, 'The new shelf must expose both editions')
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
        require(not os.path.lexists(published) and not os.path.lexists(previous), 'Release version already staged or published')
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
            except Exception:
                switch_pointers(old_manifest, old_page)
                published.rename(staged / CHANNEL.name / VERSION)
                raise
        print(json.dumps({'published': VERSION, 'source_channel': prepared, 'download_page': page_sha,
                          'legacy_untouched': True, 'chat': baseline['chat']}))


if __name__ == '__main__':
    main()
