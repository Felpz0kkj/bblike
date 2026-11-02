# Integração da versão 9 — beta 0.6.4

Comparados `Horda da Névoa (9).html`, a versão 7 recebida e `index.html` da beta 0.6.3 (`cc98111`). A versão 9 continua sendo descendente da ramificação antiga, e não da beta atual. A base final permanece o index corrigido. O arquivo recebido ficou intacto.

## Novidades identificadas

| Área | Encontrado na versão 9 | Integração na beta 0.6.4 |
| --- | --- | --- |
| Derrota | ELIMINADO, faixas pretas, dessaturação, queda e alma de Capricorn; espera de 4,6 s | Incorporado; pular após 1,8 s. Corrigida contagem de tempo/recompensa durante a animação; tela adaptada a larguras pequenas e movimento reduzido |
| Cratos | Substitui a Guardiã; sprite de seis frames com cabeça/cauda articuladas, mordidas, cauda e sopro | Incorporados arte, animação, avisos e três fases |
| Chefes | Vida inicial 10.000, dano base 17, maior agressividade; fases abaixo de 66%/33% | Vida inicial 2.400, dano base 14 e pausas moderadas; dificuldade fixada pela jornada |
| Encontros | Limpa inimigos comuns e pausa surgimento de hordas durante chefes | Incorporado com fila de marcos, para não perder/substituir chefes em saltos de nível |
| Podridão | Dano direto de 5 por segundo, com morte forçada por dano enorme | Integrado ao fluxo comum, com armadura/renascimento, bloqueio de nova aplicação durante esquiva e interrupção após morte |
| Esquiva | Shift e botão, velocidade 1.250 por 0,2 s, invulnerabilidade 0,38 s, recarga 1,4 s | Incorporada sem dano; 1.100 por 0,18 s, invulnerabilidade 0,24 s e recarga 2,4 s |
| Campo de visão | Perto / Normal / Amplo | Incorporado, salvo nas opções |
| Ambientação | Árvores por bioma, folhas/pétalas/vaga-lumes, poeira e auras | Incorporado com limites de partículas e transparência perto do jogador/chefe. Esse conjunto já existia na versão 7, mas não no index |
| Outras animações | Efeitos ao subir de nível/evoluir, movimento de Frood e animação contínua de Capricorn | Incorporados sem alterar habilidades ou alcance |

## Regressões evitadas

A cópia integral da versão 9 restauraria os nomes Horda da Névoa/Névoa Selvagem, seleção de personagem na Equipe e início direto com o personagem salvo. Também substituiria a moldura de vida, os drops e os sprites de Pedrino/Sombrinha, concederia Capricorn gratuitamente e removeria várias correções de combate/áudio/armazenamento.

O combate elétrico voltaria a adicionar alvos com melhorias, com dano caindo apenas 8% por salto; Sakura voltaria às flechas de alcance ampliado por área, e Salamandra recuperaria o dash no ataque normal. Todos esses trechos foram preservados da beta 0.6.3: Capricorn continua com três alvos e fatores 100% / 50% / 25%, Sakura com alcance nominal 360 e Salamandra com dash flamejante apenas na Fúria.

## Correções durante a integração

- Tempo de sobrevivência congela na morte e o resultado só é contabilizado uma vez.
- Podridão fatal não permite coletas, cura ou ataques posteriores no quadro; reviver limpa o efeito.
- Chefes pendentes são enfileirados, sem remover o chefe ativo; pedidos duplicados do mesmo encontro são ignorados.
- Esquiva não acerta inimigos e termina na distância correta mesmo quando o último quadro excede sua duração.
- Avisos de área continuam visíveis perto de árvores; árvores são decoração e não bloqueiam movimento ou tiros.
- Mantidos os testes de regressão anteriores, acrescidos de cenários de derrota, fases, sopro, cauda, fila de chefes, dificuldade e campo de visão: 43 testes.

As prévias de `tests/combat.html` incluem Cratos nas três fases e a tela de derrota, usando o código real e um armazenamento separado do progresso principal.
