// Importa os quadros da Serpente enviada pelo autor, sem redesenho ou troca de
// cores. O flood fill retira somente o fundo verde escuro conectado às bordas.
// Escamas, contornos, musgo, olhos e sombras internas conservam os RGB originais.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {readPng,crop,pack}=require('./build-granito.cjs');
const root=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/serpente/frames.json'),'utf8'));
const background=(r,g,b)=>r<35&&g<57&&b<40&&g>r*1.2&&g>b*1.2;
function readSource(){
  const bytes=fs.readFileSync(path.join(root,'assets/serpente',manifest.source));
  return {...readPng(bytes),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
function build(){
  const source=readSource(),frames={};
  for(const [id,rect]of Object.entries(manifest.frames)){
    frames[id]={...pack(crop(source,rect,{background,holes:manifest.holes[id],exclude:manifest.exclude[id]})),unitScale:id==='principal'?manifest.unitScale/2:manifest.unitScale,facing:-1};
    if(id==='bite')frames[id].mouth=manifest.mouth;
  }
  return {sourceSha256:source.sha256,frames};
}
if(require.main===module){
  const data=build(),filename=path.join(root,'index.html'),html=fs.readFileSync(filename,'utf8'),newline=html.includes('\r\n')?'\r\n':'\n';
  const block='/* SERPENTE_ASSET_BEGIN */'+newline+'const SERPENTE_ART='+JSON.stringify(data)+';'+newline+'/* SERPENTE_ASSET_END */';
  const pattern=/\/\* SERPENTE_ASSET_BEGIN \*\/[\s\S]*?\/\* SERPENTE_ASSET_END \*\//;
  if(!pattern.test(html))throw new Error('Marcadores de importação ausentes');
  if(process.argv.includes('--check')){if(html.match(pattern)[0].replace(/\r\n/g,'\n')!==block.replace(/\r\n/g,'\n'))throw new Error('Os sprites embutidos diferem da referência');}
  else fs.writeFileSync(filename,html.replace(pattern,()=>block));
  console.log(JSON.stringify({frames:Object.keys(data.frames).length,sourceSha256:data.sourceSha256,embeddedBytes:block.length,checked:process.argv.includes('--check')}));
}
module.exports={manifest,background,readSource,build};
