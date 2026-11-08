# BaubLike — Beta 0.9.2

Repositório privado: [bblike](https://github.com/Felpz0kkj/bblike). Elenco: Salamandra, Sakura, Frood, Capricorn, Granito e Kantaro. Capricorn preserva o progresso elétrico. Kantaro substitui Sombrinha e preserva seu desbloqueio, coleção e progresso sob o ID salvo `sombra`.

Roguelike de sobrevivência em HTML, CSS e JavaScript, sem instalação ou etapa de build.

## Jogar

Abra `index.html` no navegador. Escolha a dificuldade e depois um personagem. WASD/setas movem, clique ataca, Espaço/botão direito usa o especial e Esc pausa. Shift usa Pedrada com Granito e faz esquiva com Salamandra, Frood, Sakura e Capricorn. Kantaro não tem dash nem ação no Shift. No celular, especial e esquiva têm botões próprios.

A Equipe reúne atributos, desbloqueios, aliados iniciais e melhorias permanentes. O progresso fica no navegador, mantendo a chave da versão anterior. Ao mudar de arquivo local para um endereço publicado, o navegador usa um armazenamento separado; o progresso local não migra automaticamente.

## Novidades da beta 0.9.2

**Kantaro, o médico da peste:** integrado do arquivo recebido em 8 de novembro, mantendo a beta **0.9.2** a pedido do autor. Alterna poções tóxicas e da praga, com alcance 300 e intervalo base de 0,95 s. Veneno não soma dano entre nuvens; a poção roxa causa apenas seu impacto. A Revoada Kamikaze tem três corvos, recarga base de **28 s**, mínimo de **20 s** com melhorias e nenhuma redução por abates. Kantaro não tem dash, teleporte, invulnerabilidade de esquiva ou drenagem. Mapas, ciclo, cronômetros, chefes e demais personagens usam a base atual.

**Chefes com tempo por etapa:** o primeiro mapa da partida dura 4 minutos até o chefe. Todas as etapas seguintes duram 2min30, inclusive o retorno à Floresta em novos ciclos. Pausas e escolhas suspendem o relógio. A liberação dos tipos de inimigo acompanha proporcionalmente o prazo mais curto; XP, recargas e atributos não são acelerados.

**Iniciar por fase:** no menu, escolha **Usar código**, digite **betatester** e confirme. Também é possível digitar a palavra diretamente no menu com o teclado. A liberação fica salva neste navegador. A nova opção permite escolher Floresta, Bioma Dracônico, Pântano ou Deserto, depois dificuldade e personagem.

Essa partida começa no nível 1, usando as melhorias permanentes do seu perfil; a dificuldade por passagem considera a posição da fase no ciclo. É uma sessão de teste: nenhuma essência, conquista, coleção ou pontuação é adicionada ao save normal. Configurações de som/tela/controles continuam sendo salvas. Sair, morrer ou escolher outra fase restaura o perfil original. A partida normal mantém sua entrada e suas recompensas habituais.

**Serpente Branca restaurada:** usa novamente os sprites e animações da beta 0.9.0, preservando os pixels e pontos de apoio anteriores. O Verme continua desenhado por código; seu rastro subterrâneo usa fissuras e poeira pequenas na camada do chão, sem repetir montículos sobre o corpo. O recolhimento permanece visível antes de desaparecer. IA, ataques, hitboxes, vida, dano e recargas dos chefes continuam iguais.

**Ambientação:** pássaros na Floresta, névoa baixa no Pântano e calor/brasas no bioma dracônico/vulcânico. Ainda na beta 0.9.2, o vulcão recebe poucos fios de fumaça pixelada cinza e marrom que sobem das fissuras quentes existentes, dissipam e reaparecem em outros pontos. No Deserto, rajadas espaçadas usam linhas curtas e quebradas, pequenos grãos de areia e variações leves de direção e duração. Tudo é desenhado atrás de atores, projéteis e avisos, usa o tempo do jogo, pausa junto com ele e tem limites menores no celular. Referências visuais não são usadas como texturas; os efeitos não criam colisões nem alteram o combate.

Conforme a decisão do autor, **Granito, Escorpião, Abutre e Hiena preservam suas artes aprovadas**, inclusive os dados raster já existentes. Os arquivos de imagem não foram alterados. Os demais personagens, mapas, chefes, controles, progressão e salvamentos continuam no sistema atual.

O ataque básico de Granito é **somente garras**, com dois acertos de curto alcance e cadência de 1,2 s, inclusive quando o cursor está distante. Seus dois especiais têm controles e recargas separados:

| Controle de Granito | Ação | Recarga base |
| --- | --- | --- |
| Clique / ataque automático | Garras, alcance 112 × área | Cadência 1,2 s |
| Shift / botão Pedrada | Escava e arremessa uma pedra até 320, com impacto em área e atordoamento | 6 s |
| Espaço ou botão direito / botão Terremoto | Golpe no chão, raio 260 × área, dano, empurrão e atordoamento | 12 s |

**Granito não tem dash nem a invulnerabilidade da esquiva.** Shift aciona Pedrada para ele; os demais personagens mantêm sua esquiva no Shift. Vida 135, dano 9, velocidade 172, Carapaça de 18%, desbloqueio e ID salvo `pedra` continuam iguais.

Terremoto mantém a sequência original de agachar, apoiar as garras, golpear, levantar poeira e espalhar a onda de terra. Prepara por 0,36 s e anima por 1,02 s; segurar o ataque básico não interrompe o impacto. Pedrada mantém a preparação de 0,26 s, impacto total em 0,55 s e seus efeitos originais de pedra/estilhaços. Os dois especiais recebem as melhorias de recarga e a recuperação por abate existentes.

Continuam o ciclo **Floresta → Dragão → Pântano → Deserto → Floresta**, portais que preservam a partida, drops reduzidos, ajustes dos inimigos e remoção de Ventinho da revisão anterior.

## Desenvolvimento

Use sempre o `index.html` da versão mais recente da branch `main` como base. Antes de editar, sincronize o repositório; envie mudanças em uma branch e pull request. Os HTMLs antigos servem como referência, não como base de novos patches.

- Fonte principal: `index.html`.
- Versão: `VERSION`, título/menu/constante do HTML, README e prévias devem acompanhar cada revisão publicada. A numeração acompanha a versão solicitada pelo autor. O complemento de Kantaro foi mantido na 0.9.2 por pedido expresso; a próxima revisão numerada será 0.9.3. Um teste verifica a consistência das identificações ativas.
- Testes: `node --test tests/game.test.cjs` (Node 24 ou superior).
- Prévia: python -m http.server 4173 --bind 127.0.0.1; abra http://127.0.0.1:4173/.
- Cenários de combate: http://127.0.0.1:4173/tests/combat.html (incluindo ações de Granito, os quatro mundos, cronômetro, avisos, divisões, chefes, reforços, portais e ciclo completo; progresso isolado).
- Prévia de Kantaro: http://127.0.0.1:4173/tests/combat.html?focus=kantaro (repouso, passos, poções, veneno, corvos e derrota).
- Prancha de Granito: http://127.0.0.1:4173/tests/granito.html (recortes originais e sequências usadas no jogo).
- Teste da Serpente: `tests/serpente.html` explica como entrar na fase para conferir o chefe em combate.
- Teste do Verme: `tests/deserto.html` explica como testar o chefe no jogo.
- Galeria legada das artes mantidas (não valida os novos chefes): http://127.0.0.1:4173/tests/sprites.html.
- Galeria de arte: http://127.0.0.1:4173/tests/visual.html (progresso isolado).
- Importação de Granito: `node scripts/build-granito.cjs --check` confere os pixels embutidos contra `assets/granito/reference.png` e `frames.json`; a conferência é somente das artes mantidas.
- Verificação dos três inimigos comuns do Deserto: `node scripts/build-deserto.cjs --check` confere o PNG original e seus recortes. O Verme é desenhado por código; a Serpente usa os dados embutidos restaurados da beta 0.9.0. A referência do mapa é preservada em `assets/deserto/map-reference.png`.
- Histórico: [CHANGELOG.md](CHANGELOG.md).
- Números e decisões de balanceamento: [docs/balanceamento.md](docs/balanceamento.md).
- Comparação das versões: [docs/comparacao-versoes.md](docs/comparacao-versoes.md).

Fontes externas são opcionais. Os sprites usam canvas; os dados raster de Granito, Serpente e dos três inimigos comuns do Deserto ficam embutidos no HTML. O Verme usa geometria e paletas em código. O HTML continua funcionando sozinho, sem carregar pranchas ou assets externos na partida. O ranking funciona localmente; a integração online antiga depende do ambiente original e não oferece ranking global no GitHub Pages.

## GitHub Pages

Os testes rodam automaticamente nos pushes e pull requests. A publicação na web é opcional e o workflow de Pages só executa manualmente; enviar o código ao repositório privado não dispara a publicação do jogo.

Se decidir publicar no futuro, configure Settings → Pages → Build and deployment → GitHub Actions e execute manualmente o workflow “Testar e publicar jogo”. Ele executa os testes e publica somente index.html. A URL é informada pelo próprio job de deployment. A disponibilidade de Pages em repositórios privados depende do plano da conta.

Documentação oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

As versões recebidas, backups, capturas e pacotes de release ficam locais e são ignorados pelo Git. Nenhuma licença de redistribuição é presumida; o autor pode escolher uma licença antes da publicação.

## Comunidade e colaboração

- [loveTheBest](https://github.com/loveTheBest) — colaboração no desenvolvimento de BaubLike.
