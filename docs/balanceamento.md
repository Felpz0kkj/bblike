# Balanceamento — beta 0.6.2

Os números abaixo são uma primeira calibração mecânica, sujeita a testes de jogo. As comparações não presumem que todos os ataques em área atinjam o mesmo número de inimigos.

| Personagem | Dano base | Intervalo base | Papel |
| --- | --- | --- | --- |
| Salamandra | 13 | 0,40 s | Corpo a corpo, queimadura e janela de Fúria |
| Zero | 13 | 0,65 s | Cadeia curta e controle periódico |
| Sakura | 12 | 0,50 s | Flechas perfurantes e recuperação moderada |
| Frood | 12 | 0,85 s | Área, lentidão e regeneração |
| Pedrino | 20 | 0,95 s | Tanque lento, área e atordoamento |
| Sombrinha | 11 | 0,60 s | Projéteis perseguidores e reposicionamento |

## Salamandra

O normal alterna dois golpes em arco. Não causa deslocamento nem acumula combo para dash. Durante os seis segundos da Fúria, o intervalo passa de 0,40 s para 0,24 s e o golpe bruto de 13 para 10,4 (arredondado pelo sistema para 10). O DPS direto teórico passa de 32,5 para cerca de 41,7, antes de crítico, queimadura, dash, evoluções e melhorias.

O dash só acontece a cada terceiro ataque na Fúria, dura 0,14 s e causa 90% do dano base, uma vez por alvo. A Fúria não causa explosão ao ativar nem limpa projéteis. Dá +15% de movimento; recarga base de 24 s, sujeita a melhorias de intervalo e redução de 0,08 s por abate. Um dash flamejante termina quando a Fúria expira.

## Zero

Primeiro alvo na direção da mira, até 340 de distância. Dois saltos adicionais, cada um limitado a 140 de distância do alvo anterior. Nenhum alvo pode ser atingido duas vezes pela mesma cadeia.

Cada acerto usa 100%, 50% e 25% do dano. O sistema arredonda o resultado para pontos inteiros de vida. Um crítico compartilhado multiplica toda a cadeia e preserva a proporção antes do arredondamento. Em três alvos, a soma base é 1,75 vez o dano, com intervalo de 0,65 s. Disparos extras aumentam a potência em 10% por nível, mantendo o limite de três alvos.

A onda causa 1,8 vez o dano num raio de 300, escalado por melhorias de área. Paralisa por 1 s, inclusive chefes, sem invulnerabilidade ou dash. Recarga base de 18 s; abates reduzem 0,06 s. A aliada Zero usa a mesma cadeia com dano e intervalo próprios de aliado.

## Demais personagens

- Sakura: multiplicador da flecha 1,7 → 1,5; drenagem 5% → 4%; cura máxima da flor 28% → 22%. Mantidos os três acertos possíveis por flecha.
- Frood: multiplicador da pescaria 2,6 → 2,3. Mantidos lentidão e regeneração, sua principal utilidade.
- Pedrino e Sombrinha mantêm os números: suas limitações de velocidade ou resistência já oferecem contrapartidas claras. Não foram alterados sem dados de partidas que justifiquem isso.

A recarga dos especiais é contada desde a ativação. Esses valores não são uma garantia de equivalência entre personagens; a avaliação em partidas deve acompanhar tempo de sobrevivência, dano causado e facilidade de recuperação.
