const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Executa o jogo real, sem rede ou dependências. O canvas registra a arte raster.
function boot(saved){
  const nodes=new Map(),events={},store=new Map();
  if(saved)store.set('nevoa-selvagem-v3',JSON.stringify(saved));
  function element(name){
    const attrs={},classes=new Set(),ops=[];
    const context=new Proxy({ops,fillRect(...a){ops.push([this.fillStyle,...a]);},
      getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)};},
      drawImage(img,...a){ops.push(['image',img.width,...a]);},
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
    performance:{now:()=>1000},console,requestAnimationFrame(){},setTimeout(){},setInterval(){},clearInterval(){},
    matchMedia:win.matchMedia};
  vm.runInNewContext(script,sandbox,{filename:'index.html'});
  return {game:win.__NS,node,events,store};
}
const button=i=>({dataset:{i}});
function begin(game,type='planta',diff='normal'){
  game.ACT.play();game.ACT.difficulty(button(diff));game.ACT.begin(button(type));
}

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
  g.run.pl.hp=10;g.useSpecial();assert.ok(g.run.pl.hp>10);g.updHud();
  assert.ok(parseFloat(node('#hp-i').style.width)>8);
  g.run.pl.hp=-5;g.updHud();assert.equal(node('#hp-i').style.width,'0%');
  assert.equal(node('#hp-t').textContent,'0 / 105');
  begin(g);g.updHud();assert.equal(node('#hp-i').style.width,'100%');
});

test('as criaturas jogáveis preservadas têm arte própria, animações e evoluções',()=>{
  const {game:g}=boot();const all=[];
  for(const type of ['pedra','sombra']){
    const frames=[];
    for(let stage=1;stage<=3;stage++)for(let frame=0;frame<4;frame++){
      const c=g.monSprite(type,stage,frame);assert.equal(c.width,32);assert.equal(c.fy,30);
      assert.ok(c.getContext('2d').ops.length>100);frames.push(c.toDataURL());
      assert.equal(g.monSprite(type,stage,frame),c);
    }
    assert.notEqual(frames[0],frames[1]);assert.notEqual(frames[0],frames[4]);assert.notEqual(frames[4],frames[8]);
    all.push(frames[0]);
  }
  assert.equal(new Set(all).size,2);
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
  const {game:g}=boot();begin(g);assert.equal(g.VERSION,'0.7.0-beta');
  assert.equal(g.lootSprite('xp'),g.lootSprite('xp'));assert.notEqual(g.lootSprite('xp').toDataURL(),g.lootSprite('heal').toDataURL());
  for(let i=0;i<500;i++)g.dropGem(0,0,1);assert.equal(g.gems.reduce((n,x)=>n+x.v,0),500);assert.ok(g.gems.length<=380);
  g.updPick(.016);assert.equal(g.run.xp,500);assert.equal(g.gems.length,0);
  g.run.pl.hp=50;g.picks.push({k:'heal',x:0,y:0,t:0});g.updPick(.016);assert.equal(g.run.pl.hp,65.75);
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
  const {game:g}=boot();begin(g);g.run.pl.hp=20;g.basicAttack(0,100,0);
  assert.equal(g.pbul[0].pierce,2);assert.equal(g.pbul[0].vx,760);
  const e=g.mkEnemy('catador',1,40,0,{});e.spawn=0;e.hp=100;g.enemies.push(e);
  g.update(.04);assert.ok(g.run.pl.hp>20.1);
  g.useSpecial();assert.ok(g.run.pl.hp>26);assert.equal(g.CH.planta.basic,'Flecha de Sakura');
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
  begin(g,'eletrico');assert.equal(g.run.allies[0].type,'eletrico');assert.equal(g.run.ch,'eletrico');
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
  assert.equal(fine[0],303);assert.equal(storm(40,[1.1])[0],fine[0]);
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
  assert.equal(first.hp,0);assert.equal(1000-second.hp,22);assert.equal(1000-third.hp,17);assert.equal(fourth.hp,1000);
  assert.equal(g.pbul.length,0);
});

test('drenagem cura apenas o dano efetivo, sem cura depois da morte',()=>{
  const {game:g}=boot();begin(g);g.run.pl.hp=20;g.run.st.crit=0;
  g.hitEnemy(target(g,100,0,1),1000,{canCrit:false});assert.ok(Math.abs(g.run.pl.hp-20.04)<1e-9);
  const e=target(g,100);g.run.over=true;g.run.pl.hp=0;g.hitEnemy(e,1000);
  assert.equal(g.run.pl.hp,0);assert.equal(e.hp,1000);
});

test('arremessos extras respeitam a distância máxima do ponto de impacto',()=>{
  const {game:g}=boot();
  for(const [type,range] of [['agua',330],['pedra',320]]){
    g.P.chars[type]=1;begin(g,type);g.run.st.multi=4;
    for(const angle of [0,1,2,3])g.basicAttack(angle,3000,3000);
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
  const e=target(g,40);g.useSpecial();assert.equal(1000-e.hp,24);assert.equal(g.run.sp,8);
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
  const {game:g}=boot();begin(g,'fogo');target(g,100);g.run.lv=10;g.spawnBoss();
  assert.equal(g.enemies.length,1);const boss=g.enemies[0];assert.equal(boss.boss.id,'colosso');assert.equal(boss.maxhp,2200);
  g.spawnTick(10);assert.equal(g.enemies.length,1);assert.equal(g.spawnBoss(20),false);
  boss.spawn=0;g.hitEnemy(boss,100000,{canCrit:false});assert.equal(g.run.world,'forest');assert.equal(g.run.worldCleared,true);
  assert.equal(g.run.portal.to,'dragon');g.spawnTick(100);g.spawnBoss(30);assert.equal(g.enemies.length,0);
  g.updPortal(2);assert.equal(g.run.world,'forest');assert.equal(g.enterPortal(),false);
  g.run.pl.x=g.run.portal.x;g.run.pl.y=g.run.portal.y;g.updPortal(.01);
  assert.equal(g.run.world,'dragon');assert.equal(g.run.visit,1);assert.equal(g.run.nextBoss,20);assert.equal(g.run.portal,null);
  g.run.lv=20;g.spawnBoss();assert.equal(g.enemies[0].boss.id,'cratos');assert.equal(g.enemies[0].maxhp,2880);
});

test('dificuldade do encontro fica fixa e escala vida do chefe pela jornada',()=>{
  const {game:g}=boot();begin(g,'fogo','calma');g.run.lv=10;g.S.diff='feroz';g.spawnBoss();
  assert.equal(g.enemies[0].maxhp,1760);begin(g,'fogo','feroz');g.run.lv=10;g.spawnBoss();assert.equal(g.enemies[0].maxhp,2860);
});

test('Cratos executa ataques das três fases com avisos e sem valores inválidos',()=>{
  const {game:g}=boot();begin(g,'fogo');g.run.world='dragon';g.run.lv=10;g.spawnBoss();const e=g.enemies[0];e.spawn=0;e.x=230;e.y=0;
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
  const {game:g}=boot();begin(g,'fogo');g.run.world='dragon';g.run.lv=10;g.spawnBoss();const e=g.enemies[0];e.spawn=0;e.x=0;e.y=0;e.cf=1;
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
  for(const world of ['forest','dragon']){
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
    g.spawnBoss(10);assert.equal(g.enemies.length,1);assert.equal(g.enemies[0].boss.id,'cratos');
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
function defeatWorld(g){g.run.lv=g.run.nextBoss;g.run.need=g.xpNeed(g.run.lv);g.spawnBoss();const e=g.enemies.find(e=>e.boss);e.spawn=0;g.hitEnemy(e,100000000,{canCrit:false});return e;}

test('o ciclo usa apenas dois mundos e dois chefes por oito passagens',()=>{
  const {game:g}=boot();begin(g,'fogo');assert.deepEqual(Object.keys(g.WORLDS),['forest','dragon']);
  for(let visit=0;visit<8;visit++){
    assert.equal(g.run.visit,visit);const world=visit%2?'dragon':'forest';assert.equal(g.run.world,world);
    const boss=defeatWorld(g);assert.equal(boss.boss.id,world==='forest'?'colosso':'cratos');
    assert.equal(g.run.world,world);assert.equal(g.run.worldCleared,true);assert.equal(g.run.portal.to,world==='forest'?'dragon':'forest');
    const kills=g.run.bossKills;g.spawnBoss(g.run.lv+30);assert.equal(g.enemies.length,0);assert.equal(g.run.bossKills,kills);
    crossPortal(g);assert.equal(g.run.portal,null);assert.equal(g.run.worldCleared,false);
  }
  assert.equal(g.run.world,'forest');assert.equal(g.run.bossKills,8);
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
  for(const world of ['forest','dragon']){g.run.world=world;g.run.lv=100;g.run.visit=30;g.enemies.length=0;g.spawnRing(1000);assert.ok(g.enemies.length<=160);assert.equal(g.enemyCap(),160);for(let i=0;i<100;i++)g.spawnTick(.1);assert.ok(g.enemies.length<=160);}
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
  const {game:g}=boot();begin(g,'fogo');g.run.lv=10;g.spawnBoss();const e=g.enemies[0];e.spawn=0;e.x=220;e.y=0;e.pt=0;
  const hp=g.run.pl.hp;g.updEnemies(.01);assert.equal(e.act.k,'root');assert.equal(e.tele.r,90);enemySteps(g,18);assert.equal(g.run.pl.hp,hp);
  g.run.pl.x=-180;enemySteps(g,3);assert.equal(g.run.pl.hp,hp);assert.equal(e.act.hit,true);assert.ok(g.fx.some(f=>f.k==='roots'));
  enemySteps(g,17);assert.equal(e.act,null);assert.ok(e.pt>1.5);
  g.run.pl.x=0;g.run.pl.inv=0;e.pt=0;g.updEnemies(.01);enemySteps(g,21);assert.ok(g.run.pl.hp<hp);
});

test('crescimento moderado por passagem não acelera ataques nem remove limites',()=>{
  const {game:g}=boot();begin(g,'fogo');const first=g.mkEnemy('catador',1,100,0,{}),pressure=g.worldPressure();
  g.run.visit=1;const second=g.mkEnemy('catador',1,100,0,{});assert.ok(Math.abs(second.maxhp/first.maxhp-1.12)<1e-10);assert.ok(Math.abs(second.dmg/first.dmg-1.07)<1e-10);
  assert.ok(g.worldPressure()>pressure);g.run.visit=100;assert.ok(g.worldPressure()<=1.8);assert.ok(g.enemyCap()<=160);
  begin(g,'fogo');const forestHp=defeatWorld(g).maxhp;crossPortal(g);defeatWorld(g);crossPortal(g);const forestAgain=defeatWorld(g);assert.ok(Math.abs(forestAgain.maxhp/forestHp-1.4)<1e-10);
});

test('XP evolui mais devagar: requisitos maiores e drops dracônicos reduzidos',()=>{
  const {game:g}=boot();begin(g,'fogo');let previous=0;
  for(let l=1;l<=150;l++){const old=6+l*5+Math.floor(l*l*.25),now=g.xpNeed(l);assert.ok(now>old);assert.ok(now>previous);previous=now;}
  assert.equal(g.run.need,14);const e=dragonFoe(g,'catador',100);g.hitEnemy(e,100000,{canCrit:false});assert.equal(g.gems[0].v,.85);
  assert.equal(g.CH.fogo.hp,90);assert.equal(g.CH.fogo.dmg,13);assert.equal(g.CH.fogo.spd,225);
});

test('sprites da floresta têm movimento, preparação, golpe e recuperação distintos',()=>{
  const {game:g}=boot();const all=[];
  for(const type of ['esporo','besouro','aranha','colosso']){
    const frames=[0,1,10,11,12].map(frame=>g.monSprite(type,1,frame).toDataURL());
    assert.notEqual(frames[0],frames[1]);assert.notEqual(frames[0],frames[2]);assert.ok(new Set(frames).size>=3);all.push(frames[0]);
    const c=g.monSprite(type,1,0);assert.equal(c.width,type==='colosso'?72:40);assert.equal(c,g.monSprite(type,1,0));
  }
  assert.equal(new Set(all).size,4);
});
