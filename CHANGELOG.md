# Histórico

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
