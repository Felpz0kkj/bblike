# Histórico

## 0.9.2-beta — tempos de etapa, Serpente anterior e efeitos visíveis — 2026-11-06

- Serpente Branca volta aos mesmos sprites, pixels, âncoras e animações da beta 0.9.0; ataques, veneno, hitboxes e balanceamento mantidos. Nenhum PNG foi alterado.
- Primeiro chefe aos 4 minutos; todas as etapas seguintes aos 2min30, inclusive novos ciclos e entradas de teste posteriores à Floresta. HUD, ajuda e desbloqueio temporal do elenco acompanham o prazo da etapa; XP e recargas permanecem no ritmo atual.
- Verme subterrâneo deixa um rastro curto de fissuras e poeira na camada do chão. Corpo oculto no deslocamento, recolhimento visível, sem montículo duplicado ou poeira sobre a criatura. Mesma lógica de combate e colisão.
- Ambientação reforçada: aves maiores/mais frequentes, névoa baixa segmentada, faixas de calor/brasas e rajadas de areia mais legíveis. Efeitos anteriores aos atores e avisos, independentes de FPS, pausáveis e limitados em touch.
- Validação: 175 testes aprovados; partidas nos quatro biomas e conferência de Serpente, Verme, pausa e viewport móvel no Edge, sem erros de execução.

## 0.9.1-beta — seleção de fase, chefes por código e ambientação — 2026-11-06

- Código `betatester` no menu libera Iniciar por fase, com entrada por campo ou teclado. Os quatro mapas usam dificuldade e personagem existentes. Perfil de teste isolado: recompensas, coleção, conquistas e ranking não passam ao save normal; configurações permanecem, e o perfil original é restaurado ao sair/morrer.
- Serpente e Verme recriados em pixel art por funções de desenho e poses próprias no canvas. Os recortes desses chefes e dos efeitos do Verme saíram do HTML; importador obsoleto da Serpente retirado. Preservadas IA, vida, dano, colisões, posições de boca e temporizadores. Referências permanecem apenas como orientação de design.
- Pássaros na Floresta, névoa baixa no Pântano, calor discreto no bioma dracônico e rajadas de areia no Deserto. Camada anterior a atores/avisos, sem efeitos de gameplay, com atualização por dt, pausa e limites menores em touch. Partículas antigas também usam o relógio do jogo.
- Granito e os três inimigos comuns do Deserto mantidos conforme confirmação do autor. Nenhum arquivo de imagem foi modificado. A extensão retangular e a limitação de polígonos do rasterizador preservam os pixels dos demais desenhos.
- 165 testes de isolamento do perfil, navegação, equivalência em 30/60 FPS, pausa, ordenação das camadas, coordenadas de colisão e regressões. A aprovação da arte ocorre em combate real, sem usar contagem de recortes como critério visual.

## 0.9.0-beta — Deserto da Fenda e ciclo de quatro etapas — 2026-11-06

- Deserto adicionado após o Pântano, retornando à Floresta por portal. Mesma progressão por passagem, quatro minutos até o chefe e preservação de vida, XP, aliados, melhorias e recargas.
- Escorpião com ferrão anunciado, empurrão e recuperação vulnerável; Abutre com marca de chão e mergulho único; Hiena com busca física de cristais, mordida/recuo e devolução de XP. Cristais não são reservados contra o jogador, não duplicam valor e respeitam o teto de objetos.
- Verme da Fenda com movimento subterrâneo, fissuras/poeira, emergência, mordida, ruptura linear e gêiser em cone. Ataques fixados no aviso, um acerto por golpe, recuperação vulnerável e mergulho sem dano. A fase subterrânea é ignorada por seleção, colisão de projéteis, dano, queimadura e lentidão; a recuperação aceita dano.
- 57 recortes extraídos da prancha original, sem alterar RGB retidos. Corpo/jato separados, pontos de apoio alinhados e escalas de render/colisão normalizadas. Prancha, PNG original e referência do mapa preservados; assets embutidos no index, mantendo o HTML independente.
- Cenário seco em paleta quente e escura, fissuras irregulares, areia e vegetação esparsa, sem novos obstáculos. Efeitos do chefe usam recortes originais; espigões permanecem voltados para cima em todas as direções.
- Revisão de escala e recortes dos sprites antigos e novos; preservados dados de Granito/Serpente, personagens, outros mapas, drops, saves e controles. Pedrada usa a posição visual do Abutre e ignora o Verme enterrado.
- Validação: 149 testes de regressão, três ciclos completos de quatro mundos, comparação de RGB, 63 cenários de combate e auditoria visual dos sprites. Pranchas em `tests/deserto.html` e `tests/sprites.html`.

## 0.8.4-beta — pressão dos chefes, Pedrada e otimizações — 2026-11-05

- Mordida da Serpente aplica o veneno existente por 3 s apenas ao acertar; Colosso alterna raiz, impacto circular e linha de raízes com avisos e recuperação.
- Golpes comuns um pouco mais ágeis; Esporos têm aviso de 0,55 s e nuvem de raio 72. Pedrada acompanha o alvo durante o preparo e mantém alcance 320 e destino fixo no voo.
- Otimizada a transparência das árvores (uma lista de participantes por quadro em vez de uma por árvore); removidos `DRG` e `rnd`, sem referências. Atributos dos heróis, progressão, sprites aprovados e controles preservados.
- Revisão com três agentes GPT-6 Luna e integração/revisão final do coordenador. Validação: 129 testes, 45 cenários de combate, recortes originais conferidos pelos importadores e uso por mouse/teclado/toque.

## 0.8.3-beta — transparência e escala de Granito; Serpente original — 2026-11-04

- Corrigidos os buracos no torso/membros de Granito: máscaras internas preservam sombras pretas que encostam no fundo entre braços e pernas. RGB original mantido em todos os pixels retidos; espaços externos continuam transparentes.
- Escala de Granito reduzida de 0,23 para 0,16 no jogo (cerca de 30%). A normalização pertence ao asset e vale no menu, no jogador e como aliado. Recorte principal tem escala proporcional própria, evitando a prévia gigante. Passos normais não usam mais a pose de corrida; âncoras dos pés mantidas.
- Serpente procedural substituída por 11 recortes da referência enviada: principal, quatro quadros de movimento, três de bote e três de cauda. Fundo verde, vazios do pescoço e legenda removidos; pixels originais preservados. Espelhamento e origem da mordida acompanham o novo desenho. Vida, dano, alcances, preparações, recargas, colisão do corpo e portal mantidos.
- PNG da Serpente, retângulos, âncoras e importação determinística adicionados; dados embutidos no index para manter o HTML independente. Nova prancha em `tests/serpente.html` e 38 cenários de combate, incluindo caminhada/corrida e execução dos dois ataques da Serpente.
- Mantidos garras, Pedrada, Terremoto e ausência de dash de Granito; atributos, outros personagens, mapas, inimigos, drops, salvamentos e progressão preservados.
- Validação: 120 testes de regressão, comparação de RGB com as duas referências e verificação no navegador de escala, movimento, boca, avisos e ataques.

## 0.8.2-beta — pixels originais de Granito e dois especiais — 2026-11-04

- Substituído o redesenho procedural de Granito pelos pixels da imagem fornecida. Importados 22 recortes de personagem e cinco efeitos, com cores, proporções e detalhes originais. Somente o fundo quase preto conectado às bordas vira transparência; olhos, sulcos e sombras internas são preservados. Mesma arte nas três evoluções, com seus atributos mantidos.
- PNG original preservado em `assets/granito/reference.png`, retângulos/âncoras em `frames.json` e importador determinístico em `scripts/build-granito.cjs`. Os pixels ficam embutidos no index, preservando o HTML independente. Testes comparam todos os recortes com a origem e impedem a inclusão de títulos/linhas da prancha no jogo.
- Ataque básico passa a ser somente garras, inclusive ao mirar longe. Mantidos dois acertos, alcance 112 × área, cadência de 1,2 s e orçamento total de dano, sem lançar pedra adicional.
- Pedrada torna-se o segundo especial, no Shift/botão Pedrada, com recarga própria de 6 s. Mantidos alcance 320, preparação de 0,26 s, impacto total em 0,55 s, área, dano e atordoamento. Terremoto permanece no Espaço/botão direito e no botão principal, com recarga de 12 s. Ambos recebem melhorias e recuperação por abate e conservam as recargas nos portais.
- Dash e invulnerabilidade de esquiva removidos exclusivamente de Granito. Shift/botão secundário usam Pedrada; os demais personagens mantêm esquiva, controles e habilidades. Vida 135, dano 9, velocidade 172, Carapaça de 18%, desbloqueio e save `pedra` preservados.
- Terremoto usa a sequência original de preparação, agachar, golpe, poeira/rochas, onda de terra e recuperação. Preparação de 0,36 s, animação de 1,02 s e efeito de 0,72 s; segurar o básico não corta a fase principal de impacto. Raio 260, dano ×2,6, atordoamento/empurrão e recarga mantidos. Pedra voadora e impacto também usam os efeitos originais.
- Seleção, ajuda, HUD, botões e prévias mostram garras e os dois especiais. Mantidos os três mundos, chefes após quatro minutos, inimigos, drops e a remoção/migração de Ventinho.
- Validação: 116 testes aprovados, incluindo comparação de pixels, recargas independentes, garras com mira distante, teclado/botão sem dash, animação do Terremoto, portais e regressões. Prévia de combate ampliada para 34 cenários.

## 0.8.1-beta — Granito, ritmo das etapas e revisão do pântano — 2026-11-04

- Granito substitui Pedrino sob o ID `pedra`, preservando desbloqueio, vida 135, dano 9, velocidade 172 e Carapaça de 18%. Topeira humanoide ereta, capa vinho rasgada, placas de areia/pedra e garras longas; 36 quadros individuais de repouso, passos, corrida, garras, dano, morte, Pedrada e Terremoto. Prancha em `tests/granito.html`; a partida usa somente cada quadro.
- Mesmo botão/cadência de 1,2 s: garras de perto, em dois acertos com orçamento total de dano compartilhado, e Pedrada à distância. Pedrada prepara por 0,26 s e mantém impacto total em 0,55 s, alcance 320, área e atordoamento. Origem/destino são conferidos no lançamento mesmo durante movimento. Granito aliado recebe a mesma sequência, mantendo dano e cadência próprios.
- Terremoto usa a preparação existente por 0,28 s, com raio 260, dano ×2,6, atordoamento de 1,4 s, empurrão nos comuns e recarga 12 s. Efeitos curtos de terra e pedra pixelada; sem as habilidades extras da referência. Mantidos controles, esquiva, atributos e ataques dos outros cinco heróis.
- Ventinho removido dos dados de ajudantes, cartas, Equipe, invocação, desbloqueio e pulso próprio. Salvamentos v3 e legados v2 retiram a escolha antiga e preservam essência, coleção válida, personagens, melhorias, conquistas, estatísticas e recordes. Invocação/cartas inválidas são recusadas. Dificuldade Normal e efeitos dos demais personagens preservados.
- Chefes passam a surgir aos **240 segundos de combate de cada mapa**, independentemente do nível/XP. Pausa e escolhas não contam; morte congela o tempo. HUD mostra a contagem restante. Portais preservam a partida e reiniciam o cronômetro; mantido o ciclo Floresta → Dragão → Pântano → Floresta. Liberação do elenco usa o maior avanço entre níveis ganhos e intervalos de 30 s, evitando depender dos drops para variar inimigos.
- XP por abate reduzido mais 18,75% (fator 0,8 → 0,65), cura 2,8% → 1,2%, ímã 1,2% → 0,6% e baú de elite 100% → 35%. Chefes deixam seis cristais somando 62,4 XP, em vez de doze somando 76,8. Mantidos baú de chefe garantido, escolhas e requisitos de nível.
- Pântano redesenhado com trilhas de lama, água musgosa, margens irregulares, juncos, raízes, troncos baixos, pequenos tocos e plantas aquáticas. Cenário determinístico sob o combate, sem novos colisores; escurecimento por nível limitado a 16% somente no pântano.
- Bocarra com maior peso de surgimento (10/17 dos grupos sorteados) e espera persistente pelo orçamento necessário; preservada a divisão 3 → 2×2 → 4×1 e reserva de população. Mosquito: velocidade 126 → 195, fatores de vida 0,7 → 1,05 e dano 0,85 → 1,05; investida até 175 a velocidade 640, aviso de 0,28 s, recuperação de 0,22 s e recarga de 1,05 s. Sangramento 20% → 35%, ainda 2 s, leve e sem acumular/renovar.
- Serpente e Colosso redesenhados em quadros de 96×96: escamas claras/olhos vermelhos e tronco oco/raízes/casca, respectivamente. Serpente: vida base 2.500 → 3.800 (5.320 no primeiro Normal), velocidade 64 → 88 e fator de dano 0,9 → 1,35; bote até 260, cauda de raio 215 e espera de 1,15/0,8 s conforme a vida. Avisos de 0,75/0,95 s preservados. Vida base e padrões de Colosso/Cratos permanecem iguais.
- Validação: **108 testes aprovados** e **31 cenários no Edge sem erros**. Ciclo de quatro minutos simulado com Granito confirmou os três chefes aos 240 s, transições sem perda de estado e Bocarras nos três tamanhos, respeitando a população reservada. Prancha e galeria usam o código real; manifesto, menu, título e documentação sincronizados em 0.8.1-beta.

## 0.8.0-beta — Pântano de Frood e ciclo de três mundos — 2026-11-04

- Ciclo atualizado para Floresta Sombria → Bioma Dracônico → Pântano de Frood → Floresta Sombria. Mantida a floresta inicial conforme confirmação do autor. Cada vitória abre o portal existente, ativado somente por contato; vida, nível, XP, melhorias, aliados e recargas permanecem na transição.
- Cenário procedural de brejo: lama, poças rasas com margens irregulares, juncos, raízes expostas, troncos baixos e plantas aquáticas. Sem árvores densas, novos colisores ou mudança de câmera/escala. O mesmo cenário representa o destino durante a transição.
- Bocarra do Brejo: perseguição e mordida anunciada; tamanho 3 gera duas tamanho 2, que geram quatro tamanho 1. Descendentes menores são mais rápidos. Cada morte divide uma única vez; limpeza de chefe não divide nem concede recompensas. Vagas reservadas de 4/2/1 por tamanho mantêm o teto de população durante a divisão.
- Mosquito do Brejo: voo rápido, aviso de 0,38 s, investida de até 105 com a probóscide e recuperação de 0,35 s. Picada tem 20% de chance de aplicar sangramento por 2 s, com 2 de dano base por segundo. Não acumula nem renova sangramento ativo; usa o fluxo comum de dano, armadura, morte e renascimento.
- Caranguejo de Lodo: lento, resistente e com deslocamento lateral. Pinçada de raio 34 anunciada por 0,6 s; recuperação de 0,7 s. Casco reduz dano frontal em 40%; lados/costas recebem dano normal e a recuperação aumenta o dano recebido em 25%. Golpes e projéteis informam a origem real do dano ao sistema compartilhado.
- Serpente Branca: novo chefe exclusivo do pântano, escamas claras, sombras lilases e olhos vermelhos. Alterna bote de até 180 (aviso de 0,75 s) e cauda de raio 185 (aviso de 0,95 s). Abaixo de 50% da vida, a espera entre ataques passa de 1,8 para 1,3 s, mantendo os avisos. Vida base 2.500; primeiro encontro no Normal com 3.500 pela progressão atual. Vitória limpa reforços/perigos e abre portal à floresta.
- Vida comum +12%, dano comum +8% e todos os drops de XP −20% em relação à revisão anterior. Requisitos de nível, escala por passagem, atributos dos heróis e vida/ataques dos dois chefes anteriores preservados. Reforços continuam reduzidos e limitados a oito vagas, priorizando Mosquitos no pântano.
- Sprites e quadros próprios em canvas, coerentes com a arte pixelada existente, sem usar a prancha de referência como sprite. Galeria com os quatro novos personagens e seis novos cenários de combate.
- Identificações de versão sincronizadas em 0.8.0-beta, incluindo menu, título, documentação e prévias; teste de consistência para as próximas revisões. Histórico anterior preservado.
- Validação: 91 testes automatizados, incluindo três ciclos completos, portais, divisões no limite de população, sangramento, casco, ataques/avisos da Serpente e regressões dos heróis.

## 0.7.0-beta — balanceamento, aliados e reforços — 2026-11-03

- Bloqueado aliado igual ao personagem em uso nas cartas, no início da jornada, nas preferências salvas e na Equipe. Configurações antigas são deduplicadas/filtradas sem apagar coleção ou desbloqueios; carta inválida não consome escolha.
- Corrigida drenagem acionada pelo dano de aliados. Origem do dano preservada em golpes, correntes, projéteis, pedras e poças; somente ataques próprios podem drenar.
- Nerf dos seis personagens: danos base 8/7/7/8/9/6; intervalos 0,48/1,05/0,70/0,80/1,20/0,80 s; vidas 85/100/85/85/135/80 (Salamandra/Frood/Sakura/Capricorn/Pedrino/Sombrinha). Crescimento do ataque básico reduzido de +25% para +15% por nível.
- Sakura: sem regeneração natural, drenagem 4% → 1%, flecha ×1,35 → ×1,15. Flor: recarga 14 → 20 s, dano ×2 → ×1,4, raiz 1,4 → 0,8 s e cura apenas ao acertar, de 2,5% a 5% em vez de 6% a 16%.
- Sombrinha drena 2% (antes 4%) e tem crítico natural de 10% (antes 15%). Drenagem usa reserva máxima de 1% da vida, reposta a 1%/s, compartilhada entre os acertos e sem crédito pelo dano excedente.
- Sakura aliada: removida a repetição de sorteios de cura a cada quadro sem inimigos. Só cura em combate, abaixo de 80% de vida, com recarga própria de 10 s e quantidade de 1,5%–2,7% conforme nível (antes 5%–9%). Cadência não reduz essa recarga.
- Aliados: base de dano 12 → 6 e crescimento por nível 35% → 25%; multiplicadores/cadências reduzidos. Queimadura passa a 12% do golpe por segundo, Fúria a intervalo ×0,7, peixes a multiplicador ×1,35, pedrada a ×1,1 e Tempestade a pulsos ×0,15/descarga ×1,5. Armadura de Pedrino 25% → 18%; regeneração de Frood 1 → 0,35/s.
- Reforços durante chefes: 20% da cadência normal, teto de 0,8 inimigo/s e oito simultâneos. Prioridade de 80% para Aranha Sombria/Asabrasa, conforme mundo; sem elites, com aviso de surgimento de 0,8 s. Mantida suspensão dos anéis de horda e da entrada do chefe. Vitória limpa reforços/perigos e mantém os portais.
- 72 testes aprovados, incluindo bloqueio de cópias, curas, dano de aliados, ataques iniciais contra comuns e reforços dos dois chefes. Prévia com reforços adicionada aos cenários existentes. Mapas, ciclo de mundos, atributos dos inimigos/chefes e progressão de XP preservados.

## 0.7.0-beta — revisão dos dois mundos — 2026-11-03

- Progressão substituída por Floresta Sombria → Bioma Dracônico → Floresta Sombria, em ciclos. Colosso da Casca é o primeiro chefe; Cratos é o segundo. Removidos do jogo os antigos chefes de pedra/névoa, seus padrões exclusivos e o mapa inicial de quatro biomas.
- Cada vitória cria um portal visível com destino e indicador fora da tela. Só o contato, após 0,8 s de abertura, transporta o jogador; pausa e morte impedem a ativação. A etapa fica sem novos inimigos até a passagem.
- Portais preservam vida, nível, XP, melhorias, aliados e recargas, sem cura ou crédito automático de XP. Coletas restantes continuam acessíveis; projéteis e perigos da etapa anterior são limpos.
- Floresta procedural com caminhos conectados de bordas irregulares, clareiras, raízes, árvores retorcidas, musgo e vegetação baixa. Árvores sem colisores e transparentes ao encobrir combate, coletas ou o portal. Menu/carregamento inicial usa a mesma nova floresta.
- Trio de Esporos nasce em grupos completos de três: aproximação em grupo, aviso de 0,65 s e nuvem de raio 48 por 0,85 s; reutiliza podridão de 2 s.
- Besouro de Casca: aviso em faixa de 0,65 s, investida reta de no máximo 150 unidades e recuperação de 0,65 s, recebendo 25% mais dano nesse período. Recarga de 2,4 s.
- Aranha Sombria: mira fixa por 0,7 s e espinho visível de velocidade 200, com recarga de 2,7 s.
- Colosso da Casca: tronco humanoide escuro com galhos/musgo; movimento, braço erguido, golpe de raiz após aviso de 1 s e recuperação. Raio 90, chegando a 105 no terço final da vida; 2.200 de vida no Normal inicial.
- Inimigos dracônicos repaginados com pixels maiores e paletas próximas à referência. Mantidos porrete, brasa preparada, bote/mordida e explosão anunciada. Cratos conserva seus três estágios e ataques.
- Chefes: vida base × (1 + 0,20 × passagens concluídas). Primeiro dragão: 2.880 no Normal. Horda suspensa nos dois encontros; os próximos marcos são calculados ao entrar no mundo, sem fila de chefes de áreas anteriores.
- Inimigos: multiplicadores base de vida 1,18 e dano 1,12; por passagem, +12% de vida e +7% de dano, com crescimento de nível suavizado após o nível 10. Cadência cresce 12% por passagem até +80%; limite absoluto de 160 simultâneos. Velocidades e avisos de ataque não escalam com o ciclo.
- XP necessário: fórmula anterior × (1,25 + mínimo de 0,15 e 0,004 × nível), arredondada para cima. Primeiro nível exige 14 em vez de 11; requisito nunca diminui. Drops dracônicos −15%; chefe concede 96 em vez de 120 pontos.
- Preservados atributos, ataques, controles, interface e progresso salvo dos personagens jogáveis. Nenhum arquivo de asset externo removido: as artes são embutidas no HTML; preservados recursos usados por aliados e sistemas compartilhados.
- 63 testes automatizados aprovados, incluindo ciclos, portais, trios, ataques, XP e regressões. Cenários reproduzíveis dos dois mundos adicionados às prévias existentes.

## 0.7.0-beta — integração dracônica inicial — 2026-11-03

- Atualizado somente o trecho inicial, até a primeira vitória contra Cratos. Sem fase adicional, novo chefe ou alteração dos marcos de progressão.
- Terreno procedural queimado com fissuras pequenas, poucos ossos, marcas de garras, pedras, cinzas, brasas apagadas e vegetação carbonizada esparsa. Detalhes determinísticos, sem colisores e desenhados sob inimigos, itens e projéteis; câmera, escala e movimentação preservadas.
- Substituídos Ventinho e os inimigos elementais que surgiam nesse trecho (planta, elétrico, fogo e pedra nos níveis 1–9). Qualquer surgimento posterior enquanto Cratos ainda não foi derrotado também usa o elenco dracônico. Elenco original preservado após a vitória.
- Catador de Ossos: perseguidor fraco, porrete de raio 28 com aviso de 0,45 s e recarga de 1,25 s. Sem dano de contato instantâneo.
- Lagarto de Cinza: rápido e frágil, preparação de 0,32 s, bote de no máximo 96 unidades, mordida curta e recarga de 2 s.
- Estufado da Podridão: lento e frágil, bolsa verde pulsante, aviso de 1,05 s no raio de 72, explosão e 2 s de podridão pelo sistema existente; nuvem de apenas 0,4 s. Matar antes interrompe a explosão.
- Asabrasa: voo animado, mantém distância de 200–290, prepara a garganta por 0,6 s e cospe uma única brasa de velocidade 210, com mira fixa e recarga de 2,4 s.
- Sprites em canvas com quadros próprios de movimento, preparação e ataque, inspirados na referência; nenhuma prancha usada como sprite. Vida, dano, dificuldade, colisões, efeitos, drops e mortes reutilizam o fluxo atual. Taxas e limites globais de surgimento mantidos.
- Cratos preserva vida, fases, ataques, condição de vitória, recompensas e suspensão da horda durante o duelo. Personagens, interface, controles e demais chefes preservados.
- 52 testes automatizados; prévias de bioma, avisos e sprites adicionadas aos cenários existentes.

## 0.6.4-beta — 2026-11-02

- Integradas as novidades compatíveis de Horda da Névoa (9), preservando o index da beta 0.6.3.
- Tela de derrota com faixas, dessaturação, queda dos personagens e animação própria de Capricorn. Pular após 1,8 s; duração máxima 4,6 s. Tempo de sobrevivência e recompensa congelados na morte.
- Cratos, o Corrompido: arte animada, cabeça/cauda articuladas, três fases, mordidas, cauda e sopro com podridão. Substitui a Guardiã no primeiro encontro.
- Encontros de chefe isolados da horda; fila preserva chefes pendentes quando vários marcos são alcançados. Vida inicial recalibrada de 10.000 da ramificação para 2.400 no Normal, mantendo a dificuldade escolhida na partida.
- Esquiva defensiva com Shift/botão: sem dano, duração 0,18 s, invulnerabilidade 0,24 s e recarga 2,4 s. Separada do dash flamejante da Fúria.
- Árvores decorativas por bioma, transparência perto do jogador/chefe, partículas ambientais, efeitos de nível/evolução e animação extra de Frood.
- Opção de campo de visão Perto/Normal/Amplo, salva no navegador.
- Podridão usa o fluxo comum de dano, armadura, morte e renascimento. Interrompe a atualização depois de dano fatal e é limpa ao derrotar o chefe ou reviver.
- Preservados nomes BaubLike, seleção dificuldade → personagem, Equipe, vida contínua, drops, progresso e balanceamento da beta 0.6.3.
- 43 testes automatizados, incluindo fases do chefe, derrota, esquiva e regressões anteriores.

## 0.6.3-beta — 2026-11-02

- Capricorn substitui Zero com a arte, animações, cores de evolução e efeitos da versão 7. Progresso elétrico preservado; custo de desbloqueio continua 120.
- Corrente em Cadeia: até 3 alvos, dano 100% / 50% / 25%, alcance 320 e saltos de 120; 15% de chance de paralisar por 0,25 s.
- Tempestade Viva: carga 1,1 s, três pulsos e descarga, movimento a 60%, sem ataque normal durante a carga. Raio 260 (máximo 325), bônus de grupo até 30%, paralisia final de 1 s e recarga 18 s.
- Sakura: alcance nominal 360 independente de área, flechas com 20% menos dano por passagem, intervalo 0,55 s e cura do especial reduzida.
- Frood e Pedrino: arremessos limitados a 330 e 320; especiais de raio 260 com recarga 12 s. Sombrinha: percurso dos orbes limitado a 480, teleporte de até 280 e recarga 8 s.
- Salamandra mantém dois golpes normais sem dash e os seis segundos de Fúria com dash a cada três golpes. Mira automática ajustada ao alcance de cada personagem.
- Reduzida a recuperação de especiais por abate para evitar repetição quase contínua em hordas.
- Corrigidos projéteis que pulavam inimigos, dano duplo no teleporte sobreposto e cura por dano excedente à vida restante do alvo.
- Preservados menus, vida contínua, XP/cura, artes de Pedrino/Sombrinha e correções anteriores; não substituído o index pela ramificação antiga.
- 33 testes automatizados aprovados, incluindo todos os personagens nas três evoluções; prévias de arte/carga/descarga verificadas no navegador.
- Comparação completa da integração em docs/comparacao-versao-7.md e cenários de combate reproduzíveis em tests/combat.html.

## 0.6.2-beta — 2026-10-31

- Salamandra: dois golpes alternados sem avanço ou dash no ataque normal; dano base 13, intervalo 0,4 s.
- Fúria: 6 s, intervalo 40% menor, dano por golpe 20% menor, +15% de movimento; dash somente a cada três ataques durante a Fúria. Recarga 24 s e menor redução por abate.
- Retirados o dano em área instantâneo e a limpeza de projéteis ao ativar Fúria.
- Zero substitui Fagulhim, com sprite pixelado próprio inspirado na referência magenta, preta e verde. Mantidos os IDs de progresso elétrico.
- Raio encadeado: 3 alvos no máximo, com fatores 1 / 0,5 / 0,25; alcance inicial 340, saltos até 140, intervalo 0,65 s. Disparos extras aumentam dano sem remover o limite de alvos.
- Onda eletromagnética: raio 300, dano de 1,8 vez o ataque, paralisia de 1 s incluindo chefes e recarga 18 s.
- Ajustes moderados: Sakura recebe redução no multiplicador da flecha e na drenagem/cura; Frood recebe redução no dano da pescaria. Pedrino e Sombrinha preservados.
- loveTheBest incluído nos créditos do README.
- 19 testes de regressão.

## 0.6.1-beta — 2026-10-31

- Projeto renomeado para BaubLike no título, menu e instruções.
- Salamandra substitui Brasito: garras, combo de três golpes com dash e Fúria Berserker.
- Sakura substitui Folhito: flechas perfurantes, drenagem de vida e Flor de Sakura.
- Sprites, animações, evoluções e habilidades dos dois aliados integrados da versão 5.
- Tela “Como jogar” atualizada com os novos personagens e suas habilidades.
- Os IDs de fogo e planta e a chave de armazenamento foram mantidos para carregar o progresso existente.
- Preservados o fluxo dificuldade → personagem, Equipe, drops e correções de combate da beta 0.6.
- 14 testes de regressão.

## 0.6.0-beta — 2026-10-31

- Base: Horda da Névoa (2), preservando seus seis personagens, ataques, evolução e melhorias.
- Página principal padronizada como `index.html`, com versão Beta 0.6 no menu e título.
- XP em cristais ciano com núcleo claro, tamanho conforme o valor e brilho discreto.
- Cura em coração vermelho pixelado com folha, sem partículas ou oscilação chamativa.
- Ataques em área e projéteis perfurantes continuam atingindo os próximos alvos após uma eliminação.
- Coletas e cura não são processadas após dano fatal no mesmo quadro.
- Percursos protegidos contra listas de inimigos/projéteis esvaziadas por morte de chefe ou reviver.
- Áudio não tenta reproduzir de uma vez a música acumulada durante silêncio ou suspensão.
- Removida leitura de armazenamento fora do tratamento de falhas.
- Testes de regressão e fluxo de publicação no GitHub Pages.

As mudanças de Salamandra e Sakura da versão 5 estão inventariadas em `docs/comparacao-versoes.md`; não substituem os personagens da base.
