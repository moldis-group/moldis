#!/usr/bin/env python3
"""Create the Level 3 index for the GitHub Pages browser from local XYZ filenames."""
import csv
from pathlib import Path

folder = Path(__file__).resolve().parent / 'level-3/OPT_wB97XD3_def2TZVP_119'
xyz_dir = folder / 'xyz'
paths = sorted(xyz_dir.glob('BNPAH_*.xyz'))
if not paths:
    raise SystemExit(f'No BNPAH_*.xyz files in {xyz_dir}')
output = folder / 'geometry_index.csv'
with output.open('w', newline='', encoding='utf-8') as handle:
    writer = csv.writer(handle)
    writer.writerow(['Mol_Index'])
    writer.writerows([[path.stem] for path in paths])
print(f'Wrote {len(paths)} molecule IDs to {output}')
