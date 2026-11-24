"""Verify complete public edition files and manifests against the staged bytes."""

from argparse import ArgumentParser
import json
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory

from publish_kuan_android import ORIGIN, VERSION, PREVIOUS_VERSION, verify_release, VERSION_CODE, require, sha256 as file_sha


def audit(origin, relative, local):
    url = origin + '/downloads/' + relative
    with TemporaryDirectory(prefix='kuan-native-verify-') as folder:
        file = Path(folder) / 'response'
        result = subprocess.run(
            ['curl', '--silent', '--show-error', '--fail', '--max-time', '90', '--proto', '=https',
             '--header', 'Cache-Control: no-cache', '--output', str(file),
             '--write-out', '%{http_code} %{url_effective}', url],
            capture_output=True, text=True, check=True)
        require(result.stdout == '200 ' + url, f'Unexpected public result: {url}')
        count, checksum = file.stat().st_size, file_sha(file)
        require(count == local.stat().st_size and checksum == file_sha(local), f'Wrong public bytes: {url}')
    print(json.dumps({'public': url, 'bytes': count, 'sha256': checksum}), flush=True)


def main():
    parser = ArgumentParser()
    parser.add_argument('stage', type=Path)
    parser.add_argument('classic_manifest', type=Path)
    parser.add_argument('--only', choices=('main', 'mirror'))
    args = parser.parse_args()
    stage = args.stage
    channel = stage / 'mobile-native'
    verify_release(channel, VERSION, VERSION_CODE, exact=True)
    require(json.loads(args.classic_manifest.read_bytes())['version'] == '1.6.10', 'Wrong classic baseline')
    files = {'android.html': stage / 'android.html', 'mobile-latest.json': args.classic_manifest,
             'mobile-native/latest.json': channel / 'latest.json'}
    for member in sorted((channel / VERSION).iterdir()):
        files[f'mobile-native/{VERSION}/{member.name}'] = member
    origins = {'main': ORIGIN, 'mirror': 'https://ai.larryllr.cc.cd'}
    for name, origin in origins.items():
        if args.only is not None and args.only != name:
            continue
        for relative, local in files.items():
            audit(origin, relative, local)
    print(json.dumps({'version': VERSION, 'previous_kept': PREVIOUS_VERSION}))


if __name__ == '__main__':
    main()
