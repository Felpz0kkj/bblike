# Balanceamento — beta 0.7.0

Calibração inicial de alcance, dano e recuperação. Os testes verificam as regras; a equivalência entre personagens ainda depende de partidas e combinações de melhorias. Distâncias em unidades do mundo, antes do zoom. Colisões também consideram o tamanho do alvo. Área não aumenta o trajeto das flechas/orbes nem os saltos do raio.

| Personagem | Ataque normal, antes de arredondar | Alcance nominal | Intervalo | Recarga especial |
| --- | --- | --- | --- | --- |
| Salamandra | 13, com queimadura | Arco 112, cresce com área | 0,40 s | 24 s |
| Capricorn | 13 → 6,5 → 3,25 | Primeiro alvo 320; saltos 120 | 0,65 s | 18 s |
| Sakura | 16,2 → 12,96 → 10,368 | Flecha 360 | 0,55 s | 14 s |
| Frood | 27,6 × multiplicador do peixe | Centro da poça até 330 + raio | 0,85 s | 12 s |
| Pedrino | 31 + atordoamento breve | Impacto até 320 + raio 64 | 1 s | 12 s |
| Sombrinha | Dois orbes de 8,25 | Percurso de cada orbe 480 | 0,65 s | 8 s |

Sem crítico, evoluções, aliados ou melhorias. Área concede até +50% por melhorias, somando o bônus natural de Frood (+10%); Tempestade tem limite próprio de +25%. Aliados respeitam os limites de distância correspondentes, com dano e cadência próprios.

## Dois mundos e ciclos — revisão da beta 0.7.0

Ordem fixa: **Floresta Sombria / Colosso da Casca → portal → Bioma Dracônico / Cratos → portal → floresta**. `visit` começa em zero e aumenta em cada portal, sem reiniciar o nível ou a evolução do personagem. O primeiro chefe surge no nível 10; ao entrar em outro mundo, o próximo marco é o múltiplo de dez seguinte ao nível atual. Níveis adicionais obtidos enquanto um portal está aberto não fazem surgir outro chefe no mundo vencido.

Portal precisa de contato e 0,8 s de abertura. Não concede vida, XP ou melhorias; mantém recargas e aliados. Os perigos/projéteis são descartados, mas baús e cristais continuam acessíveis. A horda fica suspensa durante o chefe e depois da vitória, até a passagem.

| Criatura | Aviso | Ataque e limite | Recuperação / recarga |
| --- | --- | --- | --- |
| Esporo, sempre em trio | 0,65 s | Nuvem de raio 48, duração 0,85 s; podridão 2 s | 0,30 s / 3 s |
| Besouro de Casca | 0,65 s em faixa | Investida até 150, velocidade 390 | 0,65 s vulnerável (+25% de dano recebido) / 2,4 s |
| Aranha Sombria | 0,70 s | Espinho de velocidade 200, duração 2,8 s, mira fixa | 0,25 s / 2,7 s |
| Catador de Ossos | 0,45 s | Porrete em círculo de raio 28 | 0,22 s / 1,25 s |
| Asabrasa | 0,60 s na garganta | Brasa de velocidade 210, duração 2,6 s, mira fixa | 0,20 s / 2,4 s |
| Lagarto de Cinza | 0,32 s | Bote até 96, velocidade 480, seguido de mordida | 0,28 s / 2 s |
| Estufado da Podridão | 1,05 s | Explosão de raio 72, podridão 2 s; nuvem 0,4 s | Morre na explosão |
| Colosso da Casca | 1 s | Raiz de raio 90 (105 abaixo de 33% de vida), alvo fixado na preparação | Recupera até 1,85 s desde o início; espera 1,65 s pelo próximo golpe |

Vida dos chefes: `base × (1 + 0,20 × visit) × dificuldade`. Colosso: base 2.200; dragão: base 2.400. Sequência no Normal: **2.200 → 2.880 → 3.080 → 3.840**, continuando gradualmente. Colosso não usa os padrões dos chefes removidos. Cratos conserva mordidas, cauda e sopro, com avisos e pausas descritos no histórico abaixo.

Vida comum: `12 × fator da espécie × 1,18 × hpMul(ameaça) × dificuldade × (1 + 0,12 × visit)`, com `ameaça = min(nível, 10) + max(0, nível − 10) × 0,25`. Dano comum: `6 × fator da espécie × 1,12 × (1 + 0,025 × ameaça) × dificuldade × (1 + 0,07 × visit)`. Elites comuns têm 4× vida e escala visual 1,2; Esporos nunca viram elites isoladas.

Cadência: `min(7, 1,5 + 0,16 × nível local) × (1 + min(0,8, 0,12 × visit)) × (1 + min(0,3, tempo local / 300))`. Contagem máxima: `min(160, 80 + 4 × nível local + 8 × visit)`, também aplicada aos anéis de horda. Um trio consome três vagas e três unidades de orçamento, evitando triplicar a população. Sem escalar velocidade de ataques, projéteis ou duração dos avisos a cada passagem.

XP: `ceil((6 + 5 × nível + floor(nível² × 0,25)) × (1,25 + min(0,15, 0,004 × nível)))`. Requisitos: **14 no nível 1, 105 no 10 e 522 no 30**, sempre maiores que os anteriores. Drops: Esporo 0,55 cada; Besouro 1,7; Aranha 2,1; Catador 0,85; Lagarto/Estufado 1,7; Asabrasa 2,55. Chefes deixam 12 cristais de 8, total 96 (antes 120). Melhorias de XP continuam multiplicando a coleta.

Árvores, raízes e cenário não criam colisores. As copas perdem opacidade ao encobrir jogador, inimigos, projéteis, perigos, coletas ou portal. O cenário inicial/menu é a nova floresta, sem a antiga seleção de quatro biomas. Os atributos dos personagens da tabela acima não mudaram.

## Capricorn

Arte e animações da versão 7: parado, movimento, ataque, ferido, morte e carga/descarga; cores rosa, dourada e azul nas evoluções. Mantidos ID `eletrico` e desbloqueio de Zero/Fagulhim. Custo continua 120, sem desbloqueio gratuito.

Corrente: **três alvos distintos**, mesmo com disparos extras/evolução do ataque. Primeiro alvo na direção da mira e até 320. Cada salto exige distância entre centros até 120. Matar o primeiro alvo não interrompe a cadeia já selecionada. Um sorteio de crítico compartilhado preserva as proporções 100% / 50% / 25%; cada alvo tem 15% de chance de paralisia de 0,25 s. Disparo Extra acrescenta 10% de dano por nível, sem alvos ou alcance extras. DPS bruto sem crítico: 20 em um alvo; 35 somando três, antes do arredondamento.

Tempestade carrega por 1,1 s, bloqueia o ataque normal e reduz movimento a 60%. Pulsos em 0,3, 0,6 e 0,9 s causam 0,18 × dano base cada; descarga causa 1,8 ×. Cada evento multiplica o dano por `1 + 0,025 × min(12, alvos presentes)`, máximo 1,3. Total teórico por alvo que permanece na área: até 3,042 × base, sem crítico, antes de arredondar. Não aumenta indefinidamente em hordas maiores. Quem entra depois recebe apenas os eventos restantes.

Raio 260, máximo 325 com área. Descarga paralisa por 1 s, inclusive chefes. Sem invulnerabilidade, dash ou limpeza de projéteis. Recarga começa na ativação; abates reduzem 0,06 s. Morte cancela a carga; pausa congela o tempo.

## Sakura

Antigo trajeto: `760 × 0,78 × área` (592,8 sem melhorias), além dos 16 de saída da flecha: aproximadamente 609. Com cinco melhorias de área, aproximadamente 905. Agora alcance nominal 360 incluindo a saída, independente de área. O deslocamento vertical de 8 alinha o disparo à mão do sprite.

Multiplicador inicial 1,5 → 1,35; intervalo 0,50 → 0,55 s; cada passagem reduz o dano restante em 20%, até três acertos. DPS direto de alvo único arredondado, sem crítico: 36 → cerca de 29,1. Flechas verificam todo o caminho no quadro, em ordem de distância, inclusive no último trecho antes de desaparecer.

Flor: raio 290 → 230, multiplicador 2,4 → 2,0, raiz 1,8 → 1,4 s (chefes mantêm limite próprio), recarga 12 → 14 s. Cura explícita de 6% + 1% por alvo vivo atingível, até dez: máximo 16%. Drenagem passiva de 4% continua e pode somar cura, mas considera apenas a vida efetivamente retirada, sem dano excedente de mortes.

## Demais personagens

- **Salamandra:** preservados dois golpes alternados sem avanço. Fúria de 6 s, intervalo 40% menor, dano por golpe 20% menor, movimento +15% e dash a cada três ataques. DPS direto 32,5 → cerca de 41,7 na Fúria, antes de queimadura/dash. Mira automática espera um alvo no arco.
- **Frood:** ponto de pescaria 430 → 330, incluindo dispersão dos disparos extras. Peixes e variação de dano/controle preservados. Onda: raio 300 → 260 (mais bônus de área), multiplicador 2,4 → 2,2, recarga 9 → 12 s. Limpa somente projéteis na área.
- **Pedrino:** ponto de impacto 460 → 320, multiplicador 1,7 → 1,55, intervalo 0,95 → 1 s. Terremoto: raio 300 → 260, multiplicador 3 → 2,6, atordoamento comum 1,8 → 1,4 s, recarga 10 → 12 s. Vida 150 e armadura 25% preservadas.
- **Sombrinha:** percurso 792 → 480; busca de perseguição 600 → 240; intervalo 0,60 → 0,65 s. Teleporte máximo manual 340 → 280 (automático 260), multiplicador 2,5 → 2,2, recarga 6 → 8 s. Explosões compartilham os alvos atingidos para evitar dano duplo ao teleportar perto. Drenagem usa dano efetivo.

Redução de recarga por abate: Salamandra 0,08 s, Capricorn 0,06 s, Sombrinha 0,08 s; Frood/Sakura/Pedrino 0,10 s (antes 0,35 para esses quatro últimos). Melhorias de cadência continuam reduzindo recargas.

## Validação

Testes cobrem queda de dano, limites com melhorias, alvo morto na cadeia, pulsos independentes da duração do quadro, paralisia de chefes, fim de trajeto, colisão contínua, drenagem sem excesso, aliados, desbloqueios e regressões de menus/vida. `tests/combat.html` mostra quadros do código real sem mudar o progresso principal. Não há telemetria de partidas reais suficiente para declarar equilíbrio definitivo.


## Histórico: integração da versão 9 na beta 0.6.4

Os números dos seis personagens da beta 0.6.3 foram preservados. A nova esquiva é uma ação defensiva independente: duração 0,18 s, velocidade 1.100 (198 de deslocamento durante o dash, mais inércia posterior), invulnerabilidade 0,24 s e recarga 2,4 s. Não causa dano, não pode começar em pausa ou durante a carga de Capricorn e não acrescenta dash aos golpes normais de Salamandra. O avanço de cada quadro é limitado ao tempo restante, evitando que quadros longos alonguem a esquiva.

A versão 9 elevava todos os chefes de 1.200 para 10.000 de vida inicial. A beta 0.6.4 usa `2400 × (nível/10)^1,3 × (1 + 0,15 × volta)` antes da dificuldade: Cratos no nível 10 tem 1.920 / 2.400 / 3.120 de vida em Calma / Normal / Feroz. O dano de contato mantém a base anterior (14, em vez de 17 da ramificação), com os multiplicadores existentes. A calibração de vida não substitui testes de partidas reais.

Chefes entram nas fases 2 e 3 abaixo de 66% e 33% de vida. Mantidos ataques/avisos da versão 9, com pausas maiores: chefes genéricos usam intervalo 2,7 / 2,1 / 1,6 s, Cratos recupera por 1,7 / 1,4 / 1,1 s depois de cada sequência. Cratos pode morder duas vezes (três na fase 3), varrer a cauda num raio de 285 (duas varreduras a partir da fase 2) e soprar em cone de raio 430. O sopro é anunciado por 0,7 s; a cauda, por 0,95 s na primeira varredura.

O sopro aplica até 5 s de podridão, renovados enquanto o jogador permanecer exposto. Uma nova aplicação é evitada durante invulnerabilidade; a podridão já adquirida causa 5 de dano base a cada segundo, mitigado pela armadura, mesmo durante invulnerabilidade posterior. Usa o fluxo de dano/morte/segunda chance, sem curas ou coletas depois de um efeito fatal. Reviver ou derrotar o chefe remove a podridão.

A horda normal e os anéis de cinco níveis ficam suspensos durante encontros. A entrada remove inimigos comuns sem recompensas, mas mantém itens já existentes no chão. Marcos de chefes alcançados durante um encontro entram numa fila, sem substituir o chefe ativo. A animação de derrota não soma tempo nem recompensas à jornada.
