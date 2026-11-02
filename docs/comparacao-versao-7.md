# Integração da versão 7 — beta 0.6.3

Comparação: `Horda da Névoa (7).html` recebido contra `index.html` da beta 0.6.2, commit `31ea5ea`. Base final: **index.html**, preservando a evolução de BaubLike. Versão 7 recebida permanece intacta como referência local.

| Área | Versão 7 recebida | Decisão na beta 0.6.3 |
| --- | --- | --- |
| Elétrico | Capricorn com arte/animações; desbloqueio gratuito forçado | Arte, animações e cores de evolução incorporadas; custo 120 e progresso preservados |
| Corrente | 3 ou mais alvos, melhorias adicionam saltos; redução de apenas 8% por salto | Limite 3, dano 100/50/25%, alcance 320 e saltos 120; paralisia menor e menos frequente |
| Tempestade | Carga 1,1 s; dano cresce fortemente com a horda, invulnerabilidade e limpeza global de projéteis | Mantida identidade de carga/pulsos/descarga; dano limitado, raio menor e recarga maior, sem invulnerabilidade/limpeza |
| Salamandra | Restaura dash no normal e dano maior na Fúria | Preservados dois golpes e dash apenas na Fúria, com menor dano por golpe |
| Sakura | Retorna dano/cura antigos e alcance multiplicado por área | Alcance 360 fixo, dano cai ao perfurar e recuperação menor |
| Frood/Pedrino/Sombrinha | Alcances longos e recargas antigas | Revisados alcances, recargas, controle e impacto de grupos |
| Nome/versão | Horda da Névoa / Névoa Selvagem, sem beta atual | BaubLike beta 0.6.3 |
| Iniciar/Equipe | Começa direto com personagem salvo; Equipe seleciona; dificuldade em opções | Mantidos dificuldade → personagem e Equipe para consulta/desbloqueios/melhorias |
| HUD/vida | Retrato e bordas douradas; troca a moldura da vida | Mantida pedra/musgo, mesmo tamanho, preenchimento contínuo e acessibilidade |
| XP/cura | Retorna cristais de várias cores e cruz verde | Mantidos cristal ciano e coração com folha |
| Pedrino/Sombrinha | Retorna criaturas genéricas | Mantidos tatu de pedra e gato espectral |
| Combate | Retorna iterações que pulam alvos e atualização após morte | Preservadas correções de eliminação, chefe, renascimento e interrupção após morte |
| Áudio/armazenamento | Relógio antigo e acesso desprotegido ao armazenamento | Preservadas correções atuais |
| Cenário/efeitos gerais | Árvores sobrepostas, ambiente, rastros, flashes de evolução e animação extra de Frood | Inventariados, não incorporados nesta integração de personagem/balanceamento; cenário atual preservado |

Bloco de dados `CAP` integralmente da versão 7. Cor/evolução, frames de ataque/carga/dano/morte e desenhos de raio, orbe, runa e tempestade integrados. Combate adaptado aos limites atuais, sem copiar a ramificação inteira sobre a base.

Também corrigidos: cura por dano excedente, projéteis que atravessavam inimigos entre quadros sem acertar, dispersão de arremessos além do alcance e dano duplo no teleporte curto de Sombrinha.

Para contribuir, partir do `index.html` atualizado na branch `main`, trabalhar em branch própria e enviar pull request. Isso permite comparar só o incremento e evita reintroduzir sistemas antigos.
