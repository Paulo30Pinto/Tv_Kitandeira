# Canais portugueses — análise e lista pronta

**Fonte analisada:** `iptv-org/iptv`, `streams/pt.m3u` (clone raso de 2026-10-19)  
**Lista de referência:** [`data/channels/portugal.reference.ts`](../data/channels/portugal.reference.ts)  
**Integração em runtime:** [`data/lusofonia.curation.json`](../data/lusofonia.curation.json) → `data/lusofonia.generated.json`

> Este documento responde a duas perguntas: **quais canais portugueses vale a pena
> usar** e **como ficam no formato `Channel` da TeIP**. Não é uma lista de
> “tudo o que está no M3U”: é uma seleção com critério técnico e legal.

---

## 1. Resumo

| Métrica | Valor |
| --- | ---: |
| Entradas em `pt.m3u` | 60 |
| `tvg-id` únicos | 57 |
| Hosts distintos | 22 |
| Entradas com `#EXTVLCOPT` (UA/Referer) | 29 |
| Entradas em HTTP | 20 |
| Entradas em IP literal | 4 |
| Marcadas `[Geo-blocked]` | 3 |
| Marcadas `[Not 24/7]` | 19 |
| Entradas em domínios de operador/CDN | 35 |
| **Entradas a evitar** | **25** |
| **Canais na lista final** | **20** |
| Candidatos fora da lista | 2 (SIC Alta Definição, SIC Replay) + variantes Maná |

A lista final tem **20 canais** e está em
[`data/channels/portugal.reference.ts`](../data/channels/portugal.reference.ts),
tipada contra a interface real do projeto. As 35 entradas “de operador” não
equivalem a 35 canais: há feeds HD/SD e 12 variantes internacionais da TV Maná.
Os 20 escolhidos são os que interessam à TeIP.

---

## 2. Método

1. Clone raso do repositório:
   ```bash
   git clone --depth 1 https://github.com/iptv-org/iptv.git /tmp/iptv
   ```
2. Parser M3U que lê `#EXTINF`, `#EXTGRP` e `#EXTVLCOPT`.
3. Classificação por **host** e por **rótulo**:
   - domínio do operador → candidato;
   - CDN/FAST do operador → candidato com ressalva;
   - `dyndns`, IP literal, GitHub de terceiro → evitar.
4. Cruzamento com `data/lusofonia.generated.json` para obter URL, logótipo,
   `epgId`, qualidade e estado.
5. Verificação de tipos com `npx tsc --noEmit`.

Não foi possível testar os manifestos por HTTP neste ambiente (rede bloqueada
para os CDNs dos canais). Por isso todos os canais ficam com
`status: 'UNVERIFIED'` até correr `npm run sync:channels:check`.

---

## 3. Categoria A — lista final (20 canais)

Critérios: domínio do operador (ou CDN contratado por ele), HTTPS, sem
dependência de mirror de terceiro e presença de `epgId`. As ressalvas de
geobloqueio/header estão indicadas e não escondem o risco.

| # | Canal | `tvg-id` | Categoria | Host | Qualidade | EPG | Ressalva |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 100 | **RTP 1** | `RTP1.pt@HD` | Variedades | `streaming-live.rtp.pt` | 720p | `RTP1.pt` | 🎭 UA; 🕒 |
| 101 | **RTP 2** | `RTP2.pt@HD` | Variedades | `streaming-live.rtp.pt` | 720p | `RTP2.pt` | 🎭 UA; 🕒 |
| 102 | **RTP Notícias** | `RTPNoticias.pt@HD` | Notícias | `streaming-live.rtp.pt` | 720p | `RTPNoticias.pt` | 🎭 UA; 🕒 |
| 103 | **RTP África** | `RTPAfrica.pt@SD` | Variedades | `streaming-live.rtp.pt` | 504p | `RTPAfrica.pt` | 🎭 UA; 🕒 |
| 104 | **RTP Açores** | `RTPAcores.pt@HD` | Variedades | `streaming-live.rtp.pt` | 720p | `RTPAcores.pt` | 🎭 UA; 🕒 |
| 105 | **RTP Madeira** | `RTPMadeira.pt@SD` | Variedades | `streaming-live.rtp.pt` | 504p | `RTPMadeira.pt` | 🎭 UA; 🕒 |
| 106 | **RTP Memória** | `RTPMemoria.pt@SD` | Variedades | `streaming-live.rtp.pt` | 504p | `RTPMemoria.pt` | 🎭 UA; 🕒 |
| 107 | **RTP Mundo** | `RTPMundo.pt@SD` | Internacional | `streaming-live.rtp.pt` | 504p | `RTPMundo.pt` | 🎭 UA; 🕒 |
| 108 | **ARTV (Canal Parlamento)** | `ARTV.pt@SD` | Educação & Gov | `playout172.livextend.cloud` | 720p | `ARTV.pt` | 🕒 |
| 109 | **Porto Canal** | `PortoCanal.pt@SD` | Variedades | `pull-live-156-1.global.ssl.fastly.net` | 720p | `PortoCanal.pt` | — |
| 110 | **SIC** | `SIC.pt@SD` | Variedades | `sic.live.impresa.pt` | 1080p | `SIC.pt` | 🌍 Geo; 🎭 UA |
| 111 | **SIC Notícias** | `SICNoticias.pt@SD` | Notícias | `sicnot.live.impresa.pt` | 1080p | `SICNoticias.pt` | 🌍 Geo; 🎭 UA |
| 112 | **ADB TV** | `ADBTV.pt@SD` | Variedades | `live-tv.waytv.pt` | 1080p | `ADBTV.pt` | — |
| 113 | **ON FM** | `ONFM.pt@SD` | Música | `5ce9406b73c33.streamlock.net` | 720p | `ONFM.pt` | — |
| 114 | **Kuriakos TV** | `KuriakosTV.pt@SD` | Variedades | `w1.manasat.com` | 1080p | `KuriakosTV.pt` | — |
| 115 | **TV Maná 1** | `TVMana1.pt@SD` | Variedades | `w1.manasat.com` | 1080p | `TVMana1.pt` | — |
| 116 | **Famatv** | `Famatv.pt@SD` | Música | `tv2.fastcast4u.com` | 1080p | `Famatv.pt` | 🕒 |
| 117 | **RFPtv** | `RFPtv.pt@SD` | Música | `video03.logicahost.com.br` | 360p | `RFPtv.pt` | 📻 360p |
| 118 | **NPC Rádio e TV** | `NPCRadioeTV.pt@SD` | Música | `stmv5.samcast.com.br` | 720p | `NPCRadioeTV.pt` | — |
| 119 | **Rádio Sines** | `RadioSines.pt@SD` | Variedades | `load-balancer.azotosolutions.com` | 720p | `RadioSines.pt` | 🌍 Geo |

### 3.1 Notas por canal

- **RTP 1/2/Açores/Madeira/Memória/Mundo/Notícias/África** — o iptv-org pede
  `User-Agent` em todas. O browser **não permite** definir esse header; os
  canais historicamente funcionam sem ele, mas se receberes `403` a causa é
  essa. O sinal é oficial e o `epgId` existe.
- **SIC / SIC Notícias** — oficiais da Impresa, mas `[Geo-blocked]` e com
  `Referer` no M3U. Fora de Portugal, espera `403` ou manifesto vazio.
- **ARTV** — canal parlamentar; `[Not 24/7]` significa que pode estar fora do ar
  em alguns períodos, não que esteja quebrado.
- **Porto Canal** — CDN Fastly do operador; sem restrições declaradas.
- **RTP 3** — não aparece no `pt.m3u` de outubro de 2026. Não inventar URL;
  se a RTP publicar um HLS oficial, acrescentar pela curadoria.
- **ADB TV, ON FM, Kuriakos TV, TV Maná 1, Famatv, RFPtv, NPC, Rádio Sines** —
  canais religiosos/musicais/locais. São fontes oficiais ou do operador, mas
  têm menos audiência e menor prioridade de manutenção.
- **Rádio Sines** — `[Geo-blocked]`; pode falhar fora de Portugal.

> **Sobre `[Not 24/7]`:** a RTP marca quase todos os canais com este rótulo
> porque há janelas regionais. Na prática o stream costuma estar disponível
> 24 h; o rótulo é conservador.

---

## 4. Categoria B — aceitáveis com ressalvas

| Canal | `tvg-id` | Host | Ressalva |
| --- | --- | --- | --- |
| SIC Alta Definição | `SICAltaDefinicao.pt@SD` | `production-fast-sic.content.okast.tv` | FAST oficial SIC (Okast), mas o path tem UUIDs que podem rodar; sem EPG |
| SIC Replay | `SICReplay.pt@SD` | `production-fast-sic.content.okast.tv` | Idem |
| TV Maná 2 / Brasil / English / Español / Russkiy | `TVMana*.pt@SD` | `w1.manasat.com` | Oficiais, mas não são canais “portugueses” no sentido editorial |
| Maná Church/Cirkev/Église/Iglesia/Igreja/Tserkov | `Mana*Online.pt@SD` | `w1`/`w2.manasat.com` | Variantes internacionais/religiosas; `[Not 24/7]` |

**SIC Alta Definição / SIC Replay** são os dois canais que mais falta fazem na
lista: são FAST da SIC, com boa qualidade. Não entraram na lista de 20 porque:

1. o caminho do manifesto inclui UUIDs que podem ser rotativos;
2. não têm `epgId` no `guides.json`;
3. não foi possível validar o manifesto neste ambiente.

Se quiseres incluí-los, usa a curadoria (secção 7) e corre
`npm run sync:channels:check`; se ficarem `verified`, entram sem risco.

---

## 5. Categoria C — evitar

**25 entradas.** Todas usam infraestrutura que não é do titular, ou estão
associadas a retransmissão não autorizada de canais pagos.

| Família | Entradas | Hosts | Motivo |
| --- | ---: | --- | --- |
| AXN | 2 | `znty.dyndns.org`, `188.115.15.121` | Canal pago; restream |
| AXN Movies | 1 | `50.7.120.34` | IP literal + HTTP |
| Disney Channel | 2 | `151.80.18.177`, `zntx.dyndns.org` | Canal pago; restream |
| Sport TV 1/2/5/6/7/+ | 6 | `znty.dyndns.org`, `zntx.dyndns.org` | Canal pago; restream |
| Star Channel/Comedy/Crime/Life/Movies | 5 | `znty.dyndns.org` | Canais pagos; restream |
| TVI, TVI Ficção, TVI Reality, V+ TVI | 5 | `raw.githubusercontent.com/thomraider12`, `zntx.dyndns.org` | Só mirrors de terceiros |
| SIC Mulher, SIC Radical | 2 | `zntx.dyndns.org`, `znty.dyndns.org` | Restream |
| CNN Portugal | 1 | `github.com/thomraider12` | Mirror de terceiro |
| Kuriakos Music | 1 | `195.23.211.179` | IP literal + HTTP; pedir URL oficial |

> **Caso ambíguo:** a Kuriakos Music parece ser o próprio operador, mas só
> publica um manifesto HTTP num IP literal. Não é pirataria evidente como o
> cluster `znty`; é uma limitação técnica. Pede à Kuriakos uma URL HTTPS e, se
> existir, passa a recomendado.

### 5.1 Porque não incluí TVI e CNN Portugal

Não é por falta de qualidade — é por **falta de fonte oficial aberta**. No
`pt.m3u`, a TVI e a CNN Portugal só aparecem através de:

- `raw.githubusercontent.com/thomraider12/canaistvpt/...` (mirror de terceiro);
- `zntx.dyndns.org:8085/hls/tvi.m3u8` (restream).

Nenhum destes é adequado para produção. Se a TVI/CNN publicarem um HLS oficial
(como a RTP e a SIC fazem), acrescenta-se em minutos. Até lá, `rights: review`
e fora do catálogo.

### 5.2 O que fazer se um destes canais for essencial

1. Contactar o titular (Media Capital, Impresa, Disney/WBD, Sport TV).
2. Obter autorização escrita e territórios.
3. Usar a fonte oficial fornecida pelo titular (normalmente com DRM/token).
4. Nunca usar o `dyndns` como “fallback temporário”.

---

## 6. Lista pronta no formato `Channel`

Ficheiro:
[`data/channels/portugal.reference.ts`](../data/channels/portugal.reference.ts)

Exporta 20 objetos `Channel` e o array `PORTUGAL_CHANNELS_REFERENCE`. Exemplo:

```ts
export const CH_RTP1: Channel = {
  id: "rtp1",
  channelNumber: "100",
  name: "RTP 1",
  description: "Canal generalista público da RTP. Sinal oficial; pode estar limitado a Portugal.",
  logoColor: "from-sky-700 via-sky-800 to-slate-900",
  logoImage: "https://cdn-images.rtp.pt/common/img/channels/logos/color/horizontal/rtp1_2026.png",
  watermark: "RTP1",
  streamUrl: "https://streaming-live.rtp.pt/liverepeater/rtp1HD.smil/playlist.m3u8",
  headers: RTP_HEADERS,
  type: StreamType.HLS,
  country: Country.PORTUGAL,
  category: Category.GENERAL,
  language: "pt",
  resolution: "720p",
  status: "UNVERIFIED",
  tvgId: "RTP1.pt@HD",
  epgId: "RTP1.pt",
  source: "iptv-org",
  rights: "public",
  labels: ["Not 24/7"],
  group: "Variedades",
};
```

### 6.1 Compatibilidade com a interface que colaste

A interface real deste repositório (`types.ts`) difere em dois pontos:

| Interface que colaste | Interface real | Nota |
| --- | --- | --- |
| `fallbackUrls?: string[]` | `alternateStreams?: string[]` | Renomeado; o player usa `alternateStreams` |
| sem `watermark`, `status`, `tvgId`, `epgId`, `rights` | campos opcionais | Necessários para UI, EPG e auditoria |
| sem `headers` | `headers?: Record<string, string>` | Guardado, mas o browser ignora UA/Referer |

Se o teu fork ainda usa `fallbackUrls`, renomeia no objeto e no player:

```ts
// antes
alternateStreams: ["https://..."]
// depois (fork antigo)
fallbackUrls: ["https://..."]
```

`Category.PUBLIC` existe, mas o runtime usa `Category.EDUCATION` para a ARTV
(é um canal do Parlamento, não um serviço público generalista). Podes mudar se
preferires o badge “Público”.

Se a interface do teu fork não tiver `status`, `headers`, `tvgId` ou `epgId`,
remove essas linhas dos objetos; o resto (id, nome, URL, tipo, país, categoria)
é suficiente para o player básico.

### 6.2 Para o repositório `teip-tv`

Se o destino for `Paulo30Pinto/teip-tv` (interface com `fallbackUrls`, sem
`alternateStreams`/`headers`), usa o snippet pronto:

[`docs/teip-tv-portugal-channels.txt`](teip-tv-portugal-channels.txt)

- 19 canais (exclui **ON FM** e **SIC Replay**, que já existem no `teip-tv`).
- Grava como `data/channels/portugal.ts`.
- Importa em `constants.ts` e junta no fim da secção PORTUGAL.
- O snippet foi compilado contra o `types.ts` real do `teip-tv` (sem erros).

### 6.3 O que **não** fazer

```ts
// ❌ duplica os canais: já existem em LUSOFONIA_CHANNELS
import { PORTUGAL_CHANNELS_REFERENCE } from './data/channels/portugal.reference';
export const ALL = [...CHANNELS, ...PORTUGAL_CHANNELS_REFERENCE];
```

O ficheiro é **referência/migração**, não uma segunda fonte de verdade. A app
já carrega estes 20 canais a partir da curadoria.

---

## 7. Como adicionar ou alterar canais (recomendado)

1. Edita `data/lusofonia.curation.json`:
   ```json
   {
     "id": "SICAltaDefinicao.pt",
     "tvgId": "SICAltaDefinicao.pt@SD",
     "name": "SIC Alta Definição",
     "country": "PT",
     "appCategory": "Variedades",
     "priority": 30,
     "rights": "fast",
     "type": "hls",
     "logo": "https://i.imgur.com/VdPwyQv.png",
     "enabled": true,
     "epg": false,
     "notes": "FAST oficial SIC (Okast); validar rotação do path."
   }
   ```
2. Corre o pipeline:
   ```bash
   npm run sync:channels
   npm run sync:channels:check   # valida o manifesto
   ```
3. Confirma em `data/lusofonia.generated.json` que o canal tem
   `"status": "verified"` (ou `unverified` se não correste `--check`).
4. `npm run build` e testa na aba **Lusófonos**.

Vantagens: sem duplicação, o EPG é associado automaticamente e o workflow
semanal mantém a lista.

### 7.1 Alternativa rápida (só para protótipo)

Copiar os objetos de `portugal.reference.ts` para `constants.ts`, no fim da
secção de Portugal. Depois:

- remover os canais legados com o mesmo nome (ou vais ver duplicados);
- garantir que os IDs não colidem (`rtp-africa` já existe no legado);
- `npm run lint` e `npm run build`.

Esta via não é recomendada para produção: perdes a atualização automática e a
associação ao EPG.

---

## 8. Validação

### 8.1 Antes de publicar

```bash
# 1. O manifesto responde e é HLS?
curl -sI "https://streaming-live.rtp.pt/liverepeater/rtp1HD.smil/playlist.m3u8" | head
curl -s  "https://streaming-live.rtp.pt/liverepeater/rtp1HD.smil/playlist.m3u8" | head -5

# 2. Tem CORS? (o browser precisa de Access-Control-Allow-Origin)
curl -sI -H "Origin: http://localhost:3000" \
  "https://streaming-live.rtp.pt/liverepeater/rtp1HD.smil/playlist.m3u8" | grep -i access-control

# 3. O EPG existe?
curl -s https://iptv-org.github.io/api/guides.json | grep -o '"RTP1.pt"' | head
```

### 8.2 Na app

- Abrir cada canal e confirmar áudio/vídeo.
- Testar fora de Portugal (VPN não é solução; simular geobloqueio com um
  utilizador no estrangeiro).
- Verificar a mensagem de erro em caso de `403`/CORS.
- Confirmar que o EPG mostra programas reais e não “estimado”.

### 8.3 O que ainda não foi validado

- **Manifestos**: sem rede para os CDNs neste ambiente.
- **CORS**: idem.
- **Geobloqueio real**: depende do país do utilizador.
- **Rotação de paths FAST** (SIC Alta Definição/Replay): precisa de observação
  ao longo de alguns dias.

---

## 9. Riscos e conformidade

| Risco | Canal | Mitigação |
| --- | --- | --- |
| Geobloqueio | RTP, SIC, SIC Notícias, Rádio Sines | Mostrar aviso; não contornar com VPN |
| `User-Agent`/`Referer` | RTP, SIC | Proxy autorizado ou aceitar falha; o browser não os envia |
| CORS | todos | Testar; se falhar, proxy do operador com autorização |
| Direitos | todos | Rever termos; `rights` na curadoria |
| FAST com path rotativo | SIC Alta Definição/Replay | Health-check semanal; fallback |
| Restream | AXN/Sport TV/Star/Disney/TVI | **Não publicar** |

A inclusão de um canal no catálogo **não** é uma declaração de licença. Para
publicar comercialmente, confirma os termos de cada emissora.

---

## 10. Próximos passos

1. Correr `npm run sync:channels:check` numa máquina com rede e atualizar
   `status` dos 20 canais.
2. Validar SIC Alta Definição e SIC Replay; se estáveis, adicionar à curadoria.
3. Testar CORS dos 20 canais e documentar os que precisam de proxy.
4. Atualizar o EPG (`npm run sync:epg`) e confirmar `epgId` de cada canal.
5. Remover do catálogo legado o AXN e os restantes canais sem direitos.
