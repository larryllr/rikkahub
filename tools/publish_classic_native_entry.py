"""Put the independent Android 2.0 link in the current classic update panel."""

from argparse import ArgumentParser
from datetime import datetime, timezone
from hashlib import sha256
import json
import os
from pathlib import Path
import shutil
import subprocess
from tempfile import TemporaryDirectory
import zipfile

from build_mobile_resources import build
from frontend_approval import APPROVAL, approval_record, publication_locks, write_approval


PUBLIC = Path('/opt/kuanapi-ha/sub2api/data/public/downloads')
CORE = Path('/opt/kuanapi-ha/sub2api/sub2api')
CURRENT = Path('/opt/sub2api/frontend-dist/current')
UPDATE = PUBLIC / 'chat-resources/latest.json'
BASE = 'kuanapi-chat-launcher-exe-20261122-r1'
BASE_CONTRACT = '1aae0d1631acb239e2efe69682b03a9a4151d251d5d65975e43a0e235c850058'
BASE_SCRIPT = 'assets/chat-answer-layout-15635ded3cd5a0aa/updates.js'
BASE_SCRIPT_SHA = '8fd6e03b4a202bc80ac1eb1d9e795f06cd307e9d1554599f9aab5643e82dac58'
RELEASE = 'kuanapi-chat-android-native-entry-20261124-r1'
ORIGINS = ('https://kuanapi.kuankuan.de5.net', 'https://ai.larryllr.cc.cd')


def digest(data):
    return sha256(data).hexdigest()


def file_digest(path):
    value = sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1 << 20), b''):
            value.update(block)
    return value.hexdigest()


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=True, indent=2) + '\n').encode('ascii')


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def replace_once(data, old, new):
    require(data.count(old) == 1, 'The expected classic update markup changed')
    return data.replace(old, new, 1)


def update_script(source):
    require(digest(source) == BASE_SCRIPT_SHA, 'Classic update script does not match the approved baseline')
    chinese = ('<div><a href="/downloads/android.html#native" data-native-download>'
               '\u4e0b\u8f7d\u5bbd API 2.0</a></div>').encode()
    return replace_once(source, b'</div>\';\n    panel.querySelector', b'</div>' + chinese + b"';\n    panel.querySelector")


def atomic(path, data, mode=0o644):
    with TemporaryDirectory(prefix='.kuan-write-', dir=path.parent) as folder:
        temp = Path(folder) / path.name
        with temp.open('xb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        temp.chmod(mode)
        temp.replace(path)


def point(root):
    with TemporaryDirectory(prefix='.kuan-pointer-', dir=CURRENT.parent) as folder:
        temp = Path(folder) / 'current'
        temp.symlink_to(root)
        temp.replace(CURRENT)


def candidate(source, destination):
    contract_name = 'chat-bundle-files.json'
    require(source.name == BASE, 'Classic frontend changed since review')
    original = (source / contract_name).read_bytes()
    require(digest(original) == BASE_CONTRACT, 'Classic frontend contract differs')
    require(APPROVAL.read_bytes() == approval_record(source), 'Classic frontend is not currently approved')
    script = update_script((source / BASE_SCRIPT).read_bytes())
    name = 'assets/' + RELEASE + '/updates-' + digest(script)[:16] + '.js'
    index = replace_once((source / 'index.html').read_bytes(), ('/' + BASE_SCRIPT).encode(), ('/' + name).encode())
    contract = json.loads(original)
    change = {'index.html': index, name: script}
    contract['files'].update({path: digest(data) for path, data in change.items()})
    contract.update(release=RELEASE, base=BASE, reviewed_changes=list(change), reviewed_removals=[])
    overlay = {**change, contract_name: json_bytes(contract),
               '.kuanapi-release.json': json_bytes({'release': RELEASE, 'scope': 'classic-native-download-entry'})}
    with TemporaryDirectory(prefix='.kuan-classic-candidate-', dir=destination.parent) as workspace:
        staged = Path(workspace) / RELEASE
        shutil.copytree(source, staged)
        for rel, data in overlay.items():
            target = staged / rel
            target.parent.mkdir(exist_ok=True, parents=True)
            target.write_bytes(data)
        for suffix in ('.gz', '.br', '.zst'):
            (staged / ('index.html' + suffix)).unlink(missing_ok=True)
        lines = []
        for file in sorted(staged.rglob('*')):
            if file.is_file() and file != staged / 'files.sha256':
                lines.append(file_digest(file) + '  ' + file.relative_to(staged).as_posix())
        (staged / 'files.sha256').write_text('\n'.join(lines) + '\n', encoding='ascii')
        approval_record(staged)
        require(not destination.exists(), 'An immutable candidate with this name exists already')
        staged.rename(destination)
    return change


def protected():
    paths = (CORE, PUBLIC / 'mobile-latest.json', PUBLIC / 'kuanapi.apk',
             PUBLIC / 'kuanapi-1.6.10.apk', PUBLIC / 'CodexSub2APIOnlineLauncher.exe',
             Path('/etc/kuanapi/gateway/runtime.json'))
    return {str(path): file_digest(path) for path in paths}


def fetch(origin, route, expected):
    url = origin + route
    with TemporaryDirectory(prefix='kuan-classic-verify-') as folder:
        file = Path(folder) / 'response'
        result = subprocess.run(
            ['curl', '--silent', '--show-error', '--fail', '--max-time', '90', '--proto', '=https',
             '--header', 'Cache-Control: no-cache', '--output', str(file),
             '--write-out', '%{http_code} %{url_effective}', url],
            capture_output=True, text=True, check=True)
        require(result.stdout == '200 ' + url, 'Unexpected public endpoint response: ' + route)
        require(file.stat().st_size == len(expected) and file_digest(file) == digest(expected), 'Incorrect public bytes: ' + url)


def checked_bundle(frontend, archive, changes):
    checksum = build(frontend, archive)
    version = archive.with_name('web-bundle-version.txt').read_text().strip()
    with zipfile.ZipFile(archive) as bundle:
        require(all(bundle.read(name) == value for name, value in changes.items()), 'Classic offline bundle misses the link')
    return checksum, version


def prepare(stage):
    with publication_locks():
        source = CURRENT.resolve(strict=True)
        baseline = protected()
        require(json.loads(UPDATE.read_bytes())['version'] == '7fedc4145d4207ee1a0a', 'The classic resource baseline changed')
        release = stage / RELEASE
        changes = candidate(source, release)
        checksum, version = checked_bundle(release, stage / 'preflight.zip', changes)
        require(protected() == baseline and CURRENT.resolve(strict=True) == source, 'The classic baseline changed')
    print(json.dumps({'prepared': RELEASE, 'resource_version': version, 'sha256': checksum,
                      'changes': list(changes)}))


def deploy(stage):
    source = CURRENT.resolve(strict=True)
    release = CURRENT.parent / 'releases' / RELEASE
    archive = stage / 'resources.zip'
    with publication_locks():
        baseline = protected()
        old_manifest = UPDATE.read_bytes()
        require(json.loads(old_manifest)['version'] == '7fedc4145d4207ee1a0a', 'The classic resource baseline changed')
        require(not (stage / 'rollback.json').exists(), 'Publication already attempted; inspect the receipt')
        changes = candidate(source, release)
        checksum, version = checked_bundle(release, archive, changes)
        preflight = stage / 'preflight.zip'
        require(preflight.is_file() and file_digest(preflight) == checksum, 'Classic release does not match the reviewed preflight ZIP')
        target = UPDATE.parent / (version + '.zip')
        data = archive.read_bytes()
        require(not target.exists() or file_digest(target) == checksum, 'A published resource hash has conflicting bytes')
        if not target.exists():
            atomic(target, data)
        route = '/downloads/chat-resources/' + target.name
        manifest = json_bytes(dict(json.loads(old_manifest), version=version, sha256=checksum,
                                   size=len(data), url=ORIGINS[0] + route))
        atomic(stage / 'previous-latest.json', old_manifest, 0o600)
        atomic(stage / 'rollback.json', json_bytes({'frontend': str(source), 'resource_version': version}), 0o600)
        try:
            point(release)
            write_approval(release)
            atomic(UPDATE, manifest)
            for origin in ORIGINS:
                fetch(origin, '/downloads/chat-resources/latest.json', manifest)
                fetch(origin, route, data)
                for name, value in changes.items():
                    fetch(origin, '/chat' if name == 'index.html' else '/' + name, value)
            require(protected() == baseline, 'A protected artifact changed during release')
        except BaseException:
            atomic(UPDATE, old_manifest)
            point(source)
            write_approval(source)
            raise
        receipt = {'release': RELEASE, 'version': version, 'sha256': checksum, 'size': len(data),
                   'updated_at': datetime.now(timezone.utc).isoformat(),
                   'changed': {name: digest(value) for name, value in changes.items()}, 'domains': ORIGINS}
        atomic(stage / 'deployed.json', json_bytes(receipt), 0o600)
        print(json.dumps(receipt))


def rollback(stage):
    record = json.loads((stage / 'rollback.json').read_bytes())
    source = Path(record['frontend']).resolve(strict=True)
    with publication_locks():
        require(CURRENT.resolve().name == RELEASE and json.loads(UPDATE.read_bytes())['version'] == record['resource_version'],
                'Classic frontend or resource pointer no longer belongs to this release')
        require(source.parent == CURRENT.parent / 'releases' and source.name == BASE, 'Invalid classic rollback source')
        approval_record(source)
        atomic(UPDATE, (stage / 'previous-latest.json').read_bytes())
        point(source)
        write_approval(source)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('action', choices=('prepare', 'publish', 'rollback'))
    parser.add_argument('stage', type=Path)
    args = parser.parse_args()
    {'prepare': prepare, 'publish': deploy, 'rollback': rollback}[args.action](args.stage.resolve(strict=True))
