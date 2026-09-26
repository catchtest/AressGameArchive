"""Package generated website files only; repository documentation stays on GitHub."""
from pathlib import Path
import shutil


def prepare(source, destination):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if destination.exists():
        raise ValueError(f'Artifact directory already exists: {destination}')
    destination.mkdir(parents=True)
    for path in source.iterdir():
        if path.is_symlink():
            raise ValueError(f'Symbolic links cannot be published: {path}')
        if path.is_file() and (path.suffix == '.html' or path.name in {'robots.txt', 'sitemap.xml', 'CNAME'}):
            shutil.copy2(path, destination / path.name)
        elif path.is_dir() and not path.name.startswith('.') and (path.name == 'assets' or (path / 'index.html').is_file()):
            shutil.copytree(path, destination / path.name,
                            ignore=shutil.ignore_patterns('*.md', '.git', '.github', '_config.yml', '.nojekyll'))
    if not (destination / 'index.html').is_file():
        raise ValueError('Missing website index.html')


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[2]
    prepare(root, root / '_site')
