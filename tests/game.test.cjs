const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const crypto=require('node:crypto');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Executa o jogo real, sem rede ou dependências. O canvas registra a arte raster.
function boot(saved,random,legacy){
  const nodes=new Map(),events={},store=new Map();
  if(saved)store.set('nevoa-selvagem-v3',JSON.stringify(saved));
  if(legacy)store.set('nevoa-selvagem-v2',JSON.stringify(legacy));
  function element(name){
    const attrs={},classes=new Set(),ops=[];
    const context=new Proxy({ops,images:[],fillRect(...a){ops.push([this.fillStyle,...a]);},
      createImageData(w,h){return{width:w,height:h,data:new Uint8ClampedArray(w*h*4)};},
      putImageData(data){this.raster=data;ops.push(['raster',data.width,data.height,crypto.createHash('sha256').update(data.data).digest('hex')]);},
      getImageData(x,y,w,h){if(this.raster?.data){const src=this.raster,out=new Uint8ClampedArray(w*h*4);for(let row=0;row<h;row++)out.set(src.data.subarray(((y+row)*src.width+x)*4,((y+row)*src.width+x+w)*4),row*w*4);return{data:out};}return {data:new Uint8ClampedArray(w*h*4)};},
      drawImage(img,...a){ops.push(['image',img.width,...a]);this.images.push({img,args:a});},
      createRadialGradient(){return {addColorStop(){}};},
      createLinearGradient(){return {addColorStop(){}};},measureText(t){return {width:String(t).length*7};}
    },{get:(t,k)=>k in t?t[k]:()=>{}});
    return {name,style:{},dataset:{},innerHTML:'',textContent:'',clientWidth:240,width:32,height:32,children:[],
      classList:{add:(...cs)=>cs.forEach(c=>classes.add(c)),remove:(...cs)=>cs.forEach(c=>classes.delete(c)),
        toggle(c,on){if(on??!classes.has(c))classes.add(c);else classes.delete(c);},contains:c=>classes.has(c)},
      getContext:()=>context,toDataURL:()=>JSON.stringify(ops),
      getBoundingClientRect:()=>({width:960,height:600,left:0,top:0}),
      setAttribute:(k,v)=>attrs[k]=String(v),getAttribute:k=>attrs[k]??null,removeAttribute:k=>delete attrs[k],
      addEventListener(k,f){events[name+':'+k]=f;},
      querySelector:node,appendChild(c){this.children.push(c);c.parentNode=this;},removeChild(c){this.children.splice(this.children.indexOf(c),1);},
      setPointerCapture(){},releasePointerCapture(){},blur(){}};
  }
  function node(s){if(!nodes.has(s))nodes.set(s,element(s));return nodes.get(s);}
  const root=element('html');
  const win={__NSDEBUG:true,devicePixelRatio:1,matchMedia:()=>({matches:false}),
    addEventListener:(k,f)=>events[k]=f};
  const sandbox={window:win,document:{documentElement:root,hidden:false,querySelector:node,
    createElement:element,addEventListener:(k,f)=>events[k]=f},
    localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},
    atob:s=>Buffer.from(s,'base64').toString('binary'),performance:{now:()=>1000},console,requestAnimationFrame(){},setTimeout(){},setInterval(){},clearInterval(){},
    matchMedia:win.matchMedia};
  if(random){const math=Object.create(Math);math.random=random;sandbox.Math=math;}
  vm.runInNewContext(script,sandbox,{filename:'index.html'});
  return {game:win.__NS,node,events,store};
}
const button=i=>({dataset:{i}});
function begin(game,type='planta',diff='normal'){
  game.ACT.play();game.ACT.difficulty(button(diff));game.ACT.begin(button(type));
}

function spawnDue(g,L=g.run.lv){g.run.worldTime=g.BAL.bossTime;return g.spawnBoss(L);}

test('versão beta acompanha manifesto, jogo, documentação e prévias',()=>{
  const root=path.join(__dirname,'..'),version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
  assert.match(version,/^\d+\.\d+\.\d+-beta$/);const number=version.replace('-beta','');
  const {game:g,node}=boot();assert.equal(g.VERSION,version);g.ACT.menu();
  assert.ok(html.includes('<title>BaubLike · Beta '+number+'</title>'));
  assert.ok(node('#ui').innerHTML.includes('BETA '+number));
  for(const file of ['README.md','docs/balanceamento.md']){
    const title=fs.readFileSync(path.join(root,file),'utf8').split('\n')[0].trim();assert.ok(title.endsWith(number),file);
  }
  const latest=fs.readFileSync(path.join(root,'CHANGELOG.md'),'utf8').split('\n').find(line=>line.startsWith('## '));
  assert.ok(latest.startsWith('## '+version+' —'));
  for(const file of ['combat.html','visual.html','granito.html','serpente.html']){
    const preview=fs.readFileSync(path.join(__dirname,file),'utf8');
    for(const label of preview.match(/Beta \d+\.\d+\.\d+/g)||[])assert.equal(label,'Beta '+number,file);
    assert.ok(preview.includes('Beta '+number),file);
  }
});

test('iniciar exige dificuldade, depois personagem; voltar e cancelar não iniciam',()=>{
  const {game:g,node}=boot();
  g.ACT.play();assert.equal(g.run,null);assert.equal(node('#ui').dataset.scr,'difficulty');
  g.ACT.difficulty(button('feroz'));assert.equal(g.run,null);assert.equal(node('#ui').dataset.scr,'character');
  assert.match(node('#ui').innerHTML,/Dificuldade: <b>Feroz/);
  g.ACT.difficultyback();assert.equal(node('#ui').dataset.scr,'difficulty');
  g.ACT.menu();assert.equal(g.run,null);assert.equal(g.S.diff,'normal');
  begin(g,'planta','calma');assert.equal(g.run.ch,'planta');assert.equal(g.run.diff,'calma');
  assert.equal(g.run.pl.hp,g.CH.planta.hp);assert.equal(g.P.char,'planta');
});

test('Equipe consulta atributos e compra melhorias sem selecionar o personagem',()=>{
  const {game:g,node}=boot();g.ACT.team();
  assert.doesNotMatch(node('#ui').innerHTML,/data-a="(?:char|begin)"|Selecionado|Selecionar/);
  assert.match(node('#ui').innerHTML,/Melhorias permanentes/);
  assert.match(node('#ui').innerHTML,/Aliado inicial/);
  g.P.ess=1000;const char=g.P.char;g.ACT.buychar(button('eletrico'));
  assert.equal(g.P.chars.eletrico,1);assert.equal(g.P.char,char);assert.equal(g.P.ess,880);
  g.ACT.buyup(button('vida'));assert.equal(g.P.up.vida,1);assert.equal(g.P.char,char);
  g.P.coll.planta=1;g.ACT.load(button('planta'));assert.equal(g.P.start[0],'planta');
  begin(g,'eletrico','feroz');assert.equal(g.run.ch,'eletrico');assert.equal(g.run.allies[0].type,'planta');
  assert.equal(g.run.st.maxhp,g.CH.eletrico.hp+10);
});

test('personagens bloqueados não iniciam e comprar duas vezes não gasta essência',()=>{
  const {game:g,node}=boot();g.ACT.play();g.ACT.difficulty(button('normal'));
  g.ACT.begin(button('sombra'));assert.equal(g.run,null);assert.equal(node('#ui').dataset.scr,'character');
  assert.equal(g.startRun('invalido','normal'),false);
  assert.equal(g.startRun('fogo','invalida'),false);
  g.P.ess=200;g.ACT.buychar(button('sombra'));g.ACT.buychar(button('sombra'));
  assert.equal(g.P.ess,0);assert.equal(g.P.char,'fogo');
});

test('a dificuldade fica fixada na jornada e altera os inimigos',()=>{
  const {game:g}=boot();begin(g,'fogo','calma');
  const a=g.mkEnemy('catador',1,100,100,{});g.S.diff='feroz';
  const b=g.mkEnemy('catador',1,100,100,{});assert.equal(a.maxhp,b.maxhp);assert.equal(a.dmg,b.dmg);
  begin(g,'fogo','feroz');const c=g.mkEnemy('catador',1,100,100,{});
  assert.ok(Math.abs(c.maxhp/a.maxhp-1.3/.8)<1e-10);
  assert.ok(Math.abs(c.dmg/a.dmg-1.3/.75)<1e-10);
});

test('vida fracionária, cura, zero e renascimento preservam o preenchimento proporcional',()=>{
  const {game:g,node}=boot();begin(g);
  for(const ratio of [1,.751,.749,.5,.301,.299,.12,.037,0]){
    g.run.pl.hp=g.run.st.maxhp*ratio;g.updHud();
    assert.ok(Math.abs(parseFloat(node('#hp-i').style.width)-ratio*100)<1e-10);
    assert.equal(Number(node('#player-health').getAttribute('aria-valuemax')),g.run.st.maxhp);
  }
  g.run.pl.hp=10;g.picks.push({k:'heal',x:0,y:0,t:0});g.updPick(.016);assert.ok(g.run.pl.hp>10);g.updHud();
  assert.ok(parseFloat(node('#hp-i').style.width)>8);
  g.run.pl.hp=-5;g.updHud();assert.equal(node('#hp-i').style.width,'0%');
  assert.equal(node('#hp-t').textContent,'0 / 85');
  begin(g);g.updHud();assert.equal(node('#hp-i').style.width,'100%');
});

test('Sombrinha mantém arte e evoluções; Granito usa os mesmos pixels originais em todas as evoluções',()=>{
  const {game:g}=boot();const frames=[];
  for(let stage=1;stage<=3;stage++)for(let frame=0;frame<4;frame++){
    const c=g.monSprite('sombra',stage,frame);assert.equal(c.width,32);assert.equal(c.fy,30);assert.ok(c.getContext('2d').ops.length>100);frames.push(c.toDataURL());assert.equal(c,g.monSprite('sombra',stage,frame));
  }
  assert.notEqual(frames[0],frames[1]);assert.notEqual(frames[0],frames[4]);assert.notEqual(frames[4],frames[8]);
  for(const pose of [0,10,20,30,50,63,73,84])assert.equal(g.monSprite('pedra',1,pose),g.monSprite('pedra',3,pose));
});

test('jornada funciona com todos os personagens e a pausa limpa movimento e ataque',()=>{
  const {game:g,node,events}=boot();
  for(const t of Object.keys(g.CH)){
    g.P.chars[t]=1;begin(g,t);g.basicAttack(0);g.useSpecial();g.update(.016);g.render();
    assert.ok(Number.isFinite(g.run.pl.hp));
    g.keys.r=true;g.mouse.down=true;events.blur();
    assert.equal(g.keys.r,false);assert.equal(g.mouse.down,false);assert.equal(node('#ui').dataset.scr,'pause');
    g.ACT.resume();assert.equal(node('#ui').dataset.scr,'');
  }
});

test('progresso existente é carregado e escolhas novas ficam salvas',()=>{
  const saved={P:{ess:345,char:'agua',chars:{sombra:1},seen:1,coll:{planta:1},start:['planta'],up:{vida:2}},S:{diff:'feroz',theme:'dark'}};
  const {game:g,store}=boot(saved);g.ACT.team();assert.equal(g.P.char,'agua');assert.equal(g.P.ess,345);
  begin(g,'sombra','calma');const next=JSON.parse(store.get('nevoa-selvagem-v3'));
  assert.equal(next.P.ess,345);assert.equal(next.P.char,'sombra');assert.equal(next.P.up.vida,2);
  assert.equal(next.S.diff,'calma');assert.equal(next.S.theme,'dark');assert.equal(g.run.allies.length,1);
});

test('um ataque em área atinge todos os inimigos mesmo eliminando alvos',()=>{
  const {game:g}=boot();begin(g);
  for(let i=0;i<4;i++){const e=g.mkEnemy('catador',1,20+i*10,0,{spawn:0});e.spawn=0;e.hp=1;g.enemies.push(e);}
  g.useSpecial();assert.equal(g.enemies.length,0);assert.equal(g.run.kills,4);
});

test('morte por golpe interrompe coletas e cura no mesmo quadro',()=>{
  const {game:g}=boot();begin(g);g.run.pl.hp=1;
  const e=g.mkEnemy('catador',1,0,0,{});e.spawn=0;e.dmg=100;e.attack={k:'club',t:.44,dur:.45,dx:0,dy:0};g.enemies.push(e);
  g.dropGem(0,0,100);g.picks.push({k:'heal',x:0,y:0,t:0});g.update(.016);
  assert.equal(g.run.over,true);assert.equal(g.run.pl.hp,0);assert.equal(g.run.xp,0);assert.equal(g.picks.length,1);
});

test('arte de XP e vida é cacheada e preserva o valor das coletas',()=>{
  const {game:g}=boot();begin(g);assert.equal(g.VERSION,fs.readFileSync(path.join(__dirname,'..','VERSION'),'utf8').trim());
  assert.equal(g.lootSprite('xp'),g.lootSprite('xp'));assert.notEqual(g.lootSprite('xp').toDataURL(),g.lootSprite('heal').toDataURL());
  for(let i=0;i<500;i++)g.dropGem(0,0,1);assert.equal(g.gems.reduce((n,x)=>n+x.v,0),500);assert.ok(g.gems.length<=380);
  g.updPick(.016);assert.equal(g.run.xp,500);assert.equal(g.gems.length,0);
  g.run.pl.hp=50;g.picks.push({k:'heal',x:0,y:0,t:0});g.updPick(.016);assert.equal(g.run.pl.hp,62.75);
});

test('Salamandra alterna dois golpes sem dash; Fúria só avança no terceiro',()=>{
  const {game:g}=boot();begin(g,'fogo');const swings=[];
  for(let i=0;i<8;i++){g.basicAttack(0,100,0);swings.push(g.run.sw);assert.equal(g.run.pl.dash,null);}
  assert.equal(swings.join(','),'-1,1,-1,1,-1,1,-1,1');assert.equal(g.run.pl.vx,0);
  g.useSpecial();assert.equal(g.run.ber,6);assert.ok(g.run.sp>=24);assert.equal(g.run.pl.inv,0);
  for(let i=0;i<2;i++){g.basicAttack(0,100,0);assert.equal(g.run.pl.dash,null);}
  g.basicAttack(0,100,0);assert.equal(g.run.pl.dash.fire,true);assert.equal(g.run.combo,0);
  g.run.ber=.01;g.update(.02);assert.equal(g.run.ber,0);assert.equal(g.run.pl.dash,null);
});

test('Fúria aumenta DPS com menos dano por golpe, sem explosão ao ativar',()=>{
  const {game:g}=boot();begin(g,'fogo');g.run.st.crit=0;
  const e=g.mkEnemy('catador',1,65,0,{});e.spawn=0;e.hp=10000;g.enemies.push(e);
  g.basicAttack(0,100,0);const normalHit=10000-e.hp,normalCd=g.run.cd;
  const before=e.hp;g.useSpecial();assert.equal(e.hp,before);
  g.basicAttack(0,100,0);const furyHit=before-e.hp,furyCd=g.run.cd;
  assert.ok(furyHit<normalHit);assert.ok(furyHit/furyCd>normalHit/normalCd);
});

test('Sakura dispara flechas perfurantes e drena vida ao acertar',()=>{
  const {game:g}=boot();begin(g);g.run.pl.hp=20;g.run.st.crit=0;g.basicAttack(0,100,0);
  assert.equal(g.pbul[0].pierce,2);assert.equal(g.pbul[0].vx,760);
  const e=g.mkEnemy('catador',1,40,0,{});e.spawn=0;e.hp=100;g.enemies.push(e);
  g.update(.04);assert.ok(Math.abs(g.run.pl.hp-20.08)<1e-9);
  g.useSpecial();assert.ok(g.run.pl.hp>22&&g.run.pl.hp<23);assert.equal(g.CH.planta.basic,'Flecha de Sakura');
});

test('Capricorn encadeia em três alvos próximos com dano 100%, 50%, 25%',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.crit=0;g.run.st.dmg=20;g.run.st.multi=5;
  const es=[[100,0],[160,65],[220,80],[280,100],[500,0]].map(([x,y])=>{const e=g.mkEnemy('catador',1,x,y,{});e.spawn=0;e.hp=100;g.enemies.push(e);return e;});
  // Disparos extras aumentam a potência, sem multiplicar os alvos.
  g.run.st.multi=1;g.basicAttack(0,100,0);
  assert.deepEqual(es.map(e=>100-e.hp),[20,10,5,0,0]);
  es.forEach(e=>e.hp=100);g.run.st.multi=5;g.basicAttack(0,100,0);
  assert.equal(es.filter(e=>e.hp<100).length,3);assert.equal(es[0].hp,72);
});

test('cadeia continua após matar o primeiro alvo e respeita distância de salto',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.crit=0;g.run.st.dmg=20;
  const a=g.mkEnemy('catador',1,100,0,{}),b=g.mkEnemy('catador',1,160,70,{}),c=g.mkEnemy('catador',1,340,70,{});
  for(const e of [a,b,c]){e.spawn=0;e.hp=100;g.enemies.push(e);}a.hp=1;
  g.basicAttack(0,100,0);assert.equal(a.hp,0);assert.equal(b.hp,90);assert.equal(c.hp,100);
});

test('Tempestade carrega antes de paralisar por um segundo, incluindo chefes',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.crit=0;
  const a=g.mkEnemy('catador',1,150,0,{}),boss=g.mkEnemy('catador',1,200,0,{}),far=g.mkEnemy('catador',1,500,0,{});
  for(const e of [a,boss,far]){e.spawn=0;e.hp=100;g.enemies.push(e);}boss.boss={name:'Teste'};
  g.useSpecial();assert.equal(a.stun,0);assert.ok(g.run.chg);g.chargeTick(1.1);assert.equal(g.run.chg,null);assert.equal(a.stun,1);assert.equal(boss.stun,1);assert.equal(far.hp,100);
  assert.equal(g.run.sp,18);assert.equal(g.run.pl.dash,null);assert.equal(g.run.pl.inv,0);
});

test('Capricorn substitui Zero em telas e salva o desbloqueio anterior',()=>{
  const {game:g,node}=boot({P:{char:'eletrico',chars:{eletrico:1},coll:{eletrico:1},start:['eletrico'],seen:1}});
  g.ACT.team();assert.match(node('#ui').innerHTML,/Capricorn/);assert.doesNotMatch(node('#ui').innerHTML,/Zero|Fagulhim|Esquilo elétrico|Corrida Elétrica/);
  begin(g,'eletrico');assert.equal(g.run.allies.length,0);assert.equal(g.P.coll.eletrico,1);assert.equal(g.P.chars.eletrico,1);assert.equal(g.run.ch,'eletrico');
  for(let stage=1;stage<=3;stage++)for(let frame=0;frame<=4;frame++){
    const c=g.monSprite('eletrico',stage,frame);assert.equal(c.width,56);assert.equal(c.fy,51);assert.ok(c.getContext('2d').ops.length>100);
  }
});

test('nomes e sprites novos aparecem em todas as telas mantendo o progresso',()=>{
  const {game:g,node}=boot({P:{char:'planta',seen:1,ess:88},S:{diff:'normal'}});
  assert.equal(g.P.ess,88);g.ACT.menu();assert.match(node('#ui').innerHTML,/BaubLike/);
  g.ACT.how();assert.match(node('#ui').innerHTML,/Como jogar BaubLike/);assert.match(node('#ui').innerHTML,/Salamandra/);assert.match(node('#ui').innerHTML,/Sakura/);
  assert.doesNotMatch(node('#ui').innerHTML,/Brasito|Folhito|Horda da Névoa/);
  for(const t of ['fogo','planta'])for(let st=1;st<=3;st++)for(const f of [0,11,20,30,40]){
    const c=g.monSprite(t,st,f);assert.equal(c.width,56);assert.equal(c.fy,51);assert.equal(g.monSprite(t,st,f),c);
  }
});

function target(g,x,y=0,hp=1000){
  const e=g.mkEnemy('catador',1,x,y,{});e.spawn=0;e.hp=e.maxhp=hp;e.spd=0;g.enemies.push(e);return e;
}

test('alcance de Capricorn não cresce com área, evolução ou disparos extras',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.crit=0;g.run.st.area=3;g.run.st.multi=4;g.run.bl=5;
  const far=target(g,321);g.basicAttack(0,321,0);assert.equal(far.hp,1000);
  const near=target(g,320);far.y=140;g.basicAttack(0,320,0);assert.ok(near.hp<1000);assert.equal(far.hp,1000);
  g.enemies.length=0;const es=[target(g,100),target(g,220),target(g,340),target(g,341,50)];
  g.run.st.dmg=20;g.run.st.multi=1;g.basicAttack(0,100,0);
  assert.deepEqual(es.map(e=>1000-e.hp),[20,10,5,0]);
});

test('Tempestade tem três pulsos, teto por grupo e dano independente do quadro',()=>{
  function storm(count,steps){
    const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.dmg=100;g.run.st.crit=1;
    const es=Array.from({length:count},(_,i)=>target(g,100,i));g.useSpecial();
    for(const dt of steps)g.chargeTick(dt);
    assert.equal(g.run.chg,null);return es.map(e=>1000-e.hp);
  }
  const fine=storm(12,Array(110).fill(.01));
  assert.deepEqual(fine,storm(12,[.29,.31,.5]));
  assert.equal(fine[0],255);assert.equal(storm(40,[1.1])[0],fine[0]);
  assert.ok(storm(1,[1.1])[0]<fine[0]);
});

test('carregar Tempestade bloqueia ataque e reativação, reduz movimento e não limpa projéteis',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.S.aim='manual';g.run.st.crit=0;
  const e=target(g,100);g.ebul.push({x:200,y:100,vx:0,vy:0,r:5,life:5,dmg:1});
  g.useSpecial();const charge=g.run.chg;g.run.sp=0;g.useSpecial();assert.equal(g.run.chg,charge);
  g.basicAttack(0,100,0);assert.equal(e.hp,1000);g.keys.r=true;g.update(.1);
  assert.ok(Math.abs(g.run.pl.vx-g.run.st.spd*.6)<1e-9);assert.equal(g.run.pl.inv,0);
  g.chargeTick(1);assert.equal(g.ebul.length,1);assert.equal(g.run.pl.dash,null);assert.equal(g.run.pl.inv,0);
});

test('Tempestade respeita raio máximo, inimigos surgindo e morte do jogador',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.area=5;g.run.st.crit=0;
  assert.equal(g.stormRadius(),325);const outside=target(g,400),spawning=target(g,100);spawning.spawn=2;
  g.useSpecial();g.chargeTick(1.1);assert.equal(outside.hp,1000);assert.equal(spawning.hp,1000);
  g.run.sp=0;spawning.spawn=0;g.useSpecial();g.run.over=true;g.chargeTick(1.1);
  assert.equal(spawning.hp,1000);assert.equal(g.run.chg,null);
});

test('Sakura para em 360 mesmo com área máxima e acerta o último trecho',()=>{
  for(const area of [1,1.5,3]){
    const {game:g}=boot();begin(g);g.run.st.area=area;g.run.st.crit=0;
    const edge=target(g,360,-8),far=target(g,410,-8);g.basicAttack(0,900,0);const arrow=g.pbul[0];
    g.updProj(.6);assert.equal(arrow.x,360);assert.equal(g.pbul.length,0);
    assert.ok(edge.hp<1000);assert.equal(far.hp,1000);
  }
});

test('flechas rápidas acertam em ordem de distância sem pular alvos eliminados',()=>{
  const {game:g}=boot();begin(g);g.run.st.crit=0;g.run.st.dmg=20;
  const third=target(g,220,-8),second=target(g,140,-8),first=target(g,60,-8,1),fourth=target(g,300,-8);
  g.basicAttack(0,400,0);g.updProj(.5);
  assert.equal(first.hp,0);assert.equal(1000-second.hp,18);assert.equal(1000-third.hp,15);assert.equal(fourth.hp,1000);
  assert.equal(g.pbul.length,0);
});

test('drenagem cura apenas o dano efetivo, sem cura depois da morte',()=>{
  const {game:g}=boot();begin(g);g.run.pl.hp=20;g.run.st.crit=0;
  g.hitEnemy(target(g,100,0,1),1000,{canCrit:false});assert.ok(Math.abs(g.run.pl.hp-20.01)<1e-9);
  const e=target(g,100);g.run.over=true;g.run.pl.hp=0;g.hitEnemy(e,1000);
  assert.equal(g.run.pl.hp,0);assert.equal(e.hp,1000);
});

test('arremessos extras respeitam a distância máxima do ponto de impacto',()=>{
  const {game:g}=boot();
  for(const [type,range] of [['agua',330],['pedra',320]]){
    g.P.chars[type]=1;begin(g,type);g.run.st.multi=4;
    for(const angle of [0,1,2,3]){if(type==='pedra'){g.run.sp2=0;g.run.chg=null;g.S.aim='manual';g.cam.x=0;g.cam.y=0;g.mouse.x=Math.cos(angle)*3000*g.zoom;g.mouse.y=Math.sin(angle)*3000*g.zoom;g.useStoneSpecial();}else g.basicAttack(angle,3000,3000);}
    assert.equal(g.lobs.length,16);assert.ok(g.lobs.every(l=>Math.hypot(l.tx-l.x0,l.ty-l.y0)<=range+1e-9));
  }
});

test('orbes sombrios têm orçamento de percurso mesmo quando perseguem',()=>{
  const {game:g}=boot();g.P.chars.sombra=1;begin(g,'sombra');g.run.st.crit=0;
  const far=target(g,600,0);g.basicAttack(0,600,0);const orbs=[...g.pbul];
  for(let i=0;i<50;i++)g.updProj(.05);
  assert.equal(g.pbul.length,0);assert.equal(far.hp,1000);
  assert.ok(orbs.every(b=>Math.hypot(b.x,b.y)<=480+1e-8));
});

test('Salto Sombrio não causa dano duplo no mesmo alvo',()=>{
  const {game:g}=boot();g.P.chars.sombra=1;begin(g,'sombra');g.S.aim='manual';g.run.st.crit=0;
  g.mouse.x=0;g.mouse.y=0;g.cam.x=0;g.cam.y=0;
  const e=target(g,40);g.useSpecial();assert.equal(1000-e.hp,13);assert.equal(g.run.sp,8);
});

test('mira automática não gasta o ataque em alvos fora do alcance',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.S.aim='auto';g.run.cd=0;
  const e=target(g,360);g.update(.01);assert.equal(e.hp,1000);assert.equal(g.run.pl.swing,0);
  e.x=200;g.update(.01);assert.ok(e.hp<1000);assert.ok(g.run.pl.swing>0);
});

test('aliados Capricorn e Sakura usam os mesmos limites do jogador',()=>{
  const {game:g}=boot();begin(g,'fogo');g.run.st.crit=0;g.run.st.area=3;
  for(const type of ['eletrico','planta']){
    g.run.allies.length=0;g.enemies.length=0;g.pbul.length=0;
    const a=g.mkAlly(type,5);a.x=-60;a.y=-30;a.cd=0;g.run.allies.push(a);
    const far=target(g,a.x+420,a.y);g.updAllies(.01);assert.equal(far.hp,1000);assert.equal(g.pbul.length,0);
    const es=[100,180,260,340].map(x=>target(g,a.x+x,a.y));a.cd=0;g.updAllies(.01);
    if(type==='eletrico'){assert.equal(es.filter(e=>e.hp<1000).length,3);const damage=1000-es[0].hp;assert.ok(Math.abs((1000-es[1].hp)-damage/2)<=1);}
    else{assert.ok(g.pbul.length>0);assert.ok(g.pbul.every(b=>b.range===346));}
  }
});


test('todos os personagens e evoluções suportam combate, especiais e renderização',()=>{
  const {game:g}=boot();
  for(const type of Object.keys(g.CH))for(const stage of [1,2,3]){
    g.P.chars[type]=1;begin(g,type);g.run.stage=stage;g.recompute();g.run.st.crit=0;g.run.pl.inv=100;
    for(let i=0;i<8;i++)target(g,100+i*30,(i%3-1)*30);
    g.basicAttack(0,220,0);g.useSpecial();
    for(let i=0;i<40;i++){g.update(.05);if(i%5===0)g.render();}
    for(const list of [g.enemies,g.pbul,g.lobs])for(const item of list){
      for(const prop of ['x','y','tx','ty','dmg','hp'])if(prop in item)assert.ok(Number.isFinite(item[prop]),type+' '+prop);
    }
    assert.ok(g.run.pl.hp>0);assert.equal(g.run.over,false);
  }
});

test('paralisia curta não fica mais longa em chefes e morte cancela a carga',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');
  const e=target(g,100);e.boss={name:'Teste'};g.hitEnemy(e,1,{stun:.25,canCrit:false});assert.equal(e.stun,.25);
  g.useSpecial();g.run.pl.hp=1;g.hurtPlayer(100);assert.equal(g.run.over,true);assert.equal(g.run.chg,null);
});

test('esquiva com Shift é direcional, sem dano e com recarga independente',()=>{
  const {game:g,events}=boot();begin(g,'fogo');g.run.st.crit=0;
  const e=target(g,100);g.keys.r=true;events.keydown({key:'Shift',repeat:false,preventDefault(){}});
  assert.equal(g.run.sp,0);assert.equal(g.run.pl.dash.nodmg,true);assert.equal(g.run.dcd,2.4);
  const dash=g.run.pl.dash;g.doDash();assert.equal(g.run.pl.dash,dash);
  g.keys.r=false;g.update(.1);g.update(.1);assert.equal(g.run.pl.dash,null);
  assert.ok(Math.abs(g.run.pl.x-198)<1e-8);assert.equal(e.hp,1000);
  g.run.dcd=0;g.keys.l=true;g.keys.u=true;g.doDash();
  assert.ok(g.run.pl.dash.dx<0&&g.run.pl.dash.dy<0);
  assert.ok(Math.abs(Math.hypot(g.run.pl.dash.dx,g.run.pl.dash.dy)-1)<1e-9);
});

test('esquiva não funciona em pausa, durante carga ou por repetição do Shift',()=>{
  const {game:g,events}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.useSpecial();g.doDash();
  assert.equal(g.run.pl.dash,null);g.run.chg=null;events.blur();g.doDash();assert.equal(g.run.pl.dash,null);
  g.ACT.resume();events.keydown({key:'Shift',repeat:true,preventDefault(){}});assert.equal(g.run.pl.dash,null);
  g.doDash();assert.equal(g.run.pl.dash.nodmg,true);
});

test('derrota congela tempo e recompensa, pode pular após 1,8 s e reinicia limpa',()=>{
  const {game:g,node,events}=boot();begin(g,'fogo');g.run.time=125.5;g.run.pl.hp=1;g.hurtPlayer(1000);
  assert.equal(g.run.over,true);assert.match(node('#wasted').innerHTML,/ELIMINADO|2:05/);
  assert.equal(node('#stage').classList.contains('dead'),true);
  g.update(1);assert.equal(g.run.time,125.5);assert.equal(g.run.ended,false);assert.equal(g.P.rank.length,0);
  events.keydown({key:' ',preventDefault(){}});g.update(.9);assert.equal(g.run.ended,true);
  assert.equal(g.P.rank.length,1);assert.equal(g.P.rank[0].time,125);
  const ess=g.P.ess;g.update(5);assert.equal(g.P.ess,ess);assert.equal(g.P.rank.length,1);
  let blocked=false;events.keydown({key:'a',preventDefault(){blocked=true;}});assert.equal(blocked,false);
  begin(g,'fogo');assert.equal(g.run.over,false);assert.equal(node('#wasted').className,'');
  assert.equal(node('#stage').classList.contains('dead'),false);
});

test('todos os personagens renderizam a derrota até o fim sem ganhar vida',()=>{
  const {game:g}=boot();
  for(const type of Object.keys(g.CH)){
    g.P.chars[type]=1;begin(g,type);g.run.pl.hp=1;g.hurtPlayer(10000);
    for(const dt of [.2,.6,.6,1,2.3]){g.update(dt);g.render();assert.equal(g.run.pl.hp,0);}
    assert.equal(g.run.ended,true);
  }
});

test('podridão respeita armadura, esquiva e renascimento; morte impede coleta',()=>{
  const {game:g}=boot();g.P.chars.pedra=1;begin(g,'pedra');g.run.pl.hp=100;g.applyRot(5);
  for(let i=0;i<50;i++)g.tickRot(.1);assert.equal(g.run.pl.hp,80); // 5 ticks de 4 com armadura.
  g.run.pl.inv=1;assert.equal(g.applyRot(5),false);
  g.run.pl.inv=0;g.P.up.revive=1;g.run.pl.hp=1;g.applyRot();g.tickRot(1);
  assert.equal(g.run.revived,true);assert.equal(g.run.pl.rot,0);assert.equal(g.run.over,false);
  g.run.pl.inv=0;g.run.pl.hp=1;g.applyRot();g.dropGem(0,0,10);g.picks.push({k:'heal',x:0,y:0,t:0});
  g.update(1);assert.equal(g.run.over,true);assert.equal(g.run.xp,0);assert.equal(g.picks.length,1);
});

test('Colosso inicia o ciclo e a vitória só muda o mundo por contato com o portal',()=>{
  const {game:g}=boot();begin(g,'fogo');target(g,100);g.run.lv=10;spawnDue(g,);
  assert.equal(g.enemies.length,1);const boss=g.enemies[0];assert.equal(boss.boss.id,'colosso');assert.equal(boss.maxhp,2200);
  g.spawnTick(10);assert.equal(g.enemies.length,1);assert.equal(spawnDue(g,20),false);
  boss.spawn=0;g.hitEnemy(boss,100000,{canCrit:false});assert.equal(g.run.world,'forest');assert.equal(g.run.worldCleared,true);
  assert.equal(g.run.portal.to,'dragon');g.spawnTick(100);spawnDue(g,30);assert.equal(g.enemies.length,0);
  g.updPortal(2);assert.equal(g.run.world,'forest');assert.equal(g.enterPortal(),false);
  g.run.pl.x=g.run.portal.x;g.run.pl.y=g.run.portal.y;g.updPortal(.01);
  assert.equal(g.run.world,'dragon');assert.equal(g.run.visit,1);assert.equal(g.run.worldTime,0);assert.equal(g.run.portal,null);
  g.run.lv=20;spawnDue(g,);assert.equal(g.enemies[0].boss.id,'cratos');assert.equal(g.enemies[0].maxhp,2880);
});

test('dificuldade do encontro fica fixa e escala vida do chefe pela jornada',()=>{
  const {game:g}=boot();begin(g,'fogo','calma');g.run.lv=10;g.S.diff='feroz';spawnDue(g,);
  assert.equal(g.enemies[0].maxhp,1760);begin(g,'fogo','feroz');g.run.lv=10;spawnDue(g,);assert.equal(g.enemies[0].maxhp,2860);
});

test('Cratos executa ataques das três fases com avisos e sem valores inválidos',()=>{
  const {game:g}=boot();begin(g,'fogo');g.run.world='dragon';g.run.lv=10;spawnDue(g,);const e=g.enemies[0];e.spawn=0;e.x=230;e.y=0;
  for(const ratio of [.9,.5,.2]){
    e.hp=e.maxhp*ratio;e.act=null;e.pt=0;const attacks=new Set();let warned=false;
    for(let i=0;i<420;i++){
      g.run.pl.inv=10;g.run.pl.x=0;g.run.pl.y=0;e.t+=.05;
      const d=Math.hypot(e.x,e.y)||1;g.updBoss(e,.05,-e.x/d,-e.y/d,d,92);
      if(e.act)attacks.add(e.act.k);if(e.tele)warned=true;
      assert.ok(Number.isFinite(e.mvx)&&Number.isFinite(e.mvy));if(i%20===0)g.render();
    }
    assert.equal(e.ph,ratio>.66?1:ratio>.33?2:3);assert.equal(attacks.size,3);assert.equal(warned,true);
  }
});

test('cauda de Cratos respeita área e sopro não aplica podridão durante esquiva',()=>{
  const {game:g}=boot();begin(g,'fogo');g.run.world='dragon';g.run.lv=10;spawnDue(g,);const e=g.enemies[0];e.spawn=0;e.x=0;e.y=0;e.cf=1;
  function tail(y){g.run.pl.x=0;g.run.pl.y=y;g.run.pl.hp=90;g.run.pl.inv=0;e.act={k:'tail',t:.94,fl:{},acc:0,aim:null,L:0};g.updCratos(e,.02,0,1,y,92,1);return g.run.pl.hp;}
  assert.equal(tail(340),90);assert.ok(tail(200)<90);
  g.run.pl.x=-220;g.run.pl.y=83;g.run.pl.inv=1;e.act={k:'breath',t:.8,fl:{},acc:0,aim:Math.PI,L:0};g.updCratos(e,.05,-1,0,220,92,1);
  assert.ok(!(g.run.pl.rot>0));g.run.pl.inv=0;g.updCratos(e,.05,-1,0,220,92,1);assert.equal(g.run.pl.rot,5);
});

test('campo de visão muda zoom e persiste sem selecionar personagem',()=>{
  const {game:g,node,store}=boot();begin(g,'fogo');const ch=g.P.char,normal=g.zoom;
  g.ACT.set({dataset:{k:'fov',v:'amplo'}});assert.ok(g.zoom<normal);assert.equal(g.P.char,ch);assert.match(node('#ui').innerHTML,/Campo de visão/);
  const next=JSON.parse(store.get('nevoa-selvagem-v3'));assert.equal(next.S.fov,'amplo');
  g.ACT.set({dataset:{k:'fov',v:'perto'}});assert.ok(g.zoom>normal);
});

function dragonFoe(g,type,x,y=0){
  const e=g.mkEnemy(type,g.run.lv,x,y,{spawn:0});e.cd=0;g.enemies.push(e);return e;
}
function enemySteps(g,n,dt=.05){for(let i=0;i<n;i++)g.updEnemies(dt);}

test('cada mundo só usa seu elenco, com desbloqueios relativos à etapa',()=>{
  const {game:g}=boot();begin(g,'fogo');
  for(const world of ['forest','dragon','swamp']){
    g.run.world=world;const ids=Object.keys(g.WORLDS[world].foes);
    for(const level of [1,3,5,7,9,13,20])for(let i=0;i<100;i++){const type=g.pickType(level);assert.ok(ids.includes(type));assert.ok(g.EN[type].unlock<=level);}
    g.run.lv=9;g.enemies.length=0;g.spawnRing(35);assert.ok(g.enemies.length<=35);assert.ok(g.enemies.every(e=>ids.includes(e.type)));
  }
  begin(g,'fogo');assert.equal(g.run.world,'forest');assert.equal(g.pickType(1),'esporo');
  for(const type of ['normal','planta','eletrico','fogo','pedra','agua','sombra'])assert.equal(g.EN[type],undefined);
});

test('Catador avisa antes do porrete, sem dano por contato; alcance e recarga limitados',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=dragonFoe(g,'catador',40),hp=g.run.pl.hp;
  g.updEnemies(.01);assert.equal(e.attack.k,'club');assert.equal(e.tele.r,28);assert.equal(g.run.pl.hp,hp);
  enemySteps(g,8);assert.equal(g.run.pl.hp,hp);g.updEnemies(.06);assert.ok(g.run.pl.hp<hp);assert.ok(e.cd>=1.2);
  const after=g.run.pl.hp;g.run.pl.inv=0;enemySteps(g,8);assert.equal(g.run.pl.hp,after);
  begin(g,'fogo');const far=dragonFoe(g,'catador',40);g.updEnemies(.01);g.run.pl.x=180;enemySteps(g,10);assert.equal(g.run.pl.hp,hp);
  assert.ok(far.cd>0);
});

test('Asabrasa recua, prepara a garganta e cospe uma brasa lenta de mira fixa',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=dragonFoe(g,'asabrasa',120);e.cd=1;
  g.updEnemies(.1);assert.ok(e.x>120);e.cd=0;g.updEnemies(.01);assert.equal(e.attack.k,'spit');
  const x=e.x;enemySteps(g,10);assert.equal(g.ebul.length,0);assert.equal(e.x,x);
  g.run.pl.y=180;enemySteps(g,3);assert.equal(g.ebul.length,1);
  const b=g.ebul[0];assert.equal(Math.round(Math.hypot(b.vx,b.vy)),210);assert.ok(b.r>=7);assert.ok(b.vy<40);assert.equal(b.life,2.6);
  assert.ok(e.cd>2);g.updProj(3);assert.equal(g.ebul.length,0);
});

test('Lagarto avisa o bote, percorre no máximo 96 e morde uma única vez',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=dragonFoe(g,'lagarto',150);const x=e.x;
  g.updEnemies(.01);assert.equal(e.attack.k,'crouch');assert.ok(e.tele);enemySteps(g,6);assert.equal(e.x,x);
  enemySteps(g,12);assert.ok(x-e.x<=96.001);assert.ok(x-e.x>90);assert.ok(e.cd>1.6);
  begin(g,'fogo');const near=dragonFoe(g,'lagarto',100);g.updEnemies(.01);const hp=g.run.pl.hp;
  enemySteps(g,15);assert.ok(g.run.pl.hp<hp);const after=g.run.pl.hp;g.run.pl.inv=0;enemySteps(g,6);assert.equal(g.run.pl.hp,after);assert.ok(near.cd>0);
});

test('Estufado sinaliza raio compacto por mais de um segundo e usa podridão existente',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=dragonFoe(g,'estufado',60),hp=g.run.pl.hp;
  g.updEnemies(.01);assert.equal(e.attack.k,'swell');assert.equal(e.tele.r,72);enemySteps(g,20);assert.equal(g.run.pl.hp,hp);
  g.updEnemies(.06);assert.ok(g.run.pl.hp<hp);assert.equal(g.run.pl.rot,2);assert.equal(g.enemies.length,0);
  assert.equal(g.run.kills,1);assert.equal(g.gems.length,1);assert.ok(g.fx.some(f=>f.k==='rotcloud'&&f.max<=.4));
  g.updFx(.5);assert.ok(!g.fx.some(f=>f.k==='rotcloud'));
});

test('explosão permite fuga, respeita esquiva e não envenena ao ser morto antes',()=>{
  const {game:g}=boot();
  for(const escape of ['fuga','esquiva','morte']){
    begin(g,'fogo');const e=dragonFoe(g,'estufado',60),hp=g.run.pl.hp;g.updEnemies(.01);
    if(escape==='fuga')g.run.pl.x=180;
    if(escape==='esquiva')g.run.pl.inv=2;
    if(escape==='morte')g.hitEnemy(e,100000,{canCrit:false});
    enemySteps(g,24);assert.equal(g.run.pl.hp,hp);assert.ok(!(g.run.pl.rot>0));assert.equal(g.enemies.length,0);
  }
});

test('ataques dracônicos são interrompidos por paralisia e pelo início do chefe',()=>{
  const {game:g}=boot();
  for(const type of Object.keys(g.DRAGON_FOES)){
    begin(g,'fogo');g.run.world='dragon';const e=dragonFoe(g,type,60);g.updEnemies(.01);assert.ok(e.attack);
    e.stun=.5;g.updEnemies(.05);assert.equal(e.attack,null);assert.equal(e.tele,null);
    spawnDue(g,10);assert.equal(g.enemies.length,1);assert.equal(g.enemies[0].boss.id,'cratos');
    g.spawnTick(20);assert.equal(g.enemies.length,1);assert.equal(g.ebul.length,0);
  }
});

test('novos inimigos preservam dificuldade, fragilidade, drops e colisões com projéteis',()=>{
  const {game:g}=boot();
  for(const type of Object.keys(g.DRAGON_FOES)){
    begin(g,'fogo','calma');const calm=g.mkEnemy(type,7,100,0,{});
    begin(g,'planta','feroz');const e=dragonFoe(g,type,70);const old=g.mkEnemy('catador',1,70,0,{});
    assert.ok(e.r>=12&&e.r<=27);assert.ok(Number.isFinite(e.maxhp));
    const scaled=g.mkEnemy(type,7,100,0,{});assert.ok(Math.abs(scaled.maxhp/calm.maxhp-1.3/.8)<1e-10);
    if(type==='lagarto'||type==='estufado')assert.ok(e.maxhp<old.maxhp);
    e.hp=1;g.basicAttack(0,100,0);g.updProj(.1);assert.equal(g.enemies.length,0);assert.equal(g.run.kills,1);assert.ok(g.gems.length>0);
  }
});

test('cada criatura tem silhueta e quadros próprios cacheados; cenário é decorativo',()=>{
  const {game:g}=boot();begin(g,'fogo');g.run.world='dragon';const silhouettes=[];
  for(const type of Object.keys(g.DRAGON_FOES)){
    const frames=[0,1,2,3,10,11].map(f=>{const c=g.monSprite(type,1,f);assert.equal(c.width,40);assert.equal(c,g.monSprite(type,1,f));return c.toDataURL();});
    assert.notEqual(frames[0],frames[1]);assert.notEqual(frames[0],frames[4]);silhouettes.push(frames[0]);
    dragonFoe(g,type,100,100);g.updEnemies(.01);g.render();
  }
  assert.equal(new Set(silhouettes).size,4);const list=[];g.addTrees(list);assert.equal(list.length,0);
  const before=JSON.stringify(g.enemies);g.drawGround();g.drawGround();assert.equal(JSON.stringify(g.enemies),before);
  assert.equal(g.hazards.length,0);g.run.world='forest';g.render();assert.equal(g.dragonRegion(),false);
});

function crossPortal(g){g.run.portal.t=1;g.run.pl.x=g.run.portal.x;g.run.pl.y=g.run.portal.y;assert.equal(g.enterPortal(),true);}
function defeatWorld(g){g.run.lv=Math.floor(g.run.lv/10+1)*10;g.run.need=g.xpNeed(g.run.lv);spawnDue(g,);const e=g.enemies.find(e=>e.boss);e.spawn=0;g.hitEnemy(e,100000000,{canCrit:false});return e;}

test('o ciclo alterna floresta, dragão e pântano por três voltas completas',()=>{
  const {game:g}=boot();begin(g,'fogo');assert.deepEqual(Object.keys(g.WORLDS),['forest','dragon','swamp']);
  for(let visit=0;visit<9;visit++){
    assert.equal(g.run.visit,visit);const world=['forest','dragon','swamp'][visit%3];assert.equal(g.run.world,world);
    const boss=defeatWorld(g);assert.equal(boss.boss.id,{forest:'colosso',dragon:'cratos',swamp:'serpente'}[world]);
    assert.equal(g.run.world,world);assert.equal(g.run.worldCleared,true);assert.equal(g.run.portal.to,{forest:'dragon',dragon:'swamp',swamp:'forest'}[world]);
    const kills=g.run.bossKills;spawnDue(g,g.run.lv+30);assert.equal(g.enemies.length,0);assert.equal(g.run.bossKills,kills);
    crossPortal(g);assert.equal(g.run.portal,null);assert.equal(g.run.worldCleared,false);
  }
  assert.equal(g.run.world,'forest');assert.equal(g.run.bossKills,9);
});

test('portal preserva vida, nível, XP, melhorias, aliados, recargas e coletas',()=>{
  const {game:g}=boot();begin(g,'fogo');defeatWorld(g);
  g.run.pl.hp=37.5;g.run.xp=7.25;g.run.pk.dmg=2;g.run.bl=3;g.run.sp=4.5;g.run.cd=.2;
  const ally=g.mkAlly('planta',3);g.run.allies.push(ally);g.dropGem(200,0,5);g.picks.push({k:'heal',x:300,y:0,t:0});
  const before={ch:g.run.ch,lv:g.run.lv,stage:g.run.stage,xp:g.run.xp,hp:g.run.pl.hp,bl:g.run.bl,sp:g.run.sp,cd:g.run.cd,gems:g.gems.length,picks:g.picks.length};
  crossPortal(g);
  for(const key of ['ch','lv','stage','xp','bl','sp','cd'])assert.equal(g.run[key],before[key]);
  assert.equal(g.run.pl.hp,before.hp);assert.equal(g.run.pk.dmg,2);assert.equal(g.run.allies[0],ally);assert.equal(ally.lvl,3);
  assert.equal(g.gems.length,before.gems);assert.equal(g.picks.length,before.picks);assert.equal(g.run.need,g.xpNeed(g.run.lv));
});

test('portal não ativa em pausa, sem contato, cedo demais ou depois da morte',()=>{
  const {game:g,events}=boot();begin(g,'fogo');defeatWorld(g);const portal=g.run.portal;
  g.run.pl.x=portal.x;g.run.pl.y=portal.y;assert.equal(g.enterPortal(),false);
  portal.t=1;events.blur();assert.equal(g.enterPortal(),false);g.ACT.resume();
  g.run.pl.x+=150;assert.equal(g.enterPortal(),false);g.run.pl.x=portal.x;
  g.run.pl.hp=1;g.hurtPlayer(100000);assert.equal(g.enterPortal(),false);assert.equal(g.run.world,'forest');
  begin(g,'fogo');assert.equal(g.run.portal,null);assert.equal(g.run.visit,0);
});

test('Esporos sempre surgem em trios completos e respeitam o teto simultâneo',()=>{
  const {game:g}=boot();begin(g,'fogo');
  for(let i=0;i<80;i++)g.spawnTick(.1);
  assert.ok(g.enemies.length>=9);assert.equal(g.enemies.length%3,0);
  const groups=new Map();for(const e of g.enemies){assert.equal(e.type,'esporo');if(!groups.has(e.pack))groups.set(e.pack,[]);groups.get(e.pack).push(e);}
  for(const group of groups.values()){assert.equal(group.length,3);assert.equal(new Set(group.map(e=>e.slot)).size,3);assert.ok(Math.hypot(group[0].x-group[1].x,group[0].y-group[1].y)<50);}
  for(const world of ['forest','dragon','swamp']){g.run.world=world;g.run.lv=100;g.run.visit=30;g.enemies.length=0;g.spawnRing(1000);assert.ok(g.enemies.length<=160);assert.equal(g.enemyCap(),160);for(let i=0;i<100;i++)g.spawnTick(.1);assert.ok(g.enemies.length<=160);}
});

test('nuvem dos Esporos só aparece após aviso e desaparece em menos de um segundo',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=dragonFoe(g,'esporo',45),hp=g.run.pl.hp;
  g.updEnemies(.01);assert.equal(e.attack.k,'spores');assert.equal(e.tele.r,48);enemySteps(g,12);assert.equal(g.hazards.length,0);assert.equal(g.run.pl.hp,hp);
  g.updEnemies(.06);assert.equal(g.hazards.length,1);g.updProj(.01);assert.ok(g.run.pl.hp<hp);assert.equal(g.run.pl.rot,2);
  g.updProj(.9);assert.equal(g.hazards.length,0);
  begin(g,'fogo');const killed=dragonFoe(g,'esporo',45);g.updEnemies(.01);g.hitEnemy(killed,100000,{canCrit:false});enemySteps(g,20);assert.equal(g.hazards.length,0);
});

test('Besouro sinaliza linha, limita investida e fica vulnerável na recuperação',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=dragonFoe(g,'besouro',150);const x=e.x,hp=g.run.pl.hp;
  g.updEnemies(.01);assert.equal(e.attack.k,'brace');assert.equal(e.tele.t,'lane');enemySteps(g,12);assert.equal(e.x,x);assert.equal(g.run.pl.hp,hp);
  g.run.pl.y=150;enemySteps(g,10);assert.ok(Math.abs(e.x-x)<=150.001);assert.equal(e.attack.k,'recover');assert.equal(g.run.pl.hp,hp);
  e.hp=100;g.hitEnemy(e,20,{canCrit:false});assert.equal(e.hp,75);assert.ok(e.cd>2);
});

test('Aranha prepara a mira e lança um espinho visível sem seguir o jogador',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=dragonFoe(g,'aranha',230);
  g.updEnemies(.01);assert.equal(e.attack.k,'thorn');enemySteps(g,13);assert.equal(g.ebul.length,0);
  g.run.pl.y=200;enemySteps(g,2);assert.equal(g.ebul.length,1);const b=g.ebul[0];assert.equal(b.kind,'thorn');assert.ok(Math.abs(Math.hypot(b.vx,b.vy)-200)<1e-9);assert.ok(b.vy<40);
  g.run.pl.x=500;g.updProj(.1);assert.ok(b.vx<0);assert.ok(e.cd>2);
});

test('Colosso mira a raiz por um segundo, permite fuga e recupera entre golpes',()=>{
  const {game:g}=boot();begin(g,'fogo');g.run.lv=10;spawnDue(g,);const e=g.enemies[0];e.spawn=0;e.x=220;e.y=0;e.pt=0;
  const hp=g.run.pl.hp;g.updEnemies(.01);assert.equal(e.act.k,'root');assert.equal(e.tele.r,90);enemySteps(g,18);assert.equal(g.run.pl.hp,hp);
  g.run.pl.x=-180;enemySteps(g,3);assert.equal(g.run.pl.hp,hp);assert.equal(e.act.hit,true);assert.ok(g.fx.some(f=>f.k==='roots'));
  enemySteps(g,17);assert.equal(e.act,null);assert.ok(e.pt>1.5);
  g.run.pl.x=0;g.run.pl.inv=0;e.pt=0;g.updEnemies(.01);enemySteps(g,21);assert.ok(g.run.pl.hp<hp);
});

test('crescimento moderado por passagem não acelera ataques nem remove limites',()=>{
  const {game:g}=boot();begin(g,'fogo');const first=g.mkEnemy('catador',1,100,0,{}),pressure=g.worldPressure();
  g.run.visit=1;const second=g.mkEnemy('catador',1,100,0,{});assert.ok(Math.abs(second.maxhp/first.maxhp-1.12)<1e-10);assert.ok(Math.abs(second.dmg/first.dmg-1.07)<1e-10);
  assert.ok(g.worldPressure()>pressure);g.run.visit=100;assert.ok(g.worldPressure()<=1.8);assert.ok(g.enemyCap()<=160);
  begin(g,'fogo');const forestHp=defeatWorld(g).maxhp;crossPortal(g);defeatWorld(g);crossPortal(g);defeatWorld(g);crossPortal(g);const forestAgain=defeatWorld(g);assert.ok(Math.abs(forestAgain.maxhp/forestHp-1.6)<1e-10);
});

test('XP evolui mais devagar: requisitos maiores e drops dracônicos reduzidos',()=>{
  const {game:g}=boot();begin(g,'fogo');let previous=0;
  for(let l=1;l<=150;l++){const old=6+l*5+Math.floor(l*l*.25),now=g.xpNeed(l);assert.ok(now>old);assert.ok(now>previous);previous=now;}
  assert.equal(g.run.need,14);const e=dragonFoe(g,'catador',100);g.hitEnemy(e,100000,{canCrit:false});assert.equal(g.gems[0].v,.5525);
  assert.equal(g.CH.fogo.hp,85);assert.equal(g.CH.fogo.dmg,8);assert.equal(g.CH.fogo.spd,225);
});

test('sprites da floresta têm movimento, preparação, golpe e recuperação distintos',()=>{
  const {game:g}=boot();const all=[];
  for(const type of ['esporo','besouro','aranha','colosso']){
    const frames=[0,1,10,11,12].map(frame=>g.monSprite(type,1,frame).toDataURL());
    assert.notEqual(frames[0],frames[1]);assert.notEqual(frames[0],frames[2]);assert.ok(new Set(frames).size>=3);all.push(frames[0]);
    const c=g.monSprite(type,1,0);assert.equal(c.width,type==='colosso'?96:40);assert.equal(c,g.monSprite(type,1,0));
  }
  assert.equal(new Set(all).size,4);
});

test('nenhum personagem pode obter uma cópia de si pelas cartas ou por chamada direta',()=>{
  const {game:g}=boot();
  for(const type of Object.keys(g.CH)){
    g.P.chars[type]=1;begin(g,type);
    for(let i=0;i<60;i++)assert.ok(g.makeCards().every(c=>c.k!=='ally'||c.t!==type));
    assert.equal(g.applyCard({k:'ally',t:type}),false);assert.equal(g.run.allies.length,0);
    g.run.pend=1;g.showLevelUp();g.cards.length=0;g.cards.push({k:'ally',t:type});g.ACT.card(button(0));
    assert.equal(g.run.pend,1);assert.equal(g.run.allies.length,0);g.ACT.resume();
  }
});

test('aliados iniciais salvos são únicos e filtrados antes de ocupar vagas',()=>{
  const {game:g,node,store}=boot({P:{seen:1,char:'fogo',coll:{planta:3,fogo:2,agua:1},start:['planta','planta','agua'],up:{slot:1}}});
  begin(g,'planta');assert.equal(g.run.allies.length,1);assert.equal(g.run.allies[0].type,'agua');
  assert.equal(g.P.coll.planta,3);assert.equal(g.P.coll.fogo,2);
  g.ACT.team();assert.match(node('#ui').innerHTML,/<button[^>]*data-a="load" data-i="planta"[^>]*disabled/);
  g.ACT.load(button('planta'));assert.ok(!g.P.start.includes('planta'));
  const saved=JSON.parse(store.get('nevoa-selvagem-v3'));assert.ok(!saved.P.start.includes('planta'));
  g.ACT.load(button('fogo'));assert.ok(g.P.start.includes('fogo'));
});

test('dano de aliados não ativa drenagem, incluindo projéteis, poças e correntes',()=>{
  for(const hero of ['planta','sombra'])for(const ally of ['fogo','agua','planta','eletrico','pedra','sombra']){
    if(hero===ally)continue;const {game:g}=boot(undefined,()=>.5);g.P.chars[hero]=1;begin(g,hero);g.run.st.crit=0;g.run.pl.hp=20;
    const e=target(g,ally==='fogo'?30:100,0,100000),a=g.mkAlly(ally,1);a.x=0;a.y=0;a.cd=0;g.run.allies.push(a);
    g.updAllies(.01);g.updProj(1);g.updLobs(2);g.updPools(2);
    assert.ok(e.hp<100000,hero+' / '+ally+' deve atingir o alvo');assert.equal(g.run.pl.hp,20,hero+' não drena dano de '+ally);
  }
});

test('Sakura perde a regeneração passiva e a drenagem tem orçamento por segundo',()=>{
  const {game:g}=boot();begin(g,'planta');g.run.pl.hp=20;g.run.st.crit=0;g.run.pl.inv=100;
  const e=target(g,100,0,100000);g.hitEnemy(e,1000,{canCrit:false});assert.ok(Math.abs(g.run.pl.hp-20.85)<1e-9);
  for(let i=0;i<30;i++)g.hitEnemy(e,1000,{canCrit:false});assert.ok(Math.abs(g.run.pl.hp-20.85)<1e-9);
  g.update(.5);assert.ok(Math.abs(g.run.pl.hp-20.85)<1e-9);g.hitEnemy(e,1000,{canCrit:false});assert.ok(Math.abs(g.run.pl.hp-21.275)<1e-9);
  assert.equal(g.run.st.regen,0);assert.equal(g.run.st.life,.01);
});

test('Flor de Sakura só cura ao acertar, no máximo 5%, com recarga de 20 s',()=>{
  const {game:g}=boot();begin(g,'planta');g.run.st.life=0;g.run.st.crit=0;g.run.pl.hp=20;
  g.useSpecial();assert.equal(g.run.pl.hp,20);assert.equal(g.run.sp,20);
  const e=target(g,100);g.run.sp=0;g.useSpecial();assert.ok(Math.abs(g.run.pl.hp-22.125)<1e-9);assert.equal(e.root,.8);
  g.enemies.length=0;for(let i=0;i<30;i++)target(g,100,i);g.run.sp=0;g.run.pl.hp=20;g.useSpecial();assert.equal(g.run.pl.hp,24.25);
});

test('Sakura aliada não cura sem combate e tem recarga própria mesmo com cadência máxima',()=>{
  const {game:g}=boot(undefined,()=>.5);begin(g,'fogo');g.run.pl.hp=20;g.run.st.cdm=.1;
  const a=g.mkAlly('planta',5);a.x=-60;a.y=-30;a.cd=0;g.run.allies.push(a);
  for(let i=0;i<600;i++){g.updAllies(.05);g.updHeal(.05);}
  assert.equal(g.run.pl.hp,20);assert.ok(!g.run.harr?.length);
  target(g,100,0,100000);a.cd=0;g.updAllies(.05);assert.equal(g.run.harr.length,1);assert.equal(a.healCd,10);
  for(let i=0;i<12;i++)g.updHeal(.02);assert.ok(Math.abs(g.run.pl.hp-22.295)<1e-9);
  for(let i=0;i<150;i++){g.updAllies(.05);g.updHeal(.05);}
  assert.ok(Math.abs(g.run.pl.hp-22.295)<1e-9);assert.ok(a.healCd>2);
});

test('ataques básicos iniciais sem crítico precisam de mais de um acerto contra comuns',()=>{
  for(const hero of ['fogo','agua','planta','eletrico','pedra','sombra'])for(const foe of ['esporo','catador','besouro']){
    const {game:g}=boot(undefined,()=>.5);
    g.P.chars[hero]=1;begin(g,hero);g.run.st.crit=0;const e=g.mkEnemy(foe,1,60,0,{});e.spd=0;e.cd=10;g.enemies.push(e);
    g.basicAttack(0,60,0);g.updProj(.6);g.updLobs(2);g.updPools(2);
    if(hero==='fogo')enemySteps(g,61);if(hero==='pedra')g.granitoStrikeTick(.42);
    assert.ok(e.hp>0,hero+' não elimina '+foe+' com um ataque inicial');assert.ok(e.hp<e.maxhp,hero+' atinge '+foe);
  }
});

test('reforços de chefe surgem devagar, priorizam distância e têm teto de oito',()=>{
  const {game:g}=boot(undefined,()=>.1);
  for(const world of ['forest','dragon','swamp']){
    begin(g,'fogo');g.run.world=world;g.run.lv=10;spawnDue(g,);const boss=g.enemies[0];
    g.spawnTick(20);assert.equal(g.enemies.length,1);boss.spawn=0;
    g.spawnTick(1);assert.equal(g.enemies.length,1);g.spawnTick(.7);assert.equal(g.enemies.length,2);
    const helper=g.enemies[1];assert.equal(helper.type,g.WORLDS[world].reinforcement);assert.equal(helper.spawn,.8);assert.equal(helper.elite,false);
    g.spawnRing(100);assert.equal(g.enemies.length,2);
    for(let i=0;i<600;i++)g.spawnTick(.05);
    const helpers=g.enemies.filter(e=>!e.boss);assert.equal(helpers.length,8);assert.ok(helpers.every(e=>e.type===helper.type));
    g.enemies.splice(1,1);g.spawnTick(.1);assert.equal(g.enemies.filter(e=>!e.boss).length,7);
    boss.spawn=0;g.hitEnemy(boss,100000,{canCrit:false});assert.equal(g.enemies.length,0);assert.equal(g.gems.length,6);
    g.spawnTick(100);assert.equal(g.enemies.length,0);assert.ok(g.run.portal);assert.equal(g.run.bossSpawnAcc,0);
  }
});

test('cadência durante o chefe é menor que a horda normal e respeita o mundo atual',()=>{
  const {game:g}=boot(undefined,()=>.1);begin(g,'fogo');g.run.lv=10;
  for(let i=0;i<200;i++)g.spawnTick(.1);const normal=g.enemies.length;
  spawnDue(g,);const boss=g.enemies[0];boss.spawn=0;
  for(let i=0;i<200;i++)g.spawnTick(.1);const helpers=g.enemies.filter(e=>!e.boss);
  assert.ok(normal>=50);assert.ok(helpers.length>0&&helpers.length<normal*.3);
  assert.ok(helpers.every(e=>g.FOREST_FOES[e.type]));
});

function swampRun(g){begin(g,'fogo');g.run.world='swamp';g.run.visit=2;g.run.worldStartLv=g.run.lv=21;}
function snakeBoss(g){swampRun(g);g.run.lv=30;spawnDue(g,);const e=g.enemies[0];e.spawn=0;e.x=200;e.y=80;e.face=-1;e.pt=0;return e;}

test('Bocarra nasce tamanho 3 e divide uma vez em duas tamanho 2 e quatro tamanho 1',()=>{
  const {game:g}=boot(undefined,()=>.5);swampRun(g);assert.equal(g.spawnGroup('bocarra',21,150,0),4);
  const root=g.enemies[0];assert.equal(root.size,3);assert.equal(g.enemies.length,1);assert.equal(g.enemySlots(),4);
  g.hitEnemy(root,100000,{canCrit:false});assert.equal(g.enemies.length,2);assert.ok(g.enemies.every(e=>e.size===2&&e.lineage===root.lineage&&e.spawn>0));
  g.killEnemy(root);g.hitEnemy(root,100000,{canCrit:false});assert.equal(g.enemies.length,2);assert.equal(g.enemySlots(),4);
  for(const e of [...g.enemies]){e.spawn=0;g.hitEnemy(e,100000,{canCrit:false});g.killEnemy(e);}
  assert.equal(g.enemies.length,4);assert.ok(g.enemies.every(e=>e.size===1&&e.lineage===root.lineage));assert.equal(g.enemySlots(),4);
  for(const e of [...g.enemies]){e.spawn=0;g.hitEnemy(e,100000,{canCrit:false});}
  assert.equal(g.enemies.length,0);assert.equal(g.run.kills,7);assert.equal(g.gems.length,7);
  assert.ok(Math.abs(g.gems.reduce((n,e)=>n+e.v,0)-1.3325)<1e-9);
});

test('divisão reserva espaço e nunca perde descendentes mesmo com população cheia',()=>{
  const {game:g}=boot();swampRun(g);g.run.lv=100;g.run.visit=30;
  for(let i=0;i<40;i++)assert.equal(g.spawnGroup('bocarra',30,300+i,0),4);
  assert.equal(g.enemies.length,40);assert.equal(g.enemySlots(),160);assert.equal(g.spawnGroup('mosquito',30,400,0),0);
  for(const size of [3,2]){
    for(const e of [...g.enemies].filter(e=>e.size===size)){e.spawn=0;g.hitEnemy(e,100000,{canCrit:false});}
    assert.equal(g.enemySlots(),160);assert.ok(g.enemies.length<=160);
  }
  assert.equal(g.enemies.length,160);assert.ok(g.enemies.every(e=>e.size===1));g.spawnTick(10);g.spawnRing(100);assert.equal(g.enemies.length,160);
});

test('limpeza de Bocarras em chefe ou transição não gera divisão nem recompensa',()=>{
  const {game:g}=boot();swampRun(g);g.spawnGroup('bocarra',21,200,0);const root=g.enemies[0];g.killEnemy(root,true);g.killEnemy(root);
  assert.equal(g.enemies.length,0);assert.equal(g.run.kills,0);assert.equal(g.gems.length,0);
  g.spawnGroup('bocarra',21,200,0);g.run.lv=30;spawnDue(g,);assert.equal(g.enemies.length,1);const boss=g.enemies[0];boss.spawn=0;
  g.spawnGroup('bocarra',30,300,0);g.hitEnemy(boss,100000,{canCrit:false});assert.equal(g.enemies.length,0);assert.equal(g.run.kills,1);assert.equal(g.gems.length,6);assert.equal(g.run.portal.to,'forest');
});

test('Bocarras menores têm menos vida, raio menor e velocidade maior',()=>{
  const {game:g}=boot(undefined,()=>.5);swampRun(g);const es=[3,2,1].map(size=>g.mkEnemy('bocarra',21,100,0,{size}));
  for(let i=1;i<es.length;i++){assert.ok(es[i].maxhp<es[i-1].maxhp);assert.ok(es[i].r<es[i-1].r);assert.ok(es[i].spd>es[i-1].spd);assert.ok(es[i].dmg<es[i-1].dmg);}
  assert.equal(g.monSprite('bocarra',3,0).width,40);
});

test('mordida da Bocarra tem aviso curto e não causa contato instantâneo',()=>{
  const {game:g}=boot();swampRun(g);const e=dragonFoe(g,'bocarra',60),hp=g.run.pl.hp;
  g.updEnemies(.01);assert.equal(e.attack.k,'mawbite');assert.equal(e.tele.t,'circle');enemySteps(g,6);assert.equal(g.run.pl.hp,hp);
  g.updEnemies(.03);assert.ok(g.run.pl.hp<hp);assert.equal(e.attack.k,'recover');const after=g.run.pl.hp;g.run.pl.inv=0;enemySteps(g,6);assert.equal(g.run.pl.hp,after);
});

test('Mosquito pica com investida limitada e pode aplicar sangramento de dois segundos',()=>{
  const {game:g}=boot(undefined,()=>.1);swampRun(g);const e=dragonFoe(g,'mosquito',120),x=e.x,hp=g.run.pl.hp;
  g.updEnemies(.01);assert.equal(e.attack.k,'needlewind');assert.equal(e.tele.t,'lane');enemySteps(g,4);assert.equal(e.x,x);assert.equal(g.run.pl.hp,hp);
  enemySteps(g,7);assert.ok(Math.abs(e.x-x)<=175.001);assert.ok(g.run.pl.hp<hp);assert.equal(g.run.pl.bleed,2);
  const bitten=g.run.pl.hp;g.run.pl.inv=0;assert.equal(g.applyBleed(),false);g.tickBleed(1);assert.equal(g.run.pl.bleed,1);
  assert.equal(g.applyBleed(),false);assert.equal(g.run.pl.bleed,1);g.tickBleed(1);assert.equal(g.run.pl.hp,bitten-4);assert.equal(g.run.pl.bleed,0);
  g.tickBleed(10);assert.equal(g.run.pl.hp,bitten-4);
});

test('picada permite fuga, respeita esquiva e não garante sangramento em todo acerto',()=>{
  for(const mode of ['fuga','esquiva','sem sangramento']){
    const {game:g}=boot(undefined,()=>.9);swampRun(g);dragonFoe(g,'mosquito',120);const hp=g.run.pl.hp;g.updEnemies(.01);
    if(mode==='fuga')g.run.pl.y=180;if(mode==='esquiva')g.run.pl.inv=2;
    enemySteps(g,18);assert.ok(!(g.run.pl.bleed>0));if(mode==='sem sangramento')assert.ok(g.run.pl.hp<hp);else assert.equal(g.run.pl.hp,hp);
  }
});

test('sangramento usa armadura, renascimento e interrupção de coleta por dano fatal',()=>{
  const {game:g}=boot();swampRun(g);g.run.pl.hp=20;g.applyBleed();g.tickBleed(2);assert.equal(g.run.pl.hp,16);
  g.run.st.armor=.5;g.run.pl.inv=0;g.applyBleed();g.tickBleed(2);assert.equal(g.run.pl.hp,14);
  g.P.up.revive=1;g.run.pl.hp=1;g.run.pl.inv=0;g.applyBleed();g.tickBleed(1);assert.equal(g.run.revived,true);assert.equal(g.run.pl.bleed,0);
  g.P.up.revive=0;swampRun(g);g.run.pl.hp=1;g.applyBleed();g.dropGem(0,0,10);g.picks.push({k:'heal',x:0,y:0,t:0});g.update(1);
  assert.equal(g.run.over,true);assert.equal(g.run.xp,0);assert.equal(g.picks.length,1);assert.equal(g.run.pl.hp,0);
});

test('casco do Caranguejo reduz dano frontal e abre na recuperação',()=>{
  const {game:g}=boot();swampRun(g);const e=dragonFoe(g,'caranguejo',0);e.hp=e.maxhp=1000;e.heading=0;
  function damage(x,y,recover=false){e.hp=1000;e.attack=recover?{k:'recover'}:null;g.hitEnemy(e,20,{origin:{x,y},canCrit:false});return 1000-e.hp;}
  assert.equal(damage(100,0),12);assert.equal(damage(0,100),20);assert.equal(damage(-100,0),20);assert.equal(damage(100,0,true),25);
});

test('flechas usam a direção real de chegada para atingir frente e costas do casco',()=>{
  const {game:g}=boot();function shot(front){begin(g,'planta');g.run.st.crit=0;const e=g.mkEnemy('caranguejo',1,100,0,{});e.hp=e.maxhp=100;e.heading=0;g.enemies.push(e);g.run.pl.x=front?200:0;g.basicAttack(front?Math.PI:0,100,0);g.updProj(.5);return 100-e.hp;}
  assert.equal(shot(true),5);assert.equal(shot(false),8);
});

test('Caranguejo se move lateralmente e avisa antes de dar a pinçada',()=>{
  const {game:g}=boot(undefined,()=>.5);swampRun(g);const e=dragonFoe(g,'caranguejo',120);g.updEnemies(.05);assert.ok(Math.abs(e.y)>.1);
  e.x=60;e.y=0;e.cd=0;const hp=g.run.pl.hp;g.updEnemies(.01);assert.equal(e.attack.k,'pinch');assert.ok(e.tele);
  enemySteps(g,11);assert.equal(g.run.pl.hp,hp);g.updEnemies(.06);assert.ok(g.run.pl.hp<hp);assert.equal(e.attack.k,'recover');assert.equal(e.attack.dur,.7);
});

test('Serpente avisa o bote, limita avanço e acerta no máximo uma mordida',()=>{
  const {game:g}=boot();const e=snakeBoss(g),x=e.x,y=e.y,hp=g.run.pl.hp;
  g.updEnemies(.01);assert.equal(e.act.k,'snakebite');assert.equal(e.act.dur,.75);assert.equal(e.tele.t,'lane');enemySteps(g,14);assert.equal(g.run.pl.hp,hp);assert.equal(e.x,x);
  enemySteps(g,7);assert.ok(g.run.pl.hp<hp);assert.ok(Math.hypot(e.x-x,e.y-y)<=260.001);assert.equal(e.act.phase,'recover');
  const after=g.run.pl.hp;g.run.pl.inv=0;enemySteps(g,5);assert.equal(g.run.pl.hp,after);
});

test('bote e cauda da Serpente permitem sair da área avisada',()=>{
  const {game:g}=boot();let e=snakeBoss(g);g.updEnemies(.01);g.run.pl.y=350;const hp=g.run.pl.hp;enemySteps(g,25);assert.equal(g.run.pl.hp,hp);
  e=snakeBoss(g);e.x=100;e.y=0;e.pi=1;g.updEnemies(.01);assert.equal(e.act.k,'snaketail');assert.equal(e.tele.r,215);enemySteps(g,18);assert.equal(g.run.pl.hp,hp);
  g.run.pl.x=400;enemySteps(g,6);assert.equal(g.run.pl.hp,hp);
});

test('cauda causa dano uma vez e segunda metade da vida reduz só o intervalo',()=>{
  const {game:g}=boot();const e=snakeBoss(g);e.x=100;e.y=0;e.pi=1;e.hp=e.maxhp*.49;g.updEnemies(.01);
  assert.equal(e.rage,true);assert.equal(e.act.dur,.95);const hp=g.run.pl.hp;enemySteps(g,21);assert.ok(g.run.pl.hp<hp);
  const after=g.run.pl.hp;g.run.pl.inv=0;for(let i=0;i<30&&e.act;i++)g.updEnemies(.05);assert.equal(g.run.pl.hp,after);assert.equal(e.pt,.8);
});

test('pântano usa o mesmo portal e conserva a partida ao retornar à floresta',()=>{
  const {game:g}=boot();swampRun(g);defeatWorld(g);assert.equal(g.run.portal.to,'forest');assert.equal(g.run.world,'swamp');
  g.run.pl.hp=31.5;g.run.xp=17;g.run.pk.dmg=3;g.run.sp=5;g.run.cd=.4;g.run.allies.push(g.mkAlly('planta',3));const ally=g.run.allies[0],lv=g.run.lv;
  crossPortal(g);assert.equal(g.run.world,'forest');assert.equal(g.run.visit,3);assert.equal(g.run.pl.hp,31.5);assert.equal(g.run.xp,17);assert.equal(g.run.pk.dmg,3);assert.equal(g.run.sp,5);assert.equal(g.run.cd,.4);assert.equal(g.run.lv,lv);assert.equal(g.run.allies[0],ally);
});

test('pântano procedural deixa áreas secas e molhadas, sem árvores densas nem colisores',()=>{
  const {game:g}=boot();swampRun(g);let wet=0;for(let y=-10;y<=10;y++)for(let x=-10;x<=10;x++)if(g.swampWet(x,y))wet++;
  assert.ok(wet>0&&wet<441);const trees=[];g.addTrees(trees);assert.equal(trees.length,0);
  assert.equal(g.tileCanvas(2,0,15),g.tileCanvas(2,0,15));assert.notEqual(g.tileCanvas(2,0,15).toDataURL(),g.tileCanvas(2,0,0).toDataURL());
  const e=dragonFoe(g,'caranguejo',120),before=JSON.stringify(e);g.drawGround();g.drawGround();g.render();assert.equal(JSON.stringify(e),before);assert.equal(g.hazards.length,0);
});

test('arte do pântano tem silhuetas distintas e quadros de movimento, aviso e ataque',()=>{
  const {game:g}=boot();const all=[];
  for(const type of ['bocarra','mosquito','caranguejo','serpente']){
    const frames=[0,1,10,11,12].map(f=>g.monSprite(type,3,f));all.push(frames[0].toDataURL());assert.equal(frames[0].width,type==='serpente'?g.SERPENTE_ART.frames.move0.w:40);
    assert.notEqual(frames[0].toDataURL(),frames[1].toDataURL());assert.notEqual(frames[0].toDataURL(),frames[2].toDataURL());assert.notEqual(frames[2].toDataURL(),frames[3].toDataURL());
  }
  assert.equal(new Set(all).size,4);
});

test('inimigos resistem mais e dão pouco mais de dano, com XP menor e heróis preservados',()=>{
  const {game:g}=boot();begin(g,'fogo');const e=g.mkEnemy('catador',1,100,0,{});
  assert.ok(e.maxhp>17&&e.maxhp<18);assert.ok(e.dmg>5.8&&e.dmg<6.1);assert.equal(e.xp,.5525);
  const boss=defeatWorld(g);assert.equal(boss.maxhp,2200);assert.ok(Math.abs(g.gems.reduce((n,e)=>n+e.v,0)-62.4)<1e-9);
  assert.deepEqual(Object.values(g.CH).map(c=>c.dmg),[8,7,7,8,9,6]);assert.equal(g.CH.planta.regen,0);assert.equal(g.CH.planta.life,.01);
});

test('saves atuais e legados retiram o ajudante removido sem perder Granito ou progresso',()=>{
  for(const legacy of [false,true]){
    const saved={P:{seen:1,char:'pedra',ess:512,chars:{pedra:1,sombra:1,normal:1},coll:{normal:5,planta:3,fogo:2},start:['normal','planta','fogo'],
      up:{vida:2,slot:1},ach:{boss:1},st:{kills:777,bestLv:22},rank:[{ch:'pedra',lv:22,time:500,score:2200500}]},S:{diff:'feroz',music:.2}};
    const {game:g,store}=boot(legacy?undefined:saved,()=>.5,legacy?saved:undefined);
    assert.equal(g.P.char,'pedra');assert.equal(g.P.chars.pedra,1);assert.equal(g.P.chars.sombra,1);assert.equal(g.P.ess,512);
    assert.equal(g.P.up.vida,2);assert.equal(g.P.up.slot,1);assert.equal(g.P.st.kills,777);assert.equal(g.P.st.bestLv,22);assert.equal(g.P.ach.boss,1);assert.equal(g.P.rank[0].score,2200500);
    assert.deepEqual([...g.P.start],['planta','fogo']);assert.equal(g.P.coll.planta,3);assert.equal(g.P.coll.normal,undefined);assert.equal(g.P.chars.normal,undefined);
    const migrated=JSON.parse(store.get('nevoa-selvagem-v3'));assert.equal(migrated.P.ess,512);assert.deepEqual(migrated.P.start,['planta','fogo']);
    begin(g,'pedra','normal');assert.equal(g.run.ch,'pedra');assert.equal(g.run.st.maxhp,155);assert.equal(g.run.allies.length,2);
  }
});

test('Granito conserva desbloqueio, atributos e Carapaça na seleção e na jornada',()=>{
  const {game:g,node}=boot({P:{seen:1,ess:500}});g.ACT.team();assert.match(node('#ui').innerHTML,/Granito/);assert.doesNotMatch(node('#ui').innerHTML,/Pedrin|Rochedão|Tatu escavador/);
  g.ACT.buychar(button('pedra'));assert.equal(g.P.ess,350);assert.equal(g.P.chars.pedra,1);
  g.ACT.play();g.ACT.difficulty(button('normal'));assert.match(node('#ui').innerHTML,/Granito/);assert.match(node('#ui').innerHTML,/Escavador de Pedra · Terra/);assert.match(node('#ui').innerHTML,/Carapaça/);
  g.ACT.begin(button('pedra'));assert.deepEqual([g.run.st.maxhp,g.run.st.dmg,g.run.st.spd,g.run.st.armor],[135,9,172,.18]);
  g.hurtPlayer(100);assert.equal(g.run.pl.hp,53);assert.equal(g.run.sp,0);assert.equal(g.CH.pedra.scd,12);
});

test('ajudante removido não tem entidade, cartas, seleção, invocação ou efeito',()=>{
  const {game:g,node}=boot({P:{seen:1,char:'normal',chars:{normal:1},coll:{normal:5},start:['normal'],ess:91}});
  assert.equal(g.P.char,'fogo');assert.equal(g.P.ess,91);assert.equal(g.P.start.length,0);assert.equal(g.mkAlly('normal'),null);assert.throws(()=>g.monSprite('normal',1,0));
  for(const action of ['team','how']){g.ACT[action]();assert.doesNotMatch(node('#ui').innerHTML,/Ventinho|Ventania|data-i="normal"/);}
  begin(g,'fogo');g.ACT.load(button('normal'));assert.equal(g.P.start.length,0);assert.equal(g.applyCard({k:'ally',t:'normal'}),false);
  for(let i=0;i<25;i++)assert.ok(g.makeCards().every(c=>c.t!=='normal'));
  g.run.allies.push({type:'normal',lvl:5,x:0,y:0,cd:0});const e=target(g,30),hp=e.hp;
  g.updAllies(.2);g.render();assert.equal(g.run.allies.length,0);assert.equal(e.hp,hp);assert.ok(!g.fx.some(f=>f.c==='#b9e6f0'));
  assert.deepEqual([...g.TYPES],['fogo','agua','planta','eletrico','pedra','sombra']);
});

test('Granito usa recortes originais distintos e mantém o desenho em todas as evoluções',()=>{
  const {game:g}=boot();const expected={20:'idle',10:'walk',40:'run',30:'claw0',33:'claw3',50:'hurt',63:'dead',72:'stone2',84:'quake4'};
  for(const [frame,id]of Object.entries(expected)){
    const c=g.granitoSprite(1,+frame),meta=g.GRANITO_ART.frames[id];assert.equal(c.sourceId,id);assert.equal(c.width,meta.w);assert.equal(c.height,meta.h);assert.equal(c.fy,meta.fy);assert.equal(c,g.granitoSprite(3,+frame));
    assert.ok(c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v>0));
  }
  assert.equal(g.granitoFrame({flash:.2,gAnim:{k:'stone',t:.1,dur:.55}}),50);
  assert.equal(g.granitoFrame({dash:{},t:.1}),20);assert.equal(g.granitoFrame({},false,1),63);
});

test('garras de Granito acertam duas vezes de perto sem somar uma Pedrada',()=>{
  const {game:g}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');g.run.st.crit=0;
  const near=target(g,70,0,100),far=target(g,170,0,100),behind=target(g,-70,0,100);
  g.basicAttack(0,70,0);assert.equal(g.run.cd,1.2);assert.equal(g.lobs.length,0);assert.equal(near.hp,100);
  g.granitoStrikeTick(.19);assert.equal(near.hp,100);g.granitoStrikeTick(.01);assert.equal(near.hp,95);
  g.granitoStrikeTick(.12);assert.equal(near.hp,90);g.granitoStrikeTick(1);assert.equal(near.hp,90);assert.equal(far.hp,100);assert.equal(behind.hp,100);
  assert.equal(g.attackRange(),112);assert.equal(g.run.pl.x,0);assert.equal(g.run.pl.dash,null);
});

test('Pedrada especial prepara, mantém impacto em 0,55 s e limita alcance após movimento',()=>{
  const {game:g}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');g.run.st.crit=0;g.cam.x=g.cam.y=0;g.mouse.x=240*g.zoom;g.mouse.y=0;const e=target(g,240,0,100);
  g.useStoneSpecial();assert.equal(g.run.sp2,6);assert.equal(g.run.sp,0);assert.equal(g.run.pl.gAnim.k,'stone');assert.equal(g.lobs.length,1);
  g.updLobs(.25);assert.equal(e.hp,100);assert.ok(g.lobs[0].t<0);g.updLobs(.01);assert.equal(g.lobs[0].launched,true);
  g.updLobs(.28);assert.equal(e.hp,100);g.updLobs(.01);assert.equal(e.hp,90);assert.equal(e.stun,.4);assert.equal(g.lobs.length,0);
  g.run.chg=null;g.run.sp2=0;g.mouse.x=9999*g.zoom;g.useStoneSpecial();g.run.pl.x=-200;g.updLobs(.26);const l=g.lobs[0];assert.equal(l.x0,-200);assert.ok(Math.hypot(l.tx-l.x0,l.ty-l.y0)<=320.00001);
  assert.equal(g.granitoFrame({gAnim:{k:'stone',t:.2,dur:.55}}),73);assert.equal(g.granitoFrame({gAnim:{k:'stone',t:.32,dur:.55}}),74);
});

test('Terremoto anuncia por 0,36 s e preserva raio, dano, recarga, atordoamento e empurrão',()=>{
  const {game:g}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');g.run.st.crit=0;const near=target(g,240,0,100),far=target(g,340,0,100);
  g.useSpecial();assert.equal(g.run.chg.kind,'quake');assert.equal(g.run.chg.R,260);assert.equal(g.run.sp,12);assert.equal(near.hp,100);
  g.chargeTick(.35);assert.equal(near.hp,100);g.useSpecial();assert.equal(g.run.sp,12);g.chargeTick(.01);
  assert.equal(near.hp,77);assert.equal(near.stun,1.4);assert.ok(near.kx>300);assert.equal(far.hp,100);assert.equal(g.run.chg,null);
  g.chargeTick(1);assert.equal(near.hp,77);assert.ok(g.fx.some(f=>f.k==='granitoquake'));
  g.run.sp=0;g.useSpecial();g.keys.r=true;g.update(.1);assert.equal(g.run.pl.vx,172);
});

test('morte interrompe as ações pendentes de Granito e usa a própria animação',()=>{
  const {game:g}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');const e=target(g,60,0,100);g.basicAttack(0,60,0);g.useSpecial();g.hurtPlayer(100000);
  g.granitoStrikeTick(2);g.chargeTick(2);g.update(.7);g.render();assert.equal(e.hp,100);assert.equal(g.run.chg,null);assert.equal(g.run.over,true);
  assert.equal(g.granitoFrame(g.run.pl,false,g.run.overMax-g.run.overT),63);assert.equal(g.run.kills,0);
});

test('Granito aliado prepara a mesma Pedrada e mantém origem, alcance e dano próprios',()=>{
  const {game:g}=boot(undefined,()=>.5);begin(g,'planta');g.run.pl.hp=20;g.run.st.crit=0;const e=target(g,200,0,100),a=g.mkAlly('pedra',1);a.cd=0;g.run.allies.push(a);
  g.updAllies(.01);assert.equal(a.gAnim.k,'stone');assert.equal(g.lobs.length,1);assert.equal(g.lobs[0].from,'ally');assert.equal(g.lobs[0].own,a);
  g.updLobs(.25);assert.equal(e.hp,100);g.updLobs(.35);assert.equal(e.hp,90);assert.equal(e.stun,.5);assert.equal(g.run.pl.hp,20);
});

test('cada mapa anuncia seu chefe aos 240 segundos, independentemente do nível e do XP',()=>{
  const {game:g}=boot(undefined,()=>.5);
  for(const [world,boss]of [['forest','colosso'],['dragon','cratos'],['swamp','serpente']])for(const level of [1,100]){
    begin(g,'fogo');g.run.world=world;g.run.lv=level;g.run.need=1e9;g.run.pl.inv=100;g.onLevel();assert.equal(g.bossAlive(),false);
    g.run.worldTime=239.99;assert.equal(g.spawnBoss(),false);g.update(.005);assert.equal(g.bossAlive(),false);g.update(.005);
    const active=g.enemies.filter(e=>e.boss);assert.equal(active.length,1);assert.equal(active[0].boss.id,boss);assert.equal(g.run.lv,level);assert.equal(g.run.xp,0);
    g.update(.2);assert.equal(g.enemies.filter(e=>e.boss).length,1);
  }
});

test('pausa, escolhas e derrota não contam tempo para o chefe; portal reinicia os quatro minutos',()=>{
  const {game:g,events}=boot(undefined,()=>.5);begin(g,'fogo');g.run.worldTime=239;g.frame(1000);const before=g.run.worldTime;
  events.blur();g.frame(100000);assert.equal(g.run.worldTime,before);g.ACT.resume();
  g.run.pend=1;g.showLevelUp();g.frame(200000);assert.equal(g.run.worldTime,before);g.ACT.card(button(0));g.frame(200050);assert.ok(g.run.worldTime>before);
  defeatWorld(g);g.run.pl.hp=37;g.run.xp=2;crossPortal(g);assert.equal(g.run.worldTime,0);assert.equal(g.run.pl.hp,37);assert.equal(g.run.xp,2);
  assert.equal(g.spawnBoss(),false);g.run.pl.hp=1;g.run.pl.inv=0;g.hurtPlayer(100000);const t=g.run.worldTime;g.frame(300000);assert.equal(g.run.worldTime,t);
});

test('elenco da etapa se libera pelo tempo mesmo quando poucos drops impedem subir níveis',()=>{
  const {game:g}=boot(undefined,()=>.99);begin(g,'fogo');g.run.lv=1;assert.equal(g.pickType(),'esporo');
  g.run.worldTime=120;assert.equal(g.worldLevel(),5);assert.equal(g.pickType(),'aranha');
  g.run.world='dragon';g.run.worldTime=180;assert.equal(g.worldLevel(),7);assert.equal(g.pickType(),'asabrasa');
  g.run.world='swamp';g.run.worldTime=0;assert.equal(g.worldLevel(),1);assert.equal(g.pickType(),'caranguejo');
});

test('drops de XP, cura, ímã e baú de elite diminuem, mantendo o baú do chefe',()=>{
  let roll=.99;const {game:g}=boot(undefined,()=>roll);begin(g,'fogo');const xp=()=>{const e=g.mkEnemy('catador',1,100,0,{});g.enemies.push(e);g.killEnemy(e);return e;};
  assert.equal(xp().xp,.5525);assert.equal(g.picks.length,0);
  for(const [r,kind]of [[.005,'magnet'],[.01,'heal'],[.02,null]]){roll=r;g.picks.length=0;xp();assert.equal(g.picks[0]?.k||null,kind);}
  for(const [r,expected]of [[.34,1],[.36,0]]){roll=r;g.picks.length=0;const e=g.mkEnemy('catador',1,100,0,{elite:true});g.enemies.push(e);g.killEnemy(e);assert.equal(g.picks.filter(k=>k.k==='chest').length,expected);}
  roll=.99;g.picks.length=0;g.gems.length=0;defeatWorld(g);assert.equal(g.gems.length,6);assert.ok(Math.abs(g.gems.reduce((n,x)=>n+x.v,0)-62.4)<1e-9);assert.equal(g.picks.filter(k=>k.k==='chest'&&k.big).length,1);
});

test('Bocarras têm maior participação e aguardam orçamento sem perder o surgimento sorteado',()=>{
  let n=0;const {game:g}=boot(undefined,()=>((n++*.61803398875)%1));swampRun(g);let roots=0;
  for(let i=0;i<1000;i++)if(g.pickType(9)==='bocarra')roots++;assert.ok(roots>550&&roots<625);
  let roll=.01;const {game:h}=boot(undefined,()=>roll);swampRun(h);h.spawnTick(.5);assert.equal(h.enemies.length,0);assert.equal(h.run.spawnType,'bocarra');
  roll=.99;h.spawnTick(2);assert.equal(h.enemies[0].type,'bocarra');assert.equal(h.enemies[0].size,3);assert.ok(h.enemySlots()<=h.enemyCap());
});

test('Mosquito rápido inicia picadas mais longe e aplica sangramento em 35% das tentativas válidas',()=>{
  for(const [roll,bleeds]of [[.34,true],[.36,false]]){
    const {game:g}=boot(undefined,()=>roll);swampRun(g);const e=dragonFoe(g,'mosquito',210),hp=g.run.pl.hp;assert.ok(e.spd>195);
    g.updEnemies(.01);assert.equal(e.attack.dur,.28);assert.ok(e.attack.left>105&&e.attack.left<=175);assert.equal(g.run.pl.hp,hp);
    enemySteps(g,14);assert.ok(g.run.pl.hp<hp);assert.equal(g.run.pl.bleed>0,bleeds);assert.ok(e.cd<=1.05);assert.ok(e.maxhp>g.mkEnemy('bocarra',21,0,0,{size:2}).maxhp);
  }
});

test('Serpente tem mais resistência e pressão sem remover as preparações dos ataques',()=>{
  const {game:g}=boot(undefined,()=>.5);const e=snakeBoss(g);assert.equal(e.maxhp,5320);assert.equal(e.spd,88);assert.ok(e.dmg>30);
  g.updEnemies(.01);assert.equal(e.act.dur,.75);assert.equal(e.tele.t,'lane');
  for(let i=0;i<45&&e.act;i++){g.run.pl.inv=10;g.updEnemies(.05);}assert.equal(e.pt,1.15);
  e.hp=e.maxhp*.49;e.pt=0;e.pi=1;g.updEnemies(.01);assert.equal(e.act.dur,.95);assert.equal(e.tele.r,215);
  for(let i=0;i<45&&e.act;i++){g.run.pl.inv=10;g.updEnemies(.05);}assert.equal(e.pt,.8);
});

test('novo pântano tem trilhas, poças e detalhes distintos sem alterar colisões',()=>{
  const {game:g}=boot();swampRun(g);let paths=0,wet=0;for(let y=-12;y<12;y++)for(let x=-12;x<12;x++){paths+=g.swampTrail(x,y)?1:0;wet+=g.swampWet(x,y)?1:0;}
  assert.ok(paths>0&&paths<400);assert.ok(wet>0&&wet<400);assert.notEqual(g.tileCanvas(2,0,0,0).toDataURL(),g.tileCanvas(2,0,0,15).toDataURL());
  const details=new Set(Array.from({length:8},(_,i)=>g.swampDecorCanvas(i,0).toDataURL()));assert.equal(details.size,8);
  const e=dragonFoe(g,'mosquito',120),before=JSON.stringify(e);g.drawGround();g.render();assert.equal(JSON.stringify(e),before);assert.equal(g.hazards.length,0);
});

test('todos os recortes de Granito preservam o RGB original, sem títulos ou a prancha completa',()=>{
  const importer=require('../scripts/build-granito.cjs'),source=importer.readSource(),{game:g}=boot();
  assert.equal(source.sha256,'4d8a6fb61786d344368f64bb395dc88b59b96a745460c44285aa21647ee3b705');
  assert.equal(g.GRANITO_ART.sourceSha256,source.sha256);assert.equal(Object.keys(g.GRANITO_ART.frames).length,27);
  const expected=crypto.createHash('sha256').update(JSON.stringify(importer.build())).digest('hex');
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(g.GRANITO_ART)).digest('hex'),expected);
  for(const [id,rect]of Object.entries(importer.manifest.frames)){
    const c=g.granitoAsset(id),pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data,original=importer.crop(source,rect,{solid:importer.manifest.opaque[id]});
    assert.equal(Buffer.compare(Buffer.from(pixels),original.data),0,id+' copia cada pixel');assert.ok(c.width<768&&c.height<512,id);
    let visible=0,annotations=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]){visible++;if(pixels[i]>130&&pixels[i+2]>130&&pixels[i+2]>pixels[i]*1.1&&pixels[i+1]<100)annotations++;}
    assert.ok(visible>100,id);assert.equal(annotations,0,id+' não inclui linhas/títulos magenta');
  }
  const tiny={width:5,height:5,data:Buffer.alloc(100)};
  for(let i=3;i<100;i+=4)tiny.data[i]=255;
  for(let y=1;y<4;y++)for(let x=1;x<4;x++)if(x===1||x===3||y===1||y===3){const at=(y*5+x)*4;tiny.data[at]=40;tiny.data[at+1]=25;tiny.data[at+2]=45;}
  const cut=importer.crop(tiny,[0,0,5,5,2,4,4]).data;assert.equal(cut[3],0);assert.equal(cut[(2*5+2)*4+3],255);assert.equal(cut[(2*5+2)*4],0);
});

test('ataque básico continua sendo garras mesmo com a mira distante ou Disparo Extra',()=>{
  const {game:g}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');g.run.st.crit=0;g.run.st.multi=4;
  const near=target(g,70,0,100),far=target(g,500,0,100);g.basicAttack(0,500,0);g.granitoStrikeTick(.42);
  assert.equal(near.hp,90);assert.equal(far.hp,100);assert.equal(g.lobs.length,0);assert.equal(g.run.sp2,0);assert.equal(g.run.cd,1.2);
  g.enemies.splice(g.enemies.indexOf(near),1);g.S.aim='auto';g.run.cd=0;g.update(.1);assert.equal(g.lobs.length,0);assert.equal(far.hp,100);assert.ok(g.run.cd<=0);
});

test('Pedrada e Terremoto têm recargas independentes e só compartilham a preparação',()=>{
  const {game:g}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');g.run.pl.inv=100;
  assert.equal(g.useStoneSpecial(),true);assert.equal(g.run.sp2,6);assert.equal(g.run.sp,0);assert.equal(g.run.chg.kind,'stone');
  g.useSpecial();assert.equal(g.run.sp,0);assert.equal(g.useStoneSpecial(),false);assert.equal(g.lobs.length,1);
  g.chargeTick(.26);g.useSpecial();assert.equal(g.run.sp,12);assert.equal(g.run.sp2,6);assert.equal(g.run.chg.kind,'quake');
  g.chargeTick(.36);g.useSpecial();assert.equal(g.run.chg,null);assert.equal(g.useStoneSpecial(),false);
  g.update(1);assert.equal(g.run.sp,11);assert.equal(g.run.sp2,5);const e=target(g,700,0,1);g.killEnemy(e);
  assert.ok(Math.abs(g.run.sp-10.9)<1e-9);assert.ok(Math.abs(g.run.sp2-4.9)<1e-9);
  g.run.pl.gAnim={k:'stone',t:.3,dur:.55};g.basicAttack(0,80,0);assert.equal(g.run.pl.gAnim.k,'stone');
  g.run.pl.gAnim.t=.36;g.basicAttack(0,80,0);assert.equal(g.run.pl.gAnim.k,'claw');
});

test('Granito não faz dash: Shift e o botão secundário usam Pedrada sem invulnerabilidade',()=>{
  const {game:g,events}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');g.doDash();assert.equal(g.run.pl.dash,null);assert.equal(g.run.pl.inv,0);
  const key={key:'Shift',repeat:false,preventDefault(){}};events.keydown(key);assert.equal(g.run.pl.dash,null);assert.equal(g.run.pl.inv,0);assert.equal(g.run.sp2,6);assert.equal(g.run.dcd||0,0);
  events.keydown({...key,repeat:true});assert.equal(g.lobs.length,1);g.update(.1);assert.equal(g.run.pl.x,0);assert.equal(g.run.pl.y,0);assert.equal(g.run.pl.dash,null);
  g.run.chg=null;g.run.sp2=0;events['#b-dash:click']({currentTarget:{blur(){}}});assert.equal(g.run.sp2,6);assert.equal(g.run.pl.dash,null);
  begin(g,'fogo');events.keydown(key);assert.ok(g.run.pl.dash);assert.equal(g.run.pl.dash.nodmg,true);assert.equal(g.run.dcd,2.4);
});

test('interface de Granito oferece os dois especiais e restaura esquiva nos outros heróis',()=>{
  const {game:g,node}=boot({P:{seen:1,chars:{pedra:1}}});g.ACT.play();g.ACT.difficulty(button('normal'));
  const card=node('#ui').innerHTML;assert.ok(card.includes('<b>Garras:</b>'));assert.ok(card.includes('<b>Pedrada:</b>'));assert.ok(card.includes('<b>Terremoto:</b>'));assert.ok(card.includes('Granito não tem dash'));
  g.ACT.begin(button('pedra'));g.updHud();assert.equal(node('#b-dash').getAttribute('aria-label'),'Pedrada (Shift)');assert.match(node('#b-dash-n').innerHTML,/Pedrada/);assert.doesNotMatch(node('#shift-hint').innerHTML,/esquiva/i);
  assert.equal(node('#b-sp-n').textContent,'Terremoto');g.run.sp2=3;g.run.sp2Max=6;g.run.sp=9;g.run.spMax=12;g.updHud();
  assert.equal(node('#b-dash-cd').style.height,'50%');assert.equal(node('#b-sp-cd').style.height,'75%');
  begin(g,'fogo');assert.equal(node('#b-dash').getAttribute('aria-label'),'Esquiva (Shift)');assert.match(node('#shift-hint').innerHTML,/esquiva/);
});

test('Terremoto usa as poses e a onda originais em preparação, golpe, explosão e recuperação',()=>{
  const {game:g}=boot();const times=[0,.15,.27,.42,.65,.9],expected=['quake0','quake1','quake2','quake3','quake4','quake1'];
  times.forEach((t,i)=>{const frame=g.granitoFrame({gAnim:{k:'quake',t,dur:1.02}});assert.equal(g.monSprite('pedra',1,frame).sourceId,expected[i]);});
  g.P.chars.pedra=1;begin(g,'pedra');g.run.st.crit=0;const e=target(g,200,0,100);g.useSpecial();g.chargeTick(.35);assert.equal(e.hp,100);g.chargeTick(.01);
  assert.equal(e.hp,77);const wave=g.fx.find(f=>f.k==='granitoquake');assert.equal(wave.R,260);assert.equal(wave.max,.72);
  g.run.pl.gAnim.t=.65;g.basicAttack(0,80,0);assert.equal(g.run.pl.gAnim.k,'quake');assert.equal(g.run.pl.gStrike,null);
  g.run.pl.gAnim.t=.8;g.basicAttack(0,80,0);assert.equal(g.run.pl.gAnim.k,'claw');
  for(let i=0;i<10;i++){g.render();g.updFx(.08);}assert.ok(!g.fx.some(f=>f.k==='granitoquake'));
});

test('Pedrada especial respeita pausa, derrota e mira automática sem conceder dash',()=>{
  const {game:g,events}=boot(undefined,()=>.5);g.P.chars.pedra=1;begin(g,'pedra');events.blur();assert.equal(g.useStoneSpecial(),false);assert.equal(g.run.sp2,0);g.ACT.resume();
  g.S.aim='auto';const e=target(g,250,100,100);assert.equal(g.useStoneSpecial(),true);const shot=g.lobs[0];assert.ok(Math.abs(shot.tx-e.x)<1e-9);assert.ok(Math.abs(shot.ty-e.y)<1e-9);assert.ok(Math.hypot(shot.tx-shot.x0,shot.ty-shot.y0)<=320);
  assert.equal(g.run.pl.dash,null);g.hurtPlayer(100000);g.run.sp2=0;assert.equal(g.useStoneSpecial(),false);assert.equal(g.run.sp2,0);
});

test('portal preserva as duas recargas de Granito e uma nova jornada zera ambas',()=>{
  const {game:g}=boot();g.P.chars.pedra=1;begin(g,'pedra');defeatWorld(g);g.run.sp2=4.25;g.run.sp2Max=6;g.run.sp=7.5;g.run.spMax=12;g.run.pl.hp=80;
  crossPortal(g);assert.equal(g.run.sp2,4.25);assert.equal(g.run.sp2Max,6);assert.equal(g.run.sp,7.5);assert.equal(g.run.pl.hp,80);
  begin(g,'pedra');assert.equal(g.run.sp,0);assert.equal(g.run.sp2,0);assert.equal(g.run.pl.dash,null);
});

test('sombras abertas do torso de Granito não viram buracos durante os passos e a corrida',()=>{
  const {game:g}=boot();
  for(const [id,x,y]of [['walk',115,110],['run',110,70],['run',100,110],['hurt',120,88],['claw0',110,80]]){
    const c=g.granitoAsset(id),rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    assert.equal(rgba[(y*c.width+x)*4+3],255,id+' mantém a sombra do corpo');
    assert.equal(rgba[3],0,id+' retira o fundo externo');
  }
  const c=g.granitoAsset('run'),rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  assert.equal(rgba[(140*c.width+110)*4+3],0,'o espaço entre as pernas permanece vazado');
  for(let t=0;t<1;t+=.1){const pose=g.granitoFrame({vx:172,vy:0,t},true);assert.ok(pose>=10&&pose<=13,'andar não troca pela pose de corrida');}
  assert.equal(g.granitoFrame({vx:240,vy:0,t:0},true),40,'a pose de corrida fica disponível para velocidade aumentada');
});

function visibleBox(c){
  const rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(rgba[(y*c.width+x)*4+3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  return {x0,y0,x1,y1,h:y1-y0+1,w:x1-x0+1};
}

test('escala de Granito é consistente no menu, na partida e como aliado',()=>{
  const {game:g,node}=boot();g.P.chars.pedra=1;g.frame(1100);
  let images=node('#cv').getContext('2d').images.filter(d=>d.img.assetGroup==='granito');
  assert.ok(images.length>0,'o menu realmente desenha Granito');
  for(const {args}of images){assert.ok(args[2]<120);assert.ok(args[3]<110,'nenhum recorte gigante no menu');}
  for(const stage of [1,2,3])for(const frame of [0,10,20,40]){
    const c=g.monSprite('pedra',stage,frame),box=g.spriteLayout(c,'pedra',3.3+stage*.15),bounds=visibleBox(c);
    assert.ok(bounds.h*box.scale>=60&&bounds.h*box.scale<85,'altura do personagem entre 60 e 85 unidades');
    assert.equal(box.top+c.fy*box.scale,12,'linha dos pés estável');
  }
  begin(g,'pedra');g.run.fade=0;g.render();
  images=node('#cv').getContext('2d').images.filter(d=>d.img.assetGroup==='granito');
  assert.ok(images.at(-1).args[3]>75,'a normalização não é aplicada duas vezes ao jogador');
  begin(g,'fogo');g.run.allies.push(g.mkAlly('pedra',1));g.render();
  const ally=node('#cv').getContext('2d').images.filter(d=>d.img.assetGroup==='granito').at(-1);
  assert.ok(ally.args[3]>50&&ally.args[3]<70,'o aliado também usa a escala do asset uma vez');
});

test('a Serpente usa os recortes da referência sem redesenho ou prancha inteira',()=>{
  const importer=require('../scripts/build-serpente.cjs'),source=importer.readSource(),{game:g}=boot();
  assert.equal(source.sha256,'d7153f6a059bbd5540a1f149039c62129f43afd32a0c80fd3f5203a79dd7525f');
  assert.equal(g.SERPENTE_ART.sourceSha256,source.sha256);assert.equal(Object.keys(g.SERPENTE_ART.frames).length,11);
  assert.equal(JSON.stringify(g.SERPENTE_ART),JSON.stringify(importer.build()));
  for(const [frame,id]of Object.entries(g.SERPENTE_POSES)){
    const c=g.monSprite('serpente',1,+frame),r=importer.manifest.frames[id],rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    assert.equal(c.sourceId,id);assert.ok(c.width<=176&&c.height<=182);let count=0;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const at=(y*c.width+x)*4;if(!rgba[at+3])continue;count++;
      const orig=((r[1]+y)*source.width+r[0]+x)*4;
      assert.equal(Buffer.compare(Buffer.from(rgba.subarray(at,at+3)),source.data.subarray(orig,orig+3)),0,id+' mantém RGB');
    }
    assert.ok(count>1000,id+' tem o corpo completo');assert.equal(rgba[3],0,'sem retângulo verde da prancha');
  }
  const c=g.monSprite('serpente',1,30),rgba=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  assert.equal(rgba[(54*c.width+4)*4+3],0,'a legenda à esquerda não é importada');
  assert.equal(rgba[(56*c.width+89)*4+3],0,'o vão interno do pescoço também fica transparente');
});

test('quadros da Serpente acompanham os dois ataques e a boca acompanha o espelhamento',()=>{
  const {game:g}=boot(),e=snakeBoss(g);
  const pose=(act)=>g.monSprite('serpente',1,g.serpentFrame({...e,t:0,act})).sourceId;
  assert.equal(pose(null),'move0');
  assert.equal(pose({k:'snakebite',phase:'windup',t:.1,dur:.75}),'biteWarn');
  assert.equal(pose({k:'snakebite',phase:'windup',t:.6,dur:.75}),'biteReady');
  assert.equal(pose({k:'snakebite',phase:'dash'}),'bite');
  assert.equal(pose({k:'snakebite',phase:'recover'}),'biteReady');
  assert.equal(pose({k:'snaketail',phase:'windup'}),'tailReady');
  assert.equal(pose({k:'snaketail',phase:'sweep'}),'tailSweep');
  assert.equal(pose({k:'snaketail',phase:'recover'}),'tailRecover');
  const c=g.monSprite('serpente',1,11);assert.equal(c.facing,-1);
  e.x=200;e.y=80;e.face=1;const right=g.snakeMouth(e);e.face=-1;const left=g.snakeMouth(e);
  assert.ok(right.x>e.x&&left.x<e.x);assert.ok(Math.abs((right.x-e.x)-(e.x-left.x))<1e-9);assert.equal(right.y,left.y);
  const box=g.spriteLayout(c,'serpente',e.sc);
  assert.equal(right.y,e.y+box.top+c.mouth.y*box.scale,'origem do bote é a boca desenhada');
  g.updEnemies(.01);assert.equal(e.tele.x,g.snakeMouth(e).x);assert.equal(e.tele.y,g.snakeMouth(e).y);
});
