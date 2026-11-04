# BaubLike — Beta 0.8.1

Repositório privado: [bblike](https://github.com/Felpz0kkj/bblike). Elenco: Salamandra, Sakura, Frood, Capricorn, Granito e Sombrinha. Capricorn substitui Zero, preservando o desbloqueio e o progresso do elemento elétrico.

Roguelike de sobrevivência em HTML, CSS e JavaScript, sem instalação ou etapa de build.

## Jogar

Abra `index.html` no navegador. Escolha a dificuldade e depois um personagem. WASD/setas movem, clique ataca, Espaço/botão direito usa o especial, Shift faz uma esquiva e Esc pausa. No celular, especial e esquiva têm botões próprios.

A Equipe reúne atributos, desbloqueios, aliados iniciais e melhorias permanentes. O progresso fica no navegador, mantendo a chave da versão anterior. Ao mudar de arquivo local para um endereço publicado, o navegador usa um armazenamento separado; o progresso local não migra automaticamente.

## Novidades da beta 0.8.1

**Granito**, escavador de Terra, substitui Pedrino com o mesmo desbloqueio e atributos: vida 135, dano 9, velocidade 172 e Carapaça de 18%. O desenho agora é uma topeira humanoide com manto vinho rasgado, placas de pedra e areia, focinho longo e garras fortes. Há quadros individuais de repouso, movimento, corrida, ataques, dano e morte; a [prancha de referência do jogo](tests/granito.html) mostra as sequências completas.

O botão de ataque usa **garras de perto e Pedrada à distância**, na mesma cadência de 1,2 s e com um único orçamento de dano. Pedrada prepara a escavação por 0,26 s e mantém o impacto total em 0,55 s, alcance 320, área e atordoamento. **Terremoto** prepara o golpe por 0,28 s e mantém raio 260, dano, atordoamento e recarga de 12 s, com empurrão. Controles dos outros personagens permanecem iguais.

**Ventinho foi removido** dos ajudantes, cartas, seleção, desbloqueios e efeitos próprios. Saves atuais e legados retiram a escolha antiga, preservando essência, coleção válida, personagens, melhorias, conquistas e recordes. O ID interno `pedra` continua sendo o de Granito, para manter seu progresso.

O ciclo continua **Floresta Sombria / Colosso da Casca → Bioma Dracônico / Cratos → Pântano de Frood / Serpente Branca → Floresta**. Agora o chefe aparece após **240 segundos de combate por mapa**, independentemente do XP. Pausas e escolhas não contam; entrar no portal reinicia o cronômetro. O HUD mostra o tempo restante. Vida, nível, XP, melhorias, aliados e recargas permanecem na passagem, sem cura automática.

O pântano recebeu trilhas de lama, poças com margens irregulares, juncos, raízes, troncos baixos, pequenos tocos e plantas aquáticas. Toda decoração fica sob o combate e não cria obstáculos. **Bocarras** aparecem mais e continuam dividindo de tamanho 3 para duas tamanho 2 e quatro tamanho 1. **Mosquitos** perseguem mais rápido, investem mais longe e tentam picar com mais frequência; a chance de sangramento passou a 35%, ainda leve, por 2 s e sem acumular.

A **Serpente Branca** e o **Colosso da Casca** foram redesenhados com mais detalhes de escamas, casca, raízes e silhuetas próximas às referências. A Serpente tem vida base 3.800 (5.320 no primeiro encontro Normal), mais dano, maior bote e menor espera entre ataques, mantendo os avisos de 0,75/0,95 s. Colosso e Cratos mantêm seus ataques e vida base.

XP por abate fica **18,75% menor que na beta 0.8.0**. Cura cai para 1,2% dos abates, ímã para 0,6% e baú de elite para 35%; o baú do chefe permanece garantido. Chefes deixam seis cristais, em vez de doze. O limite de 160 inimigos continua reservando espaço para as divisões das Bocarras. Mantidos os nerfs de Sakura, o bloqueio de aliados iguais ao herói e os reforços reduzidos durante os chefes.

## Desenvolvimento

Use sempre o `index.html` da versão mais recente da branch `main` como base. Antes de editar, sincronize o repositório; envie mudanças em uma branch e pull request. Os HTMLs antigos servem como referência, não como base de novos patches.

- Fonte principal: `index.html`.
- Versão: `VERSION`, título/menu/constante do HTML, README e prévias devem acompanhar cada revisão publicada. Cada revisão publicada avança a numeração, respeitando a versão solicitada; esta é 0.8.1, e a próxima correção será 0.8.2. Um teste verifica a consistência das identificações ativas.
- Testes: `node --test tests/game.test.cjs` (Node 24 ou superior).
- Prévia: python -m http.server 4173 --bind 127.0.0.1; abra http://127.0.0.1:4173/.
- Cenários de combate: http://127.0.0.1:4173/tests/combat.html (31 cenários, incluindo ações de Granito, os três mundos, cronômetro, avisos, divisões, chefes, reforços, portais e ciclo completo; progresso isolado).
- Prancha de Granito: http://127.0.0.1:4173/tests/granito.html (36 quadros do código real, com estados e habilidades).
- Galeria de arte: http://127.0.0.1:4173/tests/visual.html (progresso isolado).
- Histórico: [CHANGELOG.md](CHANGELOG.md).
- Números e decisões de balanceamento: [docs/balanceamento.md](docs/balanceamento.md).
- Comparação das versões: [docs/comparacao-versoes.md](docs/comparacao-versoes.md).

Fontes externas são opcionais; os sprites são desenhados no código. O ranking funciona localmente; a integração online antiga depende do ambiente original e não oferece ranking global no GitHub Pages.

## GitHub Pages

Os testes rodam automaticamente nos pushes e pull requests. A publicação na web é opcional e o workflow de Pages só executa manualmente; enviar o código ao repositório privado não dispara a publicação do jogo.

Se decidir publicar no futuro, configure Settings → Pages → Build and deployment → GitHub Actions e execute manualmente o workflow “Testar e publicar jogo”. Ele executa os testes e publica somente index.html. A URL é informada pelo próprio job de deployment. A disponibilidade de Pages em repositórios privados depende do plano da conta.

Documentação oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

As versões recebidas, backups, capturas e pacotes de release ficam locais e são ignorados pelo Git. Nenhuma licença de redistribuição é presumida; o autor pode escolher uma licença antes da publicação.

## Comunidade e colaboração

- [loveTheBest](https://github.com/loveTheBest) — colaboração no desenvolvimento de BaubLike.
