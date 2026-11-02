# Balanceamento — beta 0.6.3

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
