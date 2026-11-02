# Histórico

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
