# Histórico

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
