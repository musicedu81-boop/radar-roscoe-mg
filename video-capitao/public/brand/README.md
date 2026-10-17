# Marca: Capitão Vítor Prado

Inventário dos assets usados nos vídeos e nas apresentações. Fonte: artifact
"Planejamento Estratégico Capitão" (Talentos Business, aba Identidade), outubro de 2026.

| Item | Arquivo | Status | Onde entra |
|---|---|---|---|
| Logo, texto branco (fundos azuis) | `logo-branco.png` (560x324, PNG transparente) | ok, baixa resolução | abertura, HUD, encerramento |
| Logo, texto azul (fundo branco) | `logo-azul.png` (560x324, PNG transparente) | ok, baixa resolução | slides em inversão |
| Logo em alta (2000 px ou SVG) | | aguardando | substituir os dois acima |
| Paleta oficial | abaixo | ok | `src/apresentacao/marca.ts` (COR) |
| Fontes | `public/fonts/anton-*.woff2`, `montserrat-*.woff2` | ok | títulos Anton, textos Montserrat |
| Assinatura | "O prefeito do povo!" (na logo) | ok | logo |
| Foto oficial recortada | | aguardando | capas e cartão final |

A logo: "CAPITÃO VITOR · O PREFEITO DO POVO!" com o laço verde e a bandeira do Brasil.
A versão atual foi extraída do plano (560 px de largura). Para uso grande em 1080p, peça o PNG
ou SVG original.

## Paleta oficial

| Nome | Hex | Uso |
|---|---|---|
| Azul-noite | `#023564` | fundos, títulos na inversão, borda dos cards de números |
| Azul de fundo | `#054B87` | degradês de fundo |
| Azul-vivo | `#005CDB` | etiquetas de assunto, destaques |
| Verde-neon | `#01ED43` | linha de assinatura, etiquetas de lugar |
| Verde | `#16A442` | pill "Arraste e confira →", cabeçalho dos cards de números |
| Amarelo | `#FFCD0E` | palavra-chave do título (itálico), bordas |
| Branco | `#FFFFFF` | inversão para slides de dados |

## Regras de arte (do plano)

- Fundo azul em degradê, com o símbolo "+" em baixa opacidade nos temas de saúde.
- Título em caixa alta, condensada ultrabold (Anton), branco sobre azul, com uma palavra-chave em
  amarelo itálico. Na inversão, título azul-noite sobre branco.
- Etiquetas inclinadas: azul (assunto) e verde (lugar).
- Cards de números: branco, borda azul-noite, cabeçalho verde e número grande.
- Logo centralizada embaixo, ou no canto quando há foto do Capitão.

## Voz e textos

- Fecho usado nas legendas do Instagram: "Timóteo avança."
- Hashtags fixas: `#Timóteo` `#CapitãoVítor` `#PrefeituraDeTimóteo`.
- Regras completas de voz: skill `capitao-vitor-instagram`.
