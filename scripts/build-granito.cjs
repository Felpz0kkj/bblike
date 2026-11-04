// Importação determinística dos pixels fornecidos pelo autor, sem redesenhar,
// reduzir resolução, trocar paleta ou gerar variantes. Só o fundo quase preto
// conectado às bordas fica transparente. Os pretos internos (olhos, sulcos,
// sombras) e todos os demais pixels conservam o RGB exato do PNG original.
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/granito/frames.json'),'utf8'));

function readPng(buffer){
  if(buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('PNG inválido');
  let width,height,type,depth,interlace;const chunks=[];
  for(let at=8;at<buffer.length;){const length=buffer.readUInt32BE(at),name=buffer.toString('ascii',at+4,at+8),data=buffer.subarray(at+8,at+8+length);at+=length+12;
    if(name==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9];interlace=data[12];}
    if(name==='IDAT')chunks.push(data);if(name==='IEND')break;
  }
  if(depth!==8||![2,6].includes(type)||interlace!==0)throw new Error('Esperado PNG RGB/RGBA de 8 bits sem entrelaçamento');
  const bpp=type===2?3:4,stride=width*bpp,raw=zlib.inflateSync(Buffer.concat(chunks)),rows=Buffer.alloc(height*stride);
  const paeth=(a,b,c)=>{const p=a+b-c,A=Math.abs(p-a),B=Math.abs(p-b),C=Math.abs(p-c);return A<=B&&A<=C?a:B<=C?b:c;};
  let src=0;
  for(let y=0;y<height;y++){const filter=raw[src++];if(filter>4)throw new Error('Filtro PNG inválido');
    for(let x=0;x<stride;x++){const left=x>=bpp?rows[y*stride+x-bpp]:0,up=y?rows[(y-1)*stride+x]:0,corner=y&&x>=bpp?rows[(y-1)*stride+x-bpp]:0;
      rows[y*stride+x]=(raw[src++]+(filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,corner)))&255;
    }
  }
  if(src!==raw.length)throw new Error('Tamanho PNG inesperado');
  const rgba=Buffer.alloc(width*height*4);
  for(let i=0,j=0;i<rows.length;i+=bpp,j+=4){rgba[j]=rows[i];rgba[j+1]=rows[i+1];rgba[j+2]=rows[i+2];rgba[j+3]=bpp===4?rows[i+3]:255;}
  return {width,height,data:rgba};
}
function readSource(){
  const bytes=fs.readFileSync(path.join(root,'assets/granito',manifest.source));
  return {...readPng(bytes),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
function crop(source,rect){
  const [x,y,w,h,ax,fy,bw]=rect,out=Buffer.alloc(w*h*4),outside=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
  if(x<0||y<0||x+w>source.width||y+h>source.height)throw new Error('Quadro fora da imagem');
  const visit=(X,Y)=>{const index=Y*w+X;if(outside[index])return;const at=((y+Y)*source.width+x+X)*4;
    if(Math.max(source.data[at],source.data[at+1],source.data[at+2])<=manifest.backgroundMax){outside[index]=1;queue[tail++]=index;}
  };
  for(let X=0;X<w;X++){visit(X,0);visit(X,h-1);}for(let Y=1;Y<h-1;Y++){visit(0,Y);visit(w-1,Y);}
  while(head<tail){const index=queue[head++],X=index%w,Y=Math.floor(index/w);if(X>0)visit(X-1,Y);if(X+1<w)visit(X+1,Y);if(Y>0)visit(X,Y-1);if(Y+1<h)visit(X,Y+1);}
  for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){const s=((y+Y)*source.width+x+X)*4,d=(Y*w+X)*4;
    if(!outside[Y*w+X])source.data.copy(out,d,s,s+4);
  }
  return {w,h,ax,fy,bw,data:out};
}
function pack(frame){
  const bytes=[],d=frame.data;let at=0;
  while(at<d.length){const solid=d[at+3]>0;let n=1;while(n<255&&at+n*4<d.length&&(d[at+n*4+3]>0)===solid)n++;
    bytes.push(solid?1:0,n);if(solid)for(let k=0;k<n;k++)bytes.push(d[at+k*4],d[at+k*4+1],d[at+k*4+2]);at+=n*4;
  }
  return {w:frame.w,h:frame.h,ax:frame.ax,fy:frame.fy,bw:frame.bw,pixels:Buffer.from(bytes).toString('base64')};
}
function unpack(frame){
  const bytes=Buffer.from(frame.pixels,'base64'),rgba=Buffer.alloc(frame.w*frame.h*4);let i=0,at=0;
  while(i<bytes.length){const op=bytes[i++],n=bytes[i++];if(op===0)at+=n*4;else for(let k=0;k<n;k++){rgba[at++]=bytes[i++];rgba[at++]=bytes[i++];rgba[at++]=bytes[i++];rgba[at++]=255;}}
  if(at!==rgba.length)throw new Error('Quadro incompleto');return rgba;
}
function build(){
  const source=readSource(),frames={};for(const [id,rect]of Object.entries(manifest.frames))frames[id]=pack(crop(source,rect));
  return {sourceSha256:source.sha256,backgroundMax:manifest.backgroundMax,frames};
}
if(require.main===module){
  const data=build(),filename=path.join(root,'index.html'),html=fs.readFileSync(filename,'utf8'),newline=html.includes('\r\n')?'\r\n':'\n',block='/* GRANITO_ASSET_BEGIN */'+newline+'const GRANITO_ART='+JSON.stringify(data)+';'+newline+'/* GRANITO_ASSET_END */';
  const pattern=/\/\* GRANITO_ASSET_BEGIN \*\/[\s\S]*?\/\* GRANITO_ASSET_END \*\//;
  if(!pattern.test(html))throw new Error('Marcadores de importação ausentes');
  if(process.argv.includes('--check')){if(html.match(pattern)[0].replace(/\r\n/g,'\n')!==block.replace(/\r\n/g,'\n'))throw new Error('Os sprites embutidos diferem do original');}
  else fs.writeFileSync(filename,html.replace(pattern,()=>block));
  console.log(JSON.stringify({frames:Object.keys(data.frames).length,sourceSha256:data.sourceSha256,embeddedBytes:block.length,checked:process.argv.includes('--check')}));
}
module.exports={manifest,readPng,readSource,crop,pack,unpack,build};
