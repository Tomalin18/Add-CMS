"""Deterministic standard-library archive; do not inherit OS ownership, xattrs or AppleDouble files."""
import gzip, pathlib, sys, tarfile
source=pathlib.Path(sys.argv[1]).resolve();target=pathlib.Path(sys.argv[2]).resolve()
if target.exists():raise SystemExit('Archive exists; no overwrite.')
with target.open('xb') as raw, gzip.GzipFile(fileobj=raw,mode='wb',filename='',mtime=0) as zipped, tarfile.open(fileobj=zipped,mode='w',format=tarfile.USTAR_FORMAT) as archive:
 for file in sorted(source.rglob('*'),key=lambda p:p.relative_to(source).as_posix()):
  if any(part=='.DS_Store' or part.startswith('._') for part in file.relative_to(source).parts):continue
  if file.is_symlink():raise SystemExit('Symlinks are excluded.')
  if file.is_dir():continue
  if not file.is_file():raise SystemExit('Regular files only.')
  info=tarfile.TarInfo('add-cms/'+file.relative_to(source).as_posix());info.size=file.stat().st_size;info.mode=0o644;info.uid=info.gid=0;info.uname=info.gname='';info.mtime=0
  with file.open('rb') as stream:archive.addfile(info,stream)
