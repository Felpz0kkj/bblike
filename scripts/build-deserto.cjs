// Recortes sem redesenho: cada RGB retido vem do PNG fornecido pelo autor.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {readPng,crop,pack}=require('./build-granito.cjs');
const root=path.join(__dirname,'..'),folder=path.join(root,'assets/deserto');
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'frames.json'),'utf8'));
// O fundo verde é distinto dos contornos neutros/roxos e das placas azuladas.
const background=(r,g,b)=>r<35&&g<58&&b<40&&g>r*1.25&&g>b*1.25;
function readSource(){const bytes=fs.readFileSync(path.join(folder,manifest.source));return {...readPng(bytes),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};}
function frame(source,id,rect){
  const f=crop(source,rect,{background});
  // Também retira o fundo dos vãos fechados entre pernas, asas e corpo.
  for(let i=0;i<f.data.length;i+=4)if(background(f.data[i],f.data[i+1],f.data[i+2]))f.data.fill(0,i,i+4);
  for(const [x,y,w,h]of manifest.annotations[id]||[]){
    const seen=new Uint8Array(f.w*f.h);
    for(let Y=y;Y<y+h;Y++)for(let X=x;X<x+w;X++){
      const start=Y*f.w+X,at=start*4,[r,g,b,a]=f.data.subarray(at,at+4);
      if(!a||seen[start])continue;
      const q=[start];seen[start]=1;let bounded=true;
      for(let k=0;k<q.length;k++){
        const n=q[k],xx=n%f.w,yy=Math.floor(n/f.w);if(xx<x||xx>=x+w||yy<y||yy>=y+h)bounded=false;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const nx=xx+dx,ny=yy+dy,i=ny*f.w+nx;if(nx<0||nx>=f.w||ny<0||ny>=f.h||seen[i]||!f.data[i*4+3])continue;
          seen[i]=1;q.push(i);
        }
      }
      // Só componentes de apresentação isolados; nunca um pedaço do corpo.
      if(bounded)for(const i of q)f.data.fill(0,i*4,i*4+4);
    }
  }
  for(const [x,y,w,h]of manifest.exclude[id]||[])for(let Y=y;Y<y+h;Y++)f.data.fill(0,(Y*f.w+x)*4,(Y*f.w+x+w)*4);
  const poly=manifest.clip?.[id]||manifest.erasePolygons?.[id],erase=!!manifest.erasePolygons?.[id];
  if(poly)for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){
    let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const [a,b]=poly[i],[c,d]=poly[j];if((b>y+.5)!==(d>y+.5)&&x+.5<(c-a)*(y+.5-b)/(d-b)+a)inside=!inside;
    }
    if(erase?inside:!inside)f.data.fill(0,(y*f.w+x)*4,(y*f.w+x+1)*4);
  }
  const group=Object.values(manifest.groups).find(g=>id.startsWith(g.prefix));
  return {...pack(f),unitScale:id.endsWith('_main')?group.mainScale:group.scale,facing:group.facing,...(manifest.mouths[id]?{mouth:{x:manifest.mouths[id][0],y:manifest.mouths[id][1]}}:{})};
}
function build(){const source=readSource(),frames={};for(const [id,rect]of Object.entries(manifest.frames))frames[id]=frame(source,id,rect);return {sourceSha256:source.sha256,frames};}
if(require.main===module){
  const data=build(),file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8'),nl=html.includes('\r\n')?'\r\n':'\n';
  const block='/* DESERTO_ASSET_BEGIN */'+nl+'const DESERTO_ART='+JSON.stringify(data)+';'+nl+'/* DESERTO_ASSET_END */',pattern=/\/\* DESERTO_ASSET_BEGIN \*\/[\s\S]*?\/\* DESERTO_ASSET_END \*\//;
  if(!pattern.test(html))throw new Error('Marcadores ausentes');
  if(process.argv.includes('--check')){if(html.match(pattern)[0].replace(/\r\n/g,'\n')!==block.replace(/\r\n/g,'\n'))throw new Error('Pixels embutidos divergem da referência');}
  else fs.writeFileSync(file,html.replace(pattern,()=>block));
  console.log(JSON.stringify({frames:Object.keys(data.frames).length,sourceSha256:data.sourceSha256,embeddedBytes:block.length,checked:process.argv.includes('--check')}));
}
module.exports={manifest,background,readSource,frame,build};
