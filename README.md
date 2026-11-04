# BaubLike — Beta 0.8.0

Repositório privado: [bblike](https://github.com/Felpz0kkj/bblike). Elenco: Salamandra, Sakura, Frood, Capricorn, Pedrino e Sombrinha. Capricorn substitui Zero, preservando o desbloqueio e o progresso do elemento elétrico.

Roguelike de sobrevivência em HTML, CSS e JavaScript, sem instalação ou etapa de build.

## Jogar

Abra `index.html` no navegador. Escolha a dificuldade e depois um personagem. WASD/setas movem, clique ataca, Espaço/botão direito usa o especial, Shift faz uma esquiva e Esc pausa. No celular, especial e esquiva têm botões próprios.

A Equipe reúne atributos, desbloqueios, aliados iniciais e melhorias permanentes. O progresso fica no navegador, mantendo a chave da versão anterior. Ao mudar de arquivo local para um endereço publicado, o navegador usa um armazenamento separado; o progresso local não migra automaticamente.

## Novidades da beta 0.8.0

A ordem agora é **Floresta Sombria / Colosso da Casca → Bioma Dracônico / Cratos → Pântano de Frood / Serpente Branca → Floresta Sombria**. A floresta permanece como primeira área. Cada chefe derrotado abre um portal no chão; o jogador precisa entrar nele para avançar.

A troca depende de contato com o portal e conserva personagem, nível, XP, melhorias, aliados, recargas e vida atual, sem cura automática. Baús e cristais ainda não recolhidos continuam acessíveis. Os chefes surgem nos próximos marcos de dez níveis; a etapa fica livre de hordas após a vitória, até o jogador escolher entrar no portal.

A floresta tem **Trio de Esporos** (grupos de três, nuvem venenosa curta), **Besouro de Casca** (investida anunciada e recuperação vulnerável) e **Aranha Sombria** (espinho com preparação). O Colosso ergue o braço e golpeia uma área de raiz sinalizada por um segundo. No mundo do dragão, **Catador de Ossos**, **Asabrasa**, **Lagarto de Cinza** e **Estufado da Podridão** receberam paletas e escala revisadas, mantendo seus ataques próprios. Cratos mantém mordidas, cauda e sopro de podridão.

O **Pântano de Frood** tem lama, poças rasas, juncos, raízes, troncos baixos e plantas aquáticas, com terreno livre e sem árvores densas ou novos obstáculos. **Bocarra do Brejo** morde após um aviso e se divide uma única vez por morte: tamanho 3 → duas tamanho 2 → quatro tamanho 1, menores e mais rápidas. **Mosquito do Brejo** prepara uma investida curta com a probóscide; a picada tem 20% de chance de causar sangramento leve por 2 s, sem acumular ou renovar aplicações ativas. **Caranguejo de Lodo** avança de lado, anuncia a pinçada e tem casco frontal resistente, com recuperação vulnerável.

A **Serpente Branca** alterna bote com mordida e varrida ampla de cauda, com áreas de aviso claras. Abaixo da metade da vida, reduz moderadamente a espera entre ataques. O cenário do pântano também aparece durante a transição, usando o mesmo fundo procedural do combate.

A dificuldade cresce moderadamente por passagem; o limite continua em **160 inimigos simultâneos**, reservando as vagas necessárias aos descendentes das Bocarras. Em relação à revisão anterior, inimigos comuns têm **12% mais vida e 8% mais dano**, e todos os drops de XP foram reduzidos em **20%**. Requisitos de nível, controles, personagens e melhorias foram preservados.

Mantidos os nerfs anteriores dos seis personagens e o bloqueio de aliado igual ao herói, inclusive por configurações salvas. Sakura continua sem regeneração natural, com drenagem de 1% apenas do próprio dano e especial que cura no máximo 5%, somente ao acertar, com recarga de 20 s. Sakura aliada tem cura pequena em combate com recarga própria de 10 s. Durante os chefes surgem reforços a 20% da cadência normal, até oito vagas simultâneas, priorizando Aranhas, Asabrasas e Mosquitos conforme o mundo. A vitória limpa os reforços e abre o portal.


## Desenvolvimento

Use sempre o `index.html` da versão mais recente da branch `main` como base. Antes de editar, sincronize o repositório; envie mudanças em uma branch e pull request. Os HTMLs antigos servem como referência, não como base de novos patches.

- Fonte principal: `index.html`.
- Versão: `VERSION`, título/menu/constante do HTML, README e prévias devem acompanhar cada revisão publicada. Novos conteúdos avançam a versão menor (esta revisão: 0.8.0); correções seguintes avançam o último número (0.8.1, 0.8.2…). Um teste verifica a consistência das identificações ativas.
- Testes: `node --test tests/game.test.cjs` (Node 24 ou superior).
- Prévia: python -m http.server 4173 --bind 127.0.0.1; abra http://127.0.0.1:4173/.
- Cenários de combate: http://127.0.0.1:4173/tests/combat.html (23 cenários dos três mundos, avisos, divisões, chefes, reforços, portais e ciclo completo; progresso isolado).
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
