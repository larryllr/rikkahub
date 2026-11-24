"""Verify complete public edition files and manifests against the staged bytes."""

from argparse import ArgumentParser
from hashlib import sha256
import json
from pathlib import Path
from urllib.request import Request, urlopen

from publish_kuan_android import ORIGIN, VERSION, PREVIOUS_VERSION, verify_release, VERSION_CODE, require, sha256 as file_sha


def audit(origin, relative, local):
    url = origin + '/downloads/' + relative
    digest = sha256()
    count = 0
    with urlopen(Request(url, headers={'Cache-Control': 'no-cache', 'Accept-Encoding': 'identity'}), timeout=45) as response:
        require(response.url == url and response.status == 200, f'Unexpected public result: {url}')
        for block in iter(lambda: response.read(1024 * 1024), b''):
            count += len(block)
            digest.update(block)
    require(count == local.stat().st_size and digest.hexdigest() == file_sha(local), f'Wrong public bytes: {url}')
    print(json.dumps({'public': url, 'bytes': count, 'sha256': digest.hexdigest()}), flush=True)


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
