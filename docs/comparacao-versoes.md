# Comparação das versões recebidas

Base escolhida pelo autor: **Horda da Névoa (2).html**.

**Atualização na beta 0.6.1 (BaubLike):** a pedido do autor, Salamandra passa a substituir Brasito e Sakura passa a substituir Folhito, incluindo sprites, animações e habilidades da versão 5. A tabela abaixo registra a comparação original da beta 0.6; as demais funcionalidades continuam vindo da versão 2 corrigida.

| Área | Versão 2 (base) | Versão 5 (ramificação) | Beta 0.6 |
| --- | --- | --- | --- |
| Elenco | 6 personagens | 6 personagens; reutiliza os mesmos IDs | Mantém o elenco da base |
| ID fogo | Brasito / Chamurso; projéteis de brasa | Salamandra / Salamandra Lendária; garras, dash e berserker | Brasito preservado |
| ID planta | Folhito / Cipoleão; folhas e raízes curativas | Sakura / Sakura Eterna; arco, drenagem e flor | Folhito preservado |
| Aliados fogo/planta | Bolas de fogo e folhas orbitais | Adaga e flechas | Habilidades da base |
| Arte | Dragão, Frood e quatro animais simplificados | Novas artes extensas de Salamandra/Sakura e animações de combate | Arte da base preservada |
| Início de partida | Dificuldade → personagem | Início direto com personagem salvo | Fluxo da base |
| Equipe | Consulta, melhorias e desbloqueios | Seleção de personagem no menu de equipe | Comportamento da base |
| Vida | Moldura com coração e preenchimento contínuo | HUD de outra ramificação | Moldura da base |
| XP/cura | Cristais com cores por valor; cura em cruz verde | Desenhos equivalentes aos antigos | Cristal ciano e coração com folha |

A versão 5 não acrescenta dois IDs independentes: substitui os IDs `fogo` e `planta`, incluindo atributos e habilidades. A beta 0.6.1 incorpora essas duas substituições de forma seletiva, preservando as correções da base e os IDs usados no progresso salvo.

## Referência de design

Foi lido o chat **design**, no projeto: XP como cristal azul-ciano de núcleo claro; vida como coração vermelho simples com folha, sem excesso de efeitos. O leitor de chats retornou as descrições textuais, sem os arquivos das imagens; esta implementação segue essas descrições. Não foi alterado o balanceamento de XP, a chance de drops ou a cura de 15% do item.

## Correções verificadas

- Iterar uma lista que perde itens durante um ataque podia pular alvos. Os ataques agora usam uma fotografia da lista.
- Dano fatal não interrompia o restante do quadro: itens e roubo de vida podiam continuar sendo processados. A atualização para após a morte.
- Eliminar um chefe ou reviver pode esvaziar listas durante sua iteração. Entradas removidas são ignoradas.
- Retomar áudio após longo silêncio podia acumular notas atrasadas. O relógio de música passa a acompanhar o tempo atual.
