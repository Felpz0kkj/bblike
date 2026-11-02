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
    console,requestAnimationFrame(){},setTimeout(){},setInterval(){},clearInterval(){},
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
  const a=g.mkEnemy('normal',1,100,100,{});g.S.diff='feroz';
  const b=g.mkEnemy('normal',1,100,100,{});assert.equal(a.maxhp,b.maxhp);assert.equal(a.dmg,b.dmg);
  begin(g,'fogo','feroz');const c=g.mkEnemy('normal',1,100,100,{});
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

test('as criaturas preservadas têm arte própria, animações, evoluções e inimigos distintos',()=>{
  const {game:g}=boot();const all=[];
  for(const type of ['pedra','sombra']){
    const frames=[];
    for(let stage=1;stage<=3;stage++)for(let frame=0;frame<4;frame++){
      const c=g.monSprite(type,stage,frame);assert.equal(c.width,32);assert.equal(c.fy,30);
      assert.ok(c.getContext('2d').ops.length>100);frames.push(c.toDataURL());
      assert.equal(g.monSprite(type,stage,frame),c);
    }
    assert.notEqual(frames[0],frames[1]);assert.notEqual(frames[0],frames[4]);assert.notEqual(frames[4],frames[8]);
    assert.equal(g.monSprite(type+'_e',1,0).width,28);all.push(frames[0]);
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
  for(let i=0;i<4;i++){const e=g.mkEnemy('normal',1,20+i*10,0,{spawn:0});e.spawn=0;e.hp=1;g.enemies.push(e);}
  g.useSpecial();assert.equal(g.enemies.length,0);assert.equal(g.run.kills,4);
});

test('morte por contato interrompe coletas e cura no mesmo quadro',()=>{
  const {game:g}=boot();begin(g);g.run.pl.hp=1;
  const e=g.mkEnemy('normal',1,0,0,{});e.spawn=0;e.dmg=100;g.enemies.push(e);
  g.dropGem(0,0,100);g.picks.push({k:'heal',x:0,y:0,t:0});g.update(.016);
  assert.equal(g.run.over,true);assert.equal(g.run.pl.hp,0);assert.equal(g.run.xp,0);assert.equal(g.picks.length,1);
});

test('arte de XP e vida é cacheada e preserva o valor das coletas',()=>{
  const {game:g}=boot();begin(g);assert.equal(g.VERSION,'0.6.3-beta');
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
  const e=g.mkEnemy('normal',1,65,0,{});e.spawn=0;e.hp=10000;g.enemies.push(e);
  g.basicAttack(0,100,0);const normalHit=10000-e.hp,normalCd=g.run.cd;
  const before=e.hp;g.useSpecial();assert.equal(e.hp,before);
  g.basicAttack(0,100,0);const furyHit=before-e.hp,furyCd=g.run.cd;
  assert.ok(furyHit<normalHit);assert.ok(furyHit/furyCd>normalHit/normalCd);
});

test('Sakura dispara flechas perfurantes e drena vida ao acertar',()=>{
  const {game:g}=boot();begin(g);g.run.pl.hp=20;g.basicAttack(0,100,0);
  assert.equal(g.pbul[0].pierce,2);assert.equal(g.pbul[0].vx,760);
  const e=g.mkEnemy('normal',1,40,0,{});e.spawn=0;e.hp=100;g.enemies.push(e);
  g.update(.04);assert.ok(g.run.pl.hp>20.1);
  g.useSpecial();assert.ok(g.run.pl.hp>26);assert.equal(g.CH.planta.basic,'Flecha de Sakura');
});

test('Capricorn encadeia em três alvos próximos com dano 100%, 50%, 25%',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.crit=0;g.run.st.dmg=20;g.run.st.multi=5;
  const es=[[100,0],[160,65],[220,80],[280,100],[500,0]].map(([x,y])=>{const e=g.mkEnemy('normal',1,x,y,{});e.spawn=0;e.hp=100;g.enemies.push(e);return e;});
  // Disparos extras aumentam a potência, sem multiplicar os alvos.
  g.run.st.multi=1;g.basicAttack(0,100,0);
  assert.deepEqual(es.map(e=>100-e.hp),[20,10,5,0,0]);
  es.forEach(e=>e.hp=100);g.run.st.multi=5;g.basicAttack(0,100,0);
  assert.equal(es.filter(e=>e.hp<100).length,3);assert.equal(es[0].hp,72);
});

test('cadeia continua após matar o primeiro alvo e respeita distância de salto',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.crit=0;g.run.st.dmg=20;
  const a=g.mkEnemy('normal',1,100,0,{}),b=g.mkEnemy('normal',1,160,70,{}),c=g.mkEnemy('normal',1,340,70,{});
  for(const e of [a,b,c]){e.spawn=0;e.hp=100;g.enemies.push(e);}a.hp=1;
  g.basicAttack(0,100,0);assert.equal(a.hp,0);assert.equal(b.hp,90);assert.equal(c.hp,100);
});

test('Tempestade carrega antes de paralisar por um segundo, incluindo chefes',()=>{
  const {game:g}=boot();g.P.chars.eletrico=1;begin(g,'eletrico');g.run.st.crit=0;
  const a=g.mkEnemy('normal',1,150,0,{}),boss=g.mkEnemy('normal',1,200,0,{}),far=g.mkEnemy('normal',1,500,0,{});
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
  const e=g.mkEnemy('normal',1,x,y,{});e.spawn=0;e.hp=e.maxhp=hp;e.spd=0;g.enemies.push(e);return e;
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
