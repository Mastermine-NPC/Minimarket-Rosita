import pathlib,json,struct,copy
p=pathlib.Path('public/images/video/archivos-glb/lays_bags__10_different_flavours__gameready.glb');b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+n]);binary=b[28+n:]; out=copy.deepcopy(g)
# Retain the original axis transforms, only Classic, all original maps and geometry.
out['nodes']=copy.deepcopy(g['nodes'][:5]);out['nodes'][2]['children']=[3];out['meshes']=[copy.deepcopy(g['meshes'][0])];out['materials']=[copy.deepcopy(g['materials'][0])]
views=set();access=set();textures=set();images=set()
for prim in out['meshes'][0]['primitives']:
 access.update(prim['attributes'].values());access.add(prim['indices'])
for a in access: views.add(g['accessors'][a]['bufferView'])
mat=out['materials'][0]
def tx(o):
 if isinstance(o,dict):
  for k,v in o.items():
   if k.endswith('Texture') and isinstance(v,dict):textures.add(v['index'])
   else:tx(v)
 elif isinstance(o,list):
  for v in o:tx(v)
tx(mat)
for t in textures:images.add(g['textures'][t]['source'])
for i in images:views.add(g['images'][i]['bufferView'])
am={v:i for i,v in enumerate(sorted(access))};vm={v:i for i,v in enumerate(sorted(views))};tm={v:i for i,v in enumerate(sorted(textures))};im={v:i for i,v in enumerate(sorted(images))}
out['accessors']=[copy.deepcopy(g['accessors'][a]) for a in sorted(access)]
for a in out['accessors']:a['bufferView']=vm[a['bufferView']]
for prim in out['meshes'][0]['primitives']:
 prim['attributes']={k:am[v] for k,v in prim['attributes'].items()};prim['indices']=am[prim['indices']]
def remap(o):
 if isinstance(o,dict):
  for k,v in o.items():
   if k.endswith('Texture') and isinstance(v,dict):v['index']=tm[v['index']]
   else:remap(v)
 elif isinstance(o,list):
  for v in o:remap(v)
remap(mat)
out['textures']=[copy.deepcopy(g['textures'][t]) for t in sorted(textures)]
for t in out['textures']:t['source']=im[t['source']]
out['images']=[copy.deepcopy(g['images'][i]) for i in sorted(images)]
for i in out['images']:i['bufferView']=vm[i['bufferView']]
data=bytearray();out['bufferViews']=[]
for v in sorted(views):
 view=copy.deepcopy(g['bufferViews'][v]);start=view.get('byteOffset',0);chunk=binary[start:start+view['byteLength']];view['byteOffset']=len(data);view['buffer']=0;out['bufferViews'].append(view);data.extend(chunk);data.extend(b'\0'*((-len(data))%4))
out['buffers']=[{'byteLength':len(data)}];out.pop('animations',None);out.pop('cameras',None);out['asset']['extras']['modification']='Classic mesh isolated from the ten-flavour collection; original geometry and textures preserved.'
j=json.dumps(out,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
r=struct.pack('<III',0x46546c67,2,28+len(j)+len(data))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(data),0x004e4942)+data
pathlib.Path('public/models/lays/classic.glb').write_bytes(r);print('Classic GLB bytes',len(r))
