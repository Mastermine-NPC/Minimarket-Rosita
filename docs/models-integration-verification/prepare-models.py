"""Isolate authored objects, retaining original geometry, UVs, materials and maps."""
import pathlib,json,struct,copy
ROOT=pathlib.Path('public/images/video/archivos-glb')
def subset(source, selected, target):
 b=(ROOT/source).read_bytes();n=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+n]);binary=b[28+n:];out=copy.deepcopy(g)
 nodes={i for i,x in enumerate(g['nodes']) if x.get('mesh') in selected};changed=True
 while changed:
  previous=len(nodes)
  nodes.update(i for i,x in enumerate(g['nodes']) if any(c in nodes for c in x.get('children',[])))
  changed=len(nodes)!=previous
 nm={v:i for i,v in enumerate(sorted(nodes))};mm={v:i for i,v in enumerate(sorted(selected))}
 out['nodes']=[copy.deepcopy(g['nodes'][i]) for i in sorted(nodes)]
 for x in out['nodes']:
  if 'mesh' in x:x['mesh']=mm[x['mesh']]
  if 'children' in x:x['children']=[nm[c] for c in x['children'] if c in nodes]
 for scene in out['scenes']:scene['nodes']=[nm[i] for i in scene['nodes'] if i in nodes]
 out['meshes']=[copy.deepcopy(g['meshes'][i]) for i in sorted(selected)]
 mats={p['material'] for m in out['meshes'] for p in m['primitives']};matmap={v:i for i,v in enumerate(sorted(mats))}
 out['materials']=[copy.deepcopy(g['materials'][i]) for i in sorted(mats)]
 views=set();access=set();textures=set();images=set()
 for m in out['meshes']:
  for prim in m['primitives']:
   access.update(prim['attributes'].values())
   if 'indices' in prim:access.add(prim['indices'])
   prim['material']=matmap[prim['material']]
 for a in access:views.add(g['accessors'][a]['bufferView'])
 def visit(o,fn):
  if isinstance(o,dict):
   for k,v in o.items():
    if k.endswith('Texture') and isinstance(v,dict):fn(v)
    else:visit(v,fn)
  elif isinstance(o,list):
   for v in o:visit(v,fn)
 visit(out['materials'],lambda v:textures.add(v['index']))
 for t in textures:images.add(g['textures'][t]['source'])
 for i in images:views.add(g['images'][i]['bufferView'])
 am={v:i for i,v in enumerate(sorted(access))};vm={v:i for i,v in enumerate(sorted(views))};tm={v:i for i,v in enumerate(sorted(textures))};im={v:i for i,v in enumerate(sorted(images))}
 out['accessors']=[copy.deepcopy(g['accessors'][a]) for a in sorted(access)]
 for a in out['accessors']:a['bufferView']=vm[a['bufferView']]
 for m in out['meshes']:
  for prim in m['primitives']:
   prim['attributes']={k:am[v] for k,v in prim['attributes'].items()}
   if 'indices' in prim:prim['indices']=am[prim['indices']]
 visit(out['materials'],lambda v:v.update(index=tm[v['index']]))
 out['textures']=[copy.deepcopy(g['textures'][t]) for t in sorted(textures)]
 for t in out['textures']:t['source']=im[t['source']]
 out['images']=[copy.deepcopy(g['images'][i]) for i in sorted(images)]
 for i in out['images']:i['bufferView']=vm[i['bufferView']]
 data=bytearray();out['bufferViews']=[]
 for v in sorted(views):
  view=copy.deepcopy(g['bufferViews'][v]);start=view.get('byteOffset',0);chunk=binary[start:start+view['byteLength']];view['byteOffset']=len(data);view['buffer']=0;out['bufferViews'].append(view);data.extend(chunk);data.extend(b'\0'*((-len(data))%4))
 out['buffers']=[{'byteLength':len(data)}];out.pop('animations',None);out.pop('cameras',None);out['asset']['extras']['modification']='Selected authored object(s) isolated; original geometry, UVs and material maps preserved.'
 j=json.dumps(out,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
 result=struct.pack('<III',0x46546c67,2,28+len(j)+len(data))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(data),0x004e4942)+data
 p=pathlib.Path(target);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(result)
 return {'file':target,'source':source,'selectedMeshes':sorted(selected),'meshes':len(out['meshes']),'triangles':sum(out['accessors'][p['indices']]['count']//3 for m in out['meshes'] for p in m['primitives']),'materials':len(out['materials']),'textures':len(out['textures']),'bytes':len(result),'attribution':out['asset']['extras']}
flavours=['classic','sweet-bbq','cheddar','chile-limon','flaming-hot','honey-bbq','classic-less-salt','dill-pickle','ranch-wavy','bbq-wavy']
audit=[subset('lays_bags__10_different_flavours__gameready.glb',{i},f'public/models/lays/{slug}.glb') for i,slug in enumerate(flavours)]
audit.append(subset('coca_cola_cans.glb',{2},'public/models/coca-cola/can.glb'))
audit.append(subset('sunsilk_shampoo_bottle.glb',{0,1,2},'public/models/sunsilk/bottle.glb'))
p=ROOT/'nivea_aftershave.glb';b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+n]);audit.append({'file':str(p),'source':p.name,'meshes':3,'triangles':190492,'bytes':len(b),'textures':1,'attribution':g['asset']['extras'],'note':'Original file untouched, including KHR_materials_unlit and scanned texture.'})
pathlib.Path('docs/models-integration-verification/asset-audit.json').write_text(json.dumps(audit,indent=2));print([(x['file'],x['bytes']) for x in audit])
