# BaubLike — Beta 0.8.4

Repositório privado: [bblike](https://github.com/Felpz0kkj/bblike). Elenco: Salamandra, Sakura, Frood, Capricorn, Granito e Sombrinha. Capricorn substitui Zero, preservando o desbloqueio e o progresso do elemento elétrico.

Roguelike de sobrevivência em HTML, CSS e JavaScript, sem instalação ou etapa de build.

## Jogar

Abra `index.html` no navegador. Escolha a dificuldade e depois um personagem. WASD/setas movem, clique ataca, Espaço/botão direito usa o especial e Esc pausa. Shift usa Pedrada com Granito e faz esquiva com os demais personagens. No celular, especial e esquiva têm botões próprios.

A Equipe reúne atributos, desbloqueios, aliados iniciais e melhorias permanentes. O progresso fica no navegador, mantendo a chave da versão anterior. Ao mudar de arquivo local para um endereço publicado, o navegador usa um armazenamento separado; o progresso local não migra automaticamente.

## Novidades da beta 0.8.4

A **Serpente Branca aplica veneno na mordida**: três segundos no sistema existente, cinco de dano por segundo antes da armadura. Mordidas evitadas ou bloqueadas pela invulnerabilidade não envenenam; cauda continua sendo um ataque separado.

O **Colosso da Casca tem três padrões**: raiz sob o alvo (aviso de 0,72 s), impacto ao redor do corpo (0,58 s) e faixa de raízes (0,68 s). Os golpes têm alvo fixo, sinais visuais e recuperação. Fora do alcance do impacto curto ele escolhe a faixa, sem ficar preso tentando se aproximar. A vida do chefe permanece igual.

Os ataques de perto ficaram moderadamente mais ágeis. O **Trio de Esporos** prepara a nuvem em 0,55 s, com raio 72 em vez de 48; ela continua durando apenas 0,85 s. A detecção respeita esse alcance, e sair da área evita o dano e o veneno.

A **Pedrada** reconhece a mira sobre o corpo desenhado do inimigo e ajusta o destino durante a preparação. No lançamento, respeita o alcance 320; depois, o destino fica fixo durante o voo. Isso evita pedras caindo no ponto antigo de um inimigo que já se aproximou, sem conceder acerto automático. A borda exata do círculo também conta. A mesma correção vale para Granito aliado.

A revisão removeu uma tabela de arte e um helper sem referências, e passou a montar a lista de transparência das árvores uma vez por quadro. Os sprites aprovados de Granito e Serpente continuam importados das referências; as [pranchas de Granito](tests/granito.html) e da [Serpente](tests/serpente.html) mostram esses recortes.

O ataque básico de Granito é **somente garras**, com dois acertos de curto alcance e cadência de 1,2 s, inclusive quando o cursor está distante. Seus dois especiais têm controles e recargas separados:

| Controle de Granito | Ação | Recarga base |
| --- | --- | --- |
| Clique / ataque automático | Garras, alcance 112 × área | Cadência 1,2 s |
| Shift / botão Pedrada | Escava e arremessa uma pedra até 320, com impacto em área e atordoamento | 6 s |
| Espaço ou botão direito / botão Terremoto | Golpe no chão, raio 260 × área, dano, empurrão e atordoamento | 12 s |

**Granito não tem dash nem a invulnerabilidade da esquiva.** Shift aciona Pedrada para ele; os demais personagens mantêm sua esquiva no Shift. Vida 135, dano 9, velocidade 172, Carapaça de 18%, desbloqueio e ID salvo `pedra` continuam iguais.

Terremoto mantém a sequência original de agachar, apoiar as garras, golpear, levantar poeira e espalhar a onda de terra. Prepara por 0,36 s e anima por 1,02 s; segurar o ataque básico não interrompe o impacto. Pedrada mantém a preparação de 0,26 s, impacto total em 0,55 s e seus efeitos originais de pedra/estilhaços. Os dois especiais recebem as melhorias de recarga e a recuperação por abate existentes.

Continuam o ciclo **Floresta → Dragão → Pântano → Floresta**, os chefes após quatro minutos de combate por mapa, portais que preservam a partida, drops reduzidos, ajustes dos inimigos e remoção de Ventinho da revisão anterior.

## Desenvolvimento

Use sempre o `index.html` da versão mais recente da branch `main` como base. Antes de editar, sincronize o repositório; envie mudanças em uma branch e pull request. Os HTMLs antigos servem como referência, não como base de novos patches.

- Fonte principal: `index.html`.
- Versão: `VERSION`, título/menu/constante do HTML, README e prévias devem acompanhar cada revisão publicada. Cada revisão publicada avança a numeração, respeitando a versão solicitada; esta é 0.8.4, e a próxima correção será 0.8.5. Um teste verifica a consistência das identificações ativas.
- Testes: `node --test tests/game.test.cjs` (Node 24 ou superior).
- Prévia: python -m http.server 4173 --bind 127.0.0.1; abra http://127.0.0.1:4173/.
- Cenários de combate: http://127.0.0.1:4173/tests/combat.html (45 cenários, incluindo ações de Granito, os três mundos, cronômetro, avisos, divisões, chefes, reforços, portais e ciclo completo; progresso isolado).
- Prancha de Granito: http://127.0.0.1:4173/tests/granito.html (recortes originais e sequências usadas no jogo).
- Prancha da Serpente: http://127.0.0.1:4173/tests/serpente.html (referência e recortes realmente usados no chefe).
- Galeria de arte: http://127.0.0.1:4173/tests/visual.html (progresso isolado).
- Importação de Granito: `node scripts/build-granito.cjs --check` confere os pixels embutidos contra `assets/granito/reference.png` e `frames.json`; sem `--check`, atualiza o bloco de pixels no HTML.
- Importação da Serpente: `node scripts/build-serpente.cjs --check` confere os quadros embutidos contra `assets/serpente/reference.png` e `frames.json`; sem `--check`, atualiza o HTML.
- Histórico: [CHANGELOG.md](CHANGELOG.md).
- Números e decisões de balanceamento: [docs/balanceamento.md](docs/balanceamento.md).
- Comparação das versões: [docs/comparacao-versoes.md](docs/comparacao-versoes.md).

Fontes externas são opcionais. Os sprites usam canvas; os pixels originais de Granito e da Serpente ficam embutidos no HTML, que continua funcionando sozinho, sem carregar a prancha ou assets externos na partida. O ranking funciona localmente; a integração online antiga depende do ambiente original e não oferece ranking global no GitHub Pages.

## GitHub Pages

Os testes rodam automaticamente nos pushes e pull requests. A publicação na web é opcional e o workflow de Pages só executa manualmente; enviar o código ao repositório privado não dispara a publicação do jogo.

Se decidir publicar no futuro, configure Settings → Pages → Build and deployment → GitHub Actions e execute manualmente o workflow “Testar e publicar jogo”. Ele executa os testes e publica somente index.html. A URL é informada pelo próprio job de deployment. A disponibilidade de Pages em repositórios privados depende do plano da conta.

Documentação oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

As versões recebidas, backups, capturas e pacotes de release ficam locais e são ignorados pelo Git. Nenhuma licença de redistribuição é presumida; o autor pode escolher uma licença antes da publicação.

## Comunidade e colaboração

- [loveTheBest](https://github.com/loveTheBest) — colaboração no desenvolvimento de BaubLike.
