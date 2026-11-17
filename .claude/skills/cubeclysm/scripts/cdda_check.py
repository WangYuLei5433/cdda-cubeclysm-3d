#!/usr/bin/env python3
"""Check CDDA monsters against the official data before (and after) modelling them.

  python3 cdda_check.py mon_zombie_spitter mon_zombie_corrosive   # one block per id
  python3 cdda_check.py --coverage                                # what is bound, what is left

Per id: the official name (en / zh_CN), copy-from chain, description, volume, weight and the
size class CDDA derives from the volume (src/monstergenerator.cpp volume_to_size), the volume
relative to mon_zombie (the target for the model), and, if the model is built, the model's own
block volume relative to the built mon_zombie and the lowest parts (they should rest on y = 0).

Paths (override with env vars):
  LIB     the library root            (default: four levels up from this script)
  STUDIO  cdda-voxel-studio            (default: $LIB/../cdda-voxel-studio)
  CDDA    CDDA data/json (descriptions) (default: $LIB/../Cataclysm-Vox/vendor/cdda/data/json)
"""
import glob
import json
import os
import re
import struct
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../../../..'))
STUDIO = os.environ.get('STUDIO') or os.path.join(LIB, '../cdda-voxel-studio')
CDDA = os.environ.get('CDDA') or os.path.join(LIB, '../Cataclysm-Vox/vendor/cdda/data/json')
DATA = os.path.join(STUDIO, 'public/data/cdda')
ZOMBIE_L = 62.5


def size_class(ml):
    # src/monstergenerator.cpp volume_to_size
    if ml <= 7500: return 'tiny'
    if ml <= 46250: return 'small'
    if ml <= 108000: return 'medium'
    if ml <= 483750: return 'large'
    return 'huge'


def load_catalog():
    index = json.load(open(os.path.join(DATA, 'index.json')))
    v = index['versions'][0]
    root = os.path.join(DATA, os.path.dirname(v['path']))
    cat = json.load(open(os.path.join(DATA, v['path'])))
    names = json.load(open(os.path.join(root, 'names.zh_CN.json')))['kinds'].get('monster', {})
    return v, {m['id']: m for m in cat['monster']}, names


def load_cdda_json():
    """Every MONSTER object (and abstract) by id, for descriptions and copy-from."""
    mons = {}
    for f in glob.glob(os.path.join(CDDA, '**/*.json'), recursive=True):
        try:
            d = json.load(open(f))
        except Exception:
            continue
        for o in d if isinstance(d, list) else [d]:
            if isinstance(o, dict) and o.get('type') == 'MONSTER':
                k = o.get('id') or o.get('abstract')
                if isinstance(k, str):
                    mons[k] = o
    return mons


def resolved(mons, i, key):
    seen = 0
    while i in mons and seen < 15:
        o = mons[i]
        if key in o:
            return o[key]
        i = o.get('copy-from'); seen += 1
    return None


def text(v):
    if isinstance(v, dict):
        return v.get('str') or v.get('str_sp') or ''
    return v or ''


def glb_volume(path):
    """Sum of block volumes (each block mesh is a box; fx_ particles excluded)."""
    d = open(path, 'rb').read()
    n = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + n])
    v = 0.0
    for node in j['nodes']:
        if 'mesh' not in node or node.get('name', '').startswith('fx_'):
            continue
        for pr in j['meshes'][node['mesh']]['primitives']:
            a = j['accessors'][pr['attributes']['POSITION']]
            mn, mx = a['min'], a['max']
            v += (mx[0] - mn[0]) * (mx[1] - mn[1]) * (mx[2] - mn[2])
    return v


def bound_ids():
    ids = set()
    p = os.path.join(LIB, 'meshset.json')
    if os.path.exists(p):
        for e in json.load(open(p))['models']:
            i = e.get('id')
            if i:
                ids.update(i if isinstance(i, list) else [i])
    return ids


def built_index():
    p = os.path.join(LIB, 'sources/cubeclysm/index.json')
    if not os.path.exists(p):
        return {}
    idx = json.load(open(p))
    return {m['id']: m for m in idx.get('models', [])}


def check(ids):
    v, cat, zh = load_catalog()
    mons = load_cdda_json()
    built = built_index()
    zdir = os.path.join(LIB, 'sources/cubeclysm/zombies')
    base = glb_volume(os.path.join(zdir, 'mon_zombie.glb')) if os.path.exists(os.path.join(zdir, 'mon_zombie.glb')) else None
    print(f"CDDA {v['cdda']} (commit {v.get('commit', '?')[:7]}) — studio catalog; descriptions from {os.path.relpath(CDDA, LIB)}\n")
    for i in ids:
        m = cat.get(i)
        if not m:
            print(f'{i}: NOT IN THE CATALOG (wrong id, or another CDDA version)\n'); continue
        chain, k = [], i
        while k in mons and mons[k].get('copy-from') and len(chain) < 8:
            k = mons[k]['copy-from']; chain.append(k)
        ml = m.get('volume') or 0
        print(f"{i}  {m.get('en', '')} / {zh.get(i, '?')}")
        print(f"  copy-from: {' › '.join(chain) or '-'}   file: {m.get('file')}")
        print(f"  volume {ml / 1000:g} L ({size_class(ml)}), weight {(m.get('weight') or 0) / 1000:g} kg  →  target {ml / 1000 / ZOMBIE_L:.2f}× mon_zombie")
        print(f"  description: {text(resolved(mons, i, 'description'))}")
        b = built.get(i)
        glb = os.path.join(zdir, f'{i}.glb')
        if b and base and os.path.exists(glb):
            have = glb_volume(glb) / base
            want = ml / 1000 / ZOMBIE_L
            ok = 'ok' if 0.75 <= have / want <= 1.45 else 'CHECK'
            print(f"  model: {have:.2f}× (ratio {have / want:.2f}, {ok}; gear may add up to ~1.4)  size {b['size']} m  lowest: {', '.join(b.get('low', [])[:3])}")
        print()


ANIMAL = re.compile(r'dog|zeer|zeindeer|ziger|zoose|zougar|zombear|zow$|zhark|zllama|zolf|zombeaver|goat|horse|pig|sheep|zombull|wolf|zpig|frog|toad|bufo|tadpole|zombtree|plague_nymph')
OTHER_FILES = ['zed_fusion', 'zed_amalgamation', 'zed-pupating', 'zed-medical', 'singularities', 'nether', 'cabins_inner',
               'string_dimension', 'zed_tentacle', 'scarlet', 'zed-winged', 'zed_dormant', 'mammal']


def coverage():
    v, cat, zh = load_catalog()
    bound = bound_ids()
    groups = defaultdict(list)
    for m in cat.values():
        if 'ZOMBIE' not in (m.get('species') or []):
            continue
        i, f = m['id'], m.get('file', '')
        if i in bound: g = 'bound'
        elif 'debug' in i or i.startswith('pseudo') or 'no_weakpoints' in i: g = 'debug'
        elif ANIMAL.search(i): g = 'animal'
        elif 'fungus_zombie' in f: g = 'fungal/dusted'
        elif any(k in f for k in OTHER_FILES): g = 'other mutant'
        else: g = 'humanoid'
        groups[g].append(i)
    total = sum(len(x) for x in groups.values())
    print(f"ZOMBIE-species monsters in CDDA {v['cdda']}: {total}")
    for g in ['bound', 'humanoid', 'fungal/dusted', 'other mutant', 'animal', 'debug']:
        print(f'  {g:14} {len(groups[g])}')
    for g in ['humanoid', 'fungal/dusted']:
        print(f'\n{g} left:')
        byfile = defaultdict(list)
        for i in groups[g]:
            byfile[os.path.basename(cat[i].get('file', ''))].append(f'{i} ({zh.get(i, "?")})')
        for f in sorted(byfile):
            print(f'  {f}: ' + ', '.join(sorted(byfile[f])))


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args == ['--coverage']:
        coverage()
    else:
        check(args)
