from pathlib import Path
import re
import sys


def safe_filename(title, index):
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", title.strip())
    name = name.strip(" .")
    return name or f"molecule_{index}"


def split_xyz(input_file, output_dir):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    used_names = set()

    with open(input_file, encoding="utf-8") as source:
        index = 0

        while True:
            count_line = source.readline()
            if not count_line:
                break
            if not count_line.strip():
                continue

            index += 1
            try:
                atom_count = int(count_line.strip())
            except ValueError as exc:
                raise ValueError(
                    f"Invalid atom count at molecule {index}: {count_line.strip()!r}"
                ) from exc

            title_line = source.readline()
            if not title_line:
                raise ValueError(f"Missing title for molecule {index}")

            atoms = [source.readline() for _ in range(atom_count)]
            if any(not line or not line.strip() for line in atoms):
                raise ValueError(f"Incomplete atom list for molecule {index}")

            base = safe_filename(title_line, index)
            name = base
            suffix = 2
            while name in used_names or (output_dir / f"{name}.xyz").exists():
                name = f"{base}_{suffix}"
                suffix += 1
            used_names.add(name)

            output_file = output_dir / f"{name}.xyz"
            with open(output_file, "w", encoding="utf-8") as target:
                target.write(f"{atom_count}\n")
                target.write(title_line)
                target.writelines(atoms)

            print(output_file)

    print(f"Wrote {index} molecules.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Usage: python split.py multi.xyz output_directory")

    split_xyz(sys.argv[1], sys.argv[2])
