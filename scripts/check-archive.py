"""Inspect real tar members, extract only validated regular files, then check the delivered manifest and privacy."""
import hashlib,json,pathlib,re,sys,tarfile,tempfile
archive=pathlib.Path(sys.argv[1]);target=pathlib.Path(tempfile.mkdtemp(prefix='add-cms-extracted-'))
with tarfile.open(archive,'r:gz') as tar:
 members=tar.getmembers();names=set()
 for item in members:
  p=pathlib.PurePosixPath(item.name)
  assert p.parts and p.parts[0]=='add-cms' and not p.is_absolute() and '..' not in p.parts
  assert item.isfile() and not item.issym() and not item.islnk() and not item.pax_headers
  assert item.uid==item.gid==item.mtime==0 and not item.uname and not item.gname
  assert not any(part=='.DS_Store' or part.startswith('._') for part in p.parts)
  assert item.name not in names;names.add(item.name)
 for item in members:
  file=target.joinpath(*pathlib.PurePosixPath(item.name).parts);file.parent.mkdir(parents=True,exist_ok=True)
  file.write_bytes(tar.extractfile(item).read())
root=target/'add-cms';manifest=json.loads((root/'MANIFEST.json').read_text());expected={'add-cms/MANIFEST.json'}|{'add-cms/'+name for name in manifest['files']};assert names==expected
for name,digest in manifest['files'].items():
 file=root.joinpath(*pathlib.PurePosixPath(name).parts);data=file.read_bytes();assert hashlib.sha256(data).hexdigest()==digest
 assert not any(p in ['node_modules','.git','uploads','.env'] for p in pathlib.PurePosixPath(name).parts)
 assert not re.search(r'\.(sqlite|db|pem|key)$|(^|/)login\.txt$',name)
 if name in {'media/editor-preview.png','media/demo-cover.png'}:
  assert data.startswith(b'\x89PNG\r\n\x1a\n'), 'Expected PNG media signature'
  text=data.decode('utf-8',errors='ignore')
 elif name=='media/add-cms-demo.mp4':
  assert len(data)>12 and data[4:8]==b'ftyp', 'Expected MP4 media signature'
  text=data.decode('utf-8',errors='ignore')
 else:
  text=data.decode('utf-8')
 assert not re.search(r'/(?:Users|home)/[^\s"<>]+',text)
 assert not re.search(r'PAYLOAD_SECRET=[A-Za-z0-9]{12,}|-----BEGIN (?:RSA )?PRIVATE KEY-----',text)
result={'members':len(members),'filesVerified':len(manifest['files']),'extractedSkill':str(root),'appleDoubleAbsent':True,'ownershipMetadataAbsent':True,'hashesAndPrivacyPassed':True,'archiveSHA256':hashlib.sha256(archive.read_bytes()).hexdigest()}
print(json.dumps(result))
