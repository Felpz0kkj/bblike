# BaubLike — Beta 0.6.2

Repositório privado: [bblike](https://github.com/Felpz0kkj/bblike). Elenco: Salamandra, Sakura, Frood, Zero, Pedrino e Sombrinha. Zero substitui Fagulhim, preservando o desbloqueio e o progresso do elemento elétrico.

Roguelike de sobrevivência em HTML, CSS e JavaScript, sem instalação ou etapa de build.

## Jogar

Abra `index.html` no navegador. Escolha a dificuldade e depois um personagem. WASD/setas movem, clique ataca, Espaço/botão direito usa o especial e Esc pausa.

A Equipe reúne atributos, desbloqueios, aliados iniciais e melhorias permanentes. O progresso fica no navegador, mantendo a chave da versão anterior. Ao mudar de arquivo local para um endereço publicado, o navegador usa um armazenamento separado; o progresso local não migra automaticamente.

## Desenvolvimento

- Fonte principal: `index.html`.
- Versão: `VERSION` e constante VERSION no HTML.
- Testes: `node --test tests/game.test.cjs` (Node 24 ou superior).
- Prévia: python -m http.server 4173 --bind 127.0.0.1; abra http://127.0.0.1:4173/.
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
