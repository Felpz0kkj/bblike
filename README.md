# BaubLike — Beta 0.7.0

Repositório privado: [bblike](https://github.com/Felpz0kkj/bblike). Elenco: Salamandra, Sakura, Frood, Capricorn, Pedrino e Sombrinha. Capricorn substitui Zero, preservando o desbloqueio e o progresso do elemento elétrico.

Roguelike de sobrevivência em HTML, CSS e JavaScript, sem instalação ou etapa de build.

## Jogar

Abra `index.html` no navegador. Escolha a dificuldade e depois um personagem. WASD/setas movem, clique ataca, Espaço/botão direito usa o especial, Shift faz uma esquiva e Esc pausa. No celular, especial e esquiva têm botões próprios.

A Equipe reúne atributos, desbloqueios, aliados iniciais e melhorias permanentes. O progresso fica no navegador, mantendo a chave da versão anterior. Ao mudar de arquivo local para um endereço publicado, o navegador usa um armazenamento separado; o progresso local não migra automaticamente.

## Novidades da beta 0.7.0

A partida começa na **Floresta Sombria**, com clareiras, caminhos, árvores retorcidas e o **Colosso da Casca**. Após a vitória, um portal no chão leva ao **Bioma Dracônico**, onde o chefe é **Cratos, o dragão**. O portal de Cratos retorna à floresta, repetindo somente esses dois mundos.

A troca depende de contato com o portal e conserva personagem, nível, XP, melhorias, aliados, recargas e vida atual, sem cura automática. Baús e cristais ainda não recolhidos continuam acessíveis. Os chefes surgem nos próximos marcos de dez níveis; a etapa fica livre de hordas após a vitória, até o jogador escolher entrar no portal.

A floresta tem **Trio de Esporos** (grupos de três, nuvem venenosa curta), **Besouro de Casca** (investida anunciada e recuperação vulnerável) e **Aranha Sombria** (espinho com preparação). O Colosso ergue o braço e golpeia uma área de raiz sinalizada por um segundo. No mundo do dragão, **Catador de Ossos**, **Asabrasa**, **Lagarto de Cinza** e **Estufado da Podridão** receberam paletas e escala revisadas, mantendo seus ataques próprios. Cratos mantém mordidas, cauda e sopro de podridão.

A dificuldade cresce moderadamente por passagem; o limite é **160 inimigos simultâneos**. XP por nível exige aproximadamente 25%–40% mais pontos; os drops dracônicos são 15% menores. Atributos dos personagens, controles e estrutura da interface foram preservados. O fundo inicial usa a nova floresta procedural, sem carregar o mapa ou os chefes antigos. Mantida a identificação **beta 0.7.0** nesta revisão.

## Desenvolvimento

Use sempre o `index.html` da versão mais recente da branch `main` como base. Antes de editar, sincronize o repositório; envie mudanças em uma branch e pull request. Os HTMLs antigos servem como referência, não como base de novos patches.

- Fonte principal: `index.html`.
- Versão: `VERSION` e constante VERSION no HTML.
- Testes: `node --test tests/game.test.cjs` (Node 24 ou superior).
- Prévia: python -m http.server 4173 --bind 127.0.0.1; abra http://127.0.0.1:4173/.
- Cenários de combate: http://127.0.0.1:4173/tests/combat.html (inclui os dois mundos, avisos, Colosso, portais e ciclo completo; progresso isolado).
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
