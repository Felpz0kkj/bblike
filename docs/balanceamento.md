# Balanceamento — beta 0.8.1

Calibração inicial de alcance, dano e recuperação. Os testes verificam as regras; a equivalência entre personagens ainda depende de partidas e combinações de melhorias. Distâncias em unidades do mundo, antes do zoom. Colisões também consideram o tamanho do alvo. Área não aumenta o trajeto das flechas/orbes nem os saltos do raio.

| Personagem | Vida base | Ataque normal, antes de arredondar | Alcance nominal | Intervalo | Recarga especial |
| --- | --- | --- | --- | --- | --- |
| Salamandra | 85 | 8, com queimadura | Arco 112, cresce com área | 0,48 s | 24 s |
| Capricorn | 85 | 8 → 4 → 2 | Primeiro alvo 320; saltos 120 | 0,80 s | 18 s |
| Sakura | 85 | 8,05 → 6,44 → 5,152 | Flecha 360 | 0,70 s | 20 s |
| Frood | 100 | 9,45 × multiplicador do peixe | Centro da poça até 330 + raio | 1,05 s | 12 s |
| Granito | 135 | Garras: 10 no total em dois acertos, já arredondado; Pedrada: 9,9 + atordoamento | Garras 112; Pedrada até 320 + raio 64 | 1,20 s nos dois modos | 12 s |
| Sombrinha | 80 | Dois orbes de 4,5 | Percurso de cada orbe 480 | 0,80 s | 8 s |

Sem crítico, evoluções, aliados ou melhorias. Os danos básicos de atributo passam de 13/12/12/13/20/11 para **8/7/7/8/9/6** (Salamandra/Frood/Sakura/Capricorn/Granito/Sombrinha). A melhoria do ataque principal concede +15% por nível, em vez de +25%; o bônus de cadência de 5% foi mantido. Críticos, peixes mais fortes e melhorias ainda podem eliminar inimigos frágeis em um ataque, mas os ataques comuns iniciais precisam de mais acertos nos cenários de regressão.

Área concede até +50% por melhorias, somando o bônus natural de Frood (+10%); Tempestade tem limite próprio de +25%. Alcances, controles e esquiva defensiva foram mantidos.

## Aliados e cura — revisão de balanceamento

O personagem em uso não pode ser seu próprio aliado. A regra vale para cartas de nível/baú, aplicação da carta, Equipe e aliados iniciais salvos. Preferências antigas são deduplicadas e filtradas antes de ocupar vagas; coleção e desbloqueios são preservados. Aliados iguais ao herói também não executam ataques ou curas se um estado inválido chegar à atualização.

Dano de aliados não ativa drenagem do jogador. A origem do dano acompanha golpes, correntes, projéteis, arremessos e poças. Isso corrige a multiplicação de cura de Sakura/Sombrinha conforme mais aliados acertavam.

Aliados usam base 6 (antes 12), crescendo +25% por nível (antes +35%). Salamandra aliada passa a atacar a cada 0,65 s (antes 0,4); Sakura, 1,4 s (antes 1,15). Multiplicadores revistos: peixes 1,35; flechas 1,1; pedras 1,6; orbes 0,9. Mantidos quantidades, alcances e funções de cada aliado.

Sakura aliada cura somente quando há um alvo em alcance e a vida do jogador está abaixo de 80%. A cura tem recarga própria de **10 s**, sem redução por melhorias de cadência; não fica sorteando novas tentativas a cada quadro. A flecha recupera `1,5% + 0,3% × (nível do aliado − 1)` da vida máxima: 1,5% no nível 1 até 2,7% no 5, antes 5%–9%. Não há cura passiva fora de combate.

Drenagem própria: Sakura 1% do dano (antes 4%), Sombrinha 2% (antes 4%). A cura considera apenas dano efetivamente retirado do alvo. Há uma reserva máxima de 1% da vida máxima, reposta à razão de 1% por segundo, sem acumular reservas maiores; vários alvos/disparos compartilham esse orçamento.

## Três mundos e ciclos — beta 0.8.1

Ordem fixa: **Floresta Sombria / Colosso da Casca → portal → Bioma Dracônico / Cratos → portal → Pântano de Frood / Serpente Branca → portal → floresta**. A primeira área permanece a floresta, conforme confirmação do autor. `visit` começa em zero e aumenta em cada portal, sem reiniciar o nível ou a evolução do personagem. Cada chefe surge aos **240 segundos de combate da etapa**, independentemente do nível/XP. Antes, o gatilho era ganhar dez níveis e não havia tempo fixo. Pausas e escolhas suspendem o cronômetro; derrota o congela. A abertura do portal impede um segundo chefe na área vencida; somente entrar no portal reinicia `worldTime` em zero.

Portal precisa de contato e 0,8 s de abertura. Não concede vida, XP ou melhorias; mantém recargas e aliados. Os perigos/projéteis são descartados, mas baús e cristais continuam acessíveis. Durante os chefes, a horda comum dá lugar a reforços limitados; depois da vitória, não surgem novos inimigos até a passagem.

| Criatura | Aviso | Ataque e limite | Recuperação / recarga |
| --- | --- | --- | --- |
| Esporo, sempre em trio | 0,65 s | Nuvem de raio 48, duração 0,85 s; podridão 2 s | 0,30 s / 3 s |
| Besouro de Casca | 0,65 s em faixa | Investida até 150, velocidade 390 | 0,65 s vulnerável (+25% de dano recebido) / 2,4 s |
| Aranha Sombria | 0,70 s | Espinho de velocidade 200, duração 2,8 s, mira fixa | 0,25 s / 2,7 s |
| Catador de Ossos | 0,45 s | Porrete em círculo de raio 28 | 0,22 s / 1,25 s |
| Asabrasa | 0,60 s na garganta | Brasa de velocidade 210, duração 2,6 s, mira fixa | 0,20 s / 2,4 s |
| Lagarto de Cinza | 0,32 s | Bote até 96, velocidade 480, seguido de mordida | 0,28 s / 2 s |
| Estufado da Podridão | 1,05 s | Explosão de raio 72, podridão 2 s; nuvem 0,4 s | Morre na explosão |
| Colosso da Casca | 1 s | Raiz de raio 90 (105 abaixo de 33% de vida), alvo fixado na preparação | Recupera até 1,85 s desde o início; espera 1,65 s pelo próximo golpe |
| Bocarra do Brejo | 0,32 s (tamanho 3), 0,26 s (menores) | Mordida de raio 28, sem dano de contato | 0,22 s / 0,85 s |
| Mosquito do Brejo | 0,28 s em faixa | Probóscide em investida até 175, velocidade 640; sangramento eventual | 0,22 s / 1,05 s |
| Caranguejo de Lodo | 0,60 s | Pinçada de raio 34, centro 35 à frente | 0,70 s vulnerável (+25%) / 1,8 s |
| Serpente Branca · bote | 0,75 s em faixa | Mordida com avanço até 260, velocidade 630, largura sinalizada 56 | 0,40 s; espera 1,15 s (0,8 s abaixo de 50% de vida) |
| Serpente Branca · cauda | 0,95 s | Varredura de raio 215, um acerto por ataque | Ataque 0,25 s + recuperação 0,45 s; mesma espera do bote |

Vida dos chefes: `base × (1 + 0,20 × visit) × dificuldade`. Colosso: base 2.200; dragão: base 2.400; Serpente: base **3.800**, antes 2.500. Sequência no Normal: **2.200 → 2.880 → 5.320 → 3.520 → 4.320 → 7.600**, continuando gradualmente. Colosso e Cratos mantêm vida base e padrões. A Serpente passa de 64 para 88 de velocidade e de 0,9 para 1,35 no fator de dano; começa a perseguir acima de 190 de distância. Alterna bote e cauda com mira fixada, sem dano de contato. O dano dos chefes continua usando o nível real do jogador, a dificuldade e a passagem; o novo cronômetro não força um nível artificial.

Vida comum: `12 × fator da espécie × 1,18 × 1,12 × hpMul(ameaça) × dificuldade × (1 + 0,12 × visit)`, com `ameaça = min(nível, 10) + max(0, nível − 10) × 0,25`. Dano comum: `6 × fator da espécie × 1,12 × 1,08 × (1 + 0,025 × ameaça) × dificuldade × (1 + 0,07 × visit)`. Os fatores 1,12 e 1,08 mantêm o aumento de 12% de vida e 8% de dano introduzido na beta 0.8.0, sem aplicá-los aos chefes. Catador inicial no Normal: aproximadamente 17,5 de vida e 5,95 de dano antes da armadura. Elites comuns têm 4× vida e escala visual 1,2; Esporos e Bocarras nunca viram elites isoladas.

Cadência: `min(7, 1,5 + 0,16 × nível local) × (1 + min(0,8, 0,12 × visit)) × (1 + min(0,3, tempo local / 300))`. Nível local: `max(1, nível − nível de entrada + 1, 1 + floor(min(240, tempo local) / 30))`; assim os elencos se liberam mesmo com menos XP. Contagem máxima: `min(160, 80 + 4 × nível local + 8 × visit)`, também aplicada aos anéis de horda. Um trio consome três vagas e três unidades de orçamento. Bocarras reservam 4/2/1 vagas nos tamanhos 3/2/1: dividir mantém o custo total e garante descendentes sem ultrapassar o limite. O surgimento de uma Bocarra tamanho 3 consome quatro unidades; o tipo sorteado aguarda orçamento suficiente, evitando que outro sorteio a substitua a cada quadro. Pesos no pântano: Bocarra 10, Mosquito 4, Caranguejo 3, aproximadamente 59% de Bocarras entre grupos sorteados. Mantidas as regras de escala por passagem.

Durante o chefe: 20% da cadência normal, limitada a 0,8 inimigo/s e **oito vagas de reforços simultâneos**, contando no limite global. Cada escolha tem 80% de chance de priorizar **Aranha Sombria**, **Asabrasa** ou **Mosquito do Brejo**, conforme o mundo; o restante usa o elenco local quando cabe nas vagas e no orçamento. O Mosquito ataca com a probóscide, sem inventar um ataque à distância para ele. Reforços são comuns, sem elites, com aviso de surgimento de 0,8 s e posição normal fora do campo visível. Não surgem durante a entrada do chefe (1,4 s), e anéis de horda continuam suspensos. O orçamento não acumula uma rajada quando o teto está cheio. Vitória remove reforços e projéteis/perigos hostis, zera os orçamentos e abre o portal normalmente.


XP: `ceil((6 + 5 × nível + floor(nível² × 0,25)) × (1,25 + min(0,15, 0,004 × nível)))`. Requisitos preservados: **14 no nível 1, 105 no 10 e 522 no 30**, sempre maiores que os anteriores. O fator dos drops passa de 0,8 para **0,65**, redução adicional de **18,75%**. Valores: Esporo 0,3575; Besouro 1,105; Aranha 1,365; Catador 0,5525; Lagarto/Estufado 1,105; Asabrasa 1,6575. Bocarra: 0,3575 / 0,2275 / 0,13 por morte nos tamanhos 3/2/1, total **1,3325** por família; Mosquito 1,105; Caranguejo 1,6575. Chefes deixam **seis cristais de 10,4**, total **62,4**, antes 12 cristais totalizando 76,8. Melhorias de XP continuam multiplicando a coleta.

Outros drops: cura de 2,8% para **1,2%** dos abates, ímã de 1,2% para **0,6%**, baú de elite de 100% para **35%**. O cristal da elite mantém o valor de 5× seu XP. O baú grande de chefe continua garantido; não há redução no número de escolhas concedidas por ele.

Árvores, raízes e cenário não criam colisores. As copas da floresta perdem opacidade ao encobrir jogador, inimigos, projéteis, perigos, coletas ou portal. O cenário inicial/menu continua sendo a floresta. O pântano tem trilhas de lama, poças com margens irregulares, juncos, plantas aquáticas, raízes, troncos baixos e poucos tocos, sob o combate. O fundo da transição acompanha o destino. A paleta usa verdes oliva e água musgosa; a camada de escurecimento por nível fica limitada a 16% somente no pântano, mantendo inimigos/ataques legíveis.

Bocarra começa sempre no tamanho 3. Vida relativa por tamanho 3/2/1: 100% / 55% / 28%; velocidade relativa: 100% / 120% / 142%; dano: 100% / 80% / 65%. A morte tem guarda contra repetição e gera exatamente dois filhos quando o tamanho é maior que 1, com proteção de surgimento de 0,35 s. Mortes silenciosas ao iniciar/encerrar chefe ou trocar mapa não dividem nem concedem XP.

Mosquito: velocidade base **195**, antes 126; fator de vida **1,05**, antes 0,7, e de dano **1,05**, antes 0,85. Inicia a preparação a até 240 de distância. Sangramento: **35%**, antes 20%, de chance em uma picada efetiva; 2 de dano base por segundo durante 2 s, antes da armadura. Aplicações ativas não acumulam nem renovam a duração. Usa o mesmo processamento de dano periódico da podridão e o fluxo comum de morte/renascimento; efeitos são removidos ao reviver e vencer o chefe. Esquiva ou invulnerabilidade impede nova aplicação.

Casco do Caranguejo: reduz 40% do dano vindo do cone frontal de 120°; lados e costas recebem dano normal. Durante os 0,7 s de recuperação da pinçada, não há redução frontal e todo dano é multiplicado por 1,25. Origem de flechas, correntes, golpes aliados, pedras e poças chega ao sistema de dano compartilhado.

## Capricorn

Corrente: três alvos distintos, dano 100% / 50% / 25%, primeiro alcance 320 e saltos até 120. Disparo Extra aumenta potência em 10% por nível, sem multiplicar alvos. Mantidos 15% de chance de paralisia de 0,25 s. Novo dano base 8 e intervalo 0,8 s: DPS direto 10 em alvo único, antes de crítico.

Tempestade: carga de 1,1 s, movimento a 60%, pulsos em 0,3 / 0,6 / 0,9 s com 0,15 × dano cada (antes 0,18), descarga 1,5 × (antes 1,8). Bônus de grupo até 30%; raio 260 até 325; paralisia final de 1 s; recarga 18 s. Total teórico máximo 2,535 × dano, antes de arredondar. Preservados limites e ausência de invulnerabilidade durante a carga.

## Sakura

Vida 105 → 85; dano base 12 → 7; intervalo 0,55 → 0,7 s; multiplicador da flecha 1,35 → 1,15. Mantidos percurso 360, três acertos e queda de 20% por passagem. Sem regeneração natural (antes 0,3/s); drenagem própria de 1%, limitada pela reserva comum e sem ativação por aliados.

Flor: dano 2 × → 1,4 ×, raiz 1,4 → 0,8 s, recarga 14 → 20 s. Não cura ao errar. Ao acertar, recupera `2% + 0,5% × min(6, alvos)` da vida máxima: 2,5%–5%, antes 6%–16% inclusive sem alvos. Drenagem do dano próprio do especial ainda respeita a reserva de cura. Raio 230 preservado.

## Demais personagens

- **Salamandra:** vida 90 → 85; dano 13 → 8; intervalo 0,4 → 0,48 s. Queimadura por segundo passa de 25% para 12% do dano do golpe, com duração de 3 s. Fúria preserva 6 s, dano por golpe ×0,8 e dash a cada três golpes; intervalo passa a ×0,7 (antes ×0,6). Dois golpes normais alternados, sem avanço.
- **Frood:** vida 110 → 100; dano 12 → 7; intervalo 0,85 → 1,05 s; multiplicador dos peixes 2,3 → 1,35. Regeneração 1 → 0,35/s. Onda e funções dos peixes preservadas, com menor dano devido ao novo atributo base.
- **Granito:** preservados vida 135, dano 9, velocidade 172, intervalo 1,2 s, multiplicador da Pedrada 1,1, Carapaça de 18% e recarga especial 12 s. Nome/design substituem Pedrino sob o mesmo ID `pedra`; desbloqueio custa 150 e não é reiniciado.
- **Sombrinha:** vida 90 → 80; dano 11 → 6; intervalo 0,65 → 0,8 s; crítico natural 15% → 10%; drenagem 4% → 2%, só pelo próprio dano e com reserva. Mantidos dois orbes, homing, percurso 480 e teleporte sem dano duplo ao mesmo alvo.

Redução de recarga por abate e melhorias permanentes continuam com os mesmos valores. Velocidades de movimento e ações dos personagens foram preservadas.

## Granito: garras, Pedrada, Terremoto e salvamentos

O botão principal decide pela distância do ponto mirado: até 112 × área usa dois golpes de garras, além disso usa Pedrada até 320. Os dois modos compartilham cadência e um único orçamento de dano de `ataque × 1,1`; as garras dividem o total arredondado entre dois acertos, aos 0,20/0,32 s, sem gerar pedra adicional. Disparo Extra amplia o arco das garras ou o número de pedras, conforme o modo. Não há dash nos golpes.

Pedrada prepara por 0,26 s e voa por 0,29 s, mantendo o impacto total de 0,55 s da versão anterior, raio 64 × área e atordoamento de 0,4 s. Ao lançar, a origem acompanha a posição real e o destino é limitado novamente a 320; mover/esquivar na preparação não estende o alcance. Granito aliado usa a mesma sequência visual, preservando seu impacto total em 0,6 s, dano próprio e origem aliada.

Terremoto usa o sistema de preparação existente: 0,28 s, raio 260 × área, dano ×2,6, atordoamento de 1,4 s e empurrão de 360 nos inimigos comuns. A preparação não reduz a velocidade de Granito; os controles de especial/esquiva permanecem os atuais. O efeito de terra é curto e pixelado. Dano, armadura, colisão, morte e renascimento continuam nos sistemas compartilhados.

Arte em quadros individuais de 64×64 com paleta limitada, capa vinho rasgada, placas de areia/pedra, duas pernas, focinho e garras longas. O jogo escolhe poses de repouso, passos, corrida na esquiva, garras, Pedrada, Terremoto, dano e queda. A morte tem corpo tombado próprio. A prancha em `tests/granito.html` reúne 36 quadros e não é usada como sprite da partida. Colosso e Serpente usam novos quadros de 96×96, com textura de casca/raízes e escamas claras/olhos vermelhos.

Ventinho deixa de existir em dados de ajudantes, cartas, equipe, invocação e pulso próprio. O carregamento remove os IDs antigos `normal`/`ventinho`/`ventania` da escolha inicial, coleção e desbloqueios; um personagem inválido recebe a opção válida padrão. Saves v3 e legados v2 preservam campos compatíveis de essência, coleção válida, personagens, melhorias, conquistas, estatísticas e recordes. A remoção não mexe nos controles, na dificuldade Normal ou nos efeitos de outros personagens.

## Validação

108 testes cobrem consistência de versão, migração atual/legada, remoção do ajudante, desbloqueio/atributos de Granito, garras, Pedrada, Terremoto, morte, animações e origem aliada; chefes aos 240 s, pausa/escolhas, reinício pelo portal, drops, frequência de Bocarras, Mosquitos e Serpente. Incluem as regressões anteriores dos três mundos, colisões, dano periódico, heróis e salvamentos. `tests/combat.html` oferece 31 quadros do código real sem mudar o progresso principal. No Edge, um ciclo simulado de 4 minutos por mapa confirmou Colosso/Cratos/Serpente aos 240 s, portais e Bocarras nos três tamanhos, sem ultrapassar a população reservada. Não há telemetria de partidas reais suficiente para declarar equilíbrio definitivo.


## Histórico: integração da versão 9 na beta 0.6.4

Os números dos seis personagens da beta 0.6.3 foram preservados. A nova esquiva é uma ação defensiva independente: duração 0,18 s, velocidade 1.100 (198 de deslocamento durante o dash, mais inércia posterior), invulnerabilidade 0,24 s e recarga 2,4 s. Não causa dano, não pode começar em pausa ou durante a carga de Capricorn e não acrescenta dash aos golpes normais de Salamandra. O avanço de cada quadro é limitado ao tempo restante, evitando que quadros longos alonguem a esquiva.

A versão 9 elevava todos os chefes de 1.200 para 10.000 de vida inicial. A beta 0.6.4 usa `2400 × (nível/10)^1,3 × (1 + 0,15 × volta)` antes da dificuldade: Cratos no nível 10 tem 1.920 / 2.400 / 3.120 de vida em Calma / Normal / Feroz. O dano de contato mantém a base anterior (14, em vez de 17 da ramificação), com os multiplicadores existentes. A calibração de vida não substitui testes de partidas reais.

Chefes entram nas fases 2 e 3 abaixo de 66% e 33% de vida. Mantidos ataques/avisos da versão 9, com pausas maiores: chefes genéricos usam intervalo 2,7 / 2,1 / 1,6 s, Cratos recupera por 1,7 / 1,4 / 1,1 s depois de cada sequência. Cratos pode morder duas vezes (três na fase 3), varrer a cauda num raio de 285 (duas varreduras a partir da fase 2) e soprar em cone de raio 430. O sopro é anunciado por 0,7 s; a cauda, por 0,95 s na primeira varredura.

O sopro aplica até 5 s de podridão, renovados enquanto o jogador permanecer exposto. Uma nova aplicação é evitada durante invulnerabilidade; a podridão já adquirida causa 5 de dano base a cada segundo, mitigado pela armadura, mesmo durante invulnerabilidade posterior. Usa o fluxo de dano/morte/segunda chance, sem curas ou coletas depois de um efeito fatal. Reviver ou derrotar o chefe remove a podridão.

A horda normal e os anéis de cinco níveis ficam suspensos durante encontros. A entrada remove inimigos comuns sem recompensas, mas mantém itens já existentes no chão. Marcos de chefes alcançados durante um encontro entram numa fila, sem substituir o chefe ativo. A animação de derrota não soma tempo nem recompensas à jornada.
