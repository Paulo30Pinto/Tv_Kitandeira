# Auditoria do iptv-org (fonte de canais)

**Data:** 19 de outubro de 2026  
**Objeto:** `github.com/iptv-org` — em especial `iptv-org/iptv` e as listas
`streams/pt.m3u`, `ao.m3u`, `br.m3u`, `mz.m3u`, `cv.m3u`, `st.m3u`, `tl.m3u`,
`gw.m3u`.  
**Método:** clone raso do repositório, leitura das playlists e dos metadados da
org; contagens feitas com um parser M3U próprio. Os números mudam a cada dia —
use-os como fotografia, não como contrato.

> **Conclusão em uma frase:** o `iptv-org` é excelente como **camada de
> descoberta** e péssimo como **dependência de produção ou licença**. Serve para
> encontrar canais e IDs; não serve para confirmar direitos, disponibilidade ou
> qualidade.

---

## 1. O que a organização contém

| Repositório | Papel | O que a TeIP usa |
| --- | --- | --- |
| `iptv-org/iptv` | Playlists M3U por país e por categoria (`streams/*.m3u`, `index.m3u`) | **Fonte da lista curada** (build-time) |
| `iptv-org/api` | JSON normalizado (`channels`, `feeds`, `streams`, `guides`, `categories`, `countries`, `languages`) | Consulta manual e futura validação |
| `iptv-org/epg` | *Grabber* de XMLTV (Node/Docker) e configurações por site | Base conceptual do `sync-epg` |
| `iptv-org/database` | CSVs de canais, feeds, logótipos, blocklist, países, idiomas | Metadados e logótipos |
| `iptv-org/awesome-iptv` | Lista de recursos | Não usado |

Não existe um repositório que aloje vídeo. Os URLs apontam para CDNs dos
operadores ou para servidores de terceiros.

### 1.1 O que o `iptv-org` declara

- É uma coleção de streams **publicamente disponíveis**.
- Não verifica a legalidade de cada URL.
- Remove canais quando o titular pede (DMCA/takedown) e mantém uma blocklist
  em `database/blocklist.csv`.
- Não garante disponibilidade, qualidade, EPG ou continuidade dos IDs.

Isto está alinhado com a prática: o projeto é um índice comunitário, não um
distribuidor.

---

## 2. Estrutura das playlists

Formato: M3U estendido.

```m3u
#EXTM3U
#EXTINF:-1 tvg-id="RTP1.pt@HD" tvg-logo="https://..." group-title="General",RTP 1
#EXTVLCOPT:http-user-agent=Mozilla/5.0
#EXTVLCOPT:http-referrer=https://www.rtp.pt/
https://streaming-live.rtp.pt/liverepeater/smil:rtp1.smil/playlist.m3u8
```

- **`tvg-id`** — identificador estável-ish (`Nome.cc@Qualidade`).
- **`tvg-logo`** — logótipo; muitos são do TMDB/Wikimedia e podem desaparecer.
- **`group-title` / `#EXTGRP`** — categoria.
- **`#EXTVLCOPT`** — headers exigidos por alguns servidores.
- **`[Geo-blocked]`, `[Not 24/7]`** — restrições declaradas no título.
- **Várias entradas por canal** — HD/SD/backup, por vezes em hosts diferentes.

O `tvg-id` é a única chave minimamente estável. O nome muda, a URL muda, o ID
tende a manter-se. É por isso que a curadoria da TeIP usa o ID e não o nome.

---

## 3. Números por país (fotografia de 2026-10-19)

| Lista | Entradas | `tvg-id` únicos | Hosts | HTTP | IP literal | Com UA/Referer | Geo-blocked | Not 24/7 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `pt.m3u` | 60 | 57 | 22 | 20 | 4 | 29 | 3 | 19 |
| `ao.m3u` | 3 | 3 | 3 | 0 | 0 | 0 | 0 | 0 |
| `br.m3u` | 452 | 275 | 191 | 213 | 188 | 9 | 11 | 40 |
| `mz.m3u` | 9 | 6 | 7 | 4 | 2 | 0 | 0 | 2 |
| `cv.m3u` | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| `st.m3u` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `tl.m3u` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `gw.m3u` | não existe | — | — | — | — | — | — | — |

Leituras:

- **Portugal é o único país com cobertura razoável.** Ainda assim, 24 das 60
  entradas (40%) estão fora de CDNs de operador: 16 em `dyndns`, 4 em GitHub
  de terceiros e 4 em IP literal (incluindo um canal religioso).
- **Angola tem 3 canais** (KKTV, Muzangala, TV Zimbo) e nenhum é um serviço
  público linear completo. A TPA não está na lista.
- **Moçambique tem 9 entradas / 6 IDs**, incluindo a TVM e a TVM Internacional
  (esta última só em HTTP/RTMP).
- **Cabo Verde tem 1 canal** (TV Cidade).
- **São Tomé, Timor-Leste e Guiné-Bissau não têm lista utilizável.** Qualquer
  cobertura destes países exige fontes próprias.
- **Brasil é abundante e ruidoso:** 452 entradas, 188 em IP literal, 213 em
  HTTP. A maioria são TVs municipais, religiosas e web TVs; poucas são canais
  nacionais com fonte oficial.

### 3.1 Duplicados e aliases

- O mesmo canal aparece com `@HD`, `@SD` e `@4K`; a curadoria escolhe uma.
- O mesmo stream pode aparecer em listas de países diferentes (ex.: RTP África
  em `pt` e canais internacionais).
- O mesmo `tvg-id` pode ter duas entradas com hosts distintos (TVI tem GitHub e
  dyndns; AXN tem dyndns e IP). O script ordena por score e guarda até duas.

---

## 4. Qualidade da lista portuguesa

### 4.1 O que é aproveitável

| Canal | Host | Situação |
| --- | --- | --- |
| RTP 1, 2, 3, Notícias, Memória, Mundo, África, Açores, Madeira | `streaming-live.rtp.pt` | Oficial; frequentemente geobloqueado fora de Portugal |
| SIC, SIC Notícias | `*.impresa.pt` | Oficial; `[Geo-blocked]` declarado |
| Porto Canal | `*.fastly.net` | Oficial/FAST |
| ARTV | `playout*.livextend.cloud` | Canal parlamentar; fonte operada |
| Kuriakos TV, Maná, Famatv, ONFM, RFPtv, NPC, Rádio Sines | vários | Maioria oficial/religiosa; verificar termos |
| ADB TV | `live-tv.waytv.pt` | Operador/FAST |

### 4.2 O cluster de pirataria

Estas entradas **não** devem ser publicadas sem contrato:

| Grupo | Canais | Host |
| --- | --- | --- |
| Sport TV | Sport TV1, 2, 5, 6, 7, + | `znty.dyndns.org:5010`, `zntx.dyndns.org:8085` |
| AXN | AXN, AXN Movies | `znty.dyndns.org`, `50.7.120.34`, `188.115.15.121` |
| Disney | Disney Channel | `zntx.dyndns.org`, `151.80.18.177` |
| Star | Star Channel, Comedy, Crime, Life, Movies | `znty.dyndns.org` |
| TVI | TVI, TVI Ficção, TVI Reality, V+ TVI | `raw.githubusercontent.com/thomraider12/canaistvpt`, `zntx.dyndns.org` |
| SIC | SIC Mulher, SIC Radical | `zntx.dyndns.org`, `znty.dyndns.org` |
| CNN Portugal | CNN Portugal | `github.com/thomraider12/canaistvpt` |

Sinais de alerta que se repetem:

- `dyndns` e IPs literais — infraestrutura doméstica/revenda, não CDN oficial.
- Repositório GitHub de terceiro a servir `.m3u8` de canais premium.
- O mesmo host serve canais de grupos concorrentes (Sport TV + Disney + Star).
- Não há página oficial do operador a apontar para esses URLs.
- Os canais são pagos por subscrição em Portugal.

Isto é compatível com **retransmissão não autorizada**. O facto de estar numa
lista pública não muda a natureza.

### 4.3 Disponibilidade

- 19 entradas têm `[Not 24/7]`; outras tantas estão mortas sem rótulo.
- `[Geo-blocked]` só aparece em 3; muitos canais falham por geobloqueio sem
  estar marcados.
- URLs com `token=` expiram.
- Streams em `raw.githubusercontent.com` podem ser removidos por DMCA a
  qualquer momento.
- O `iptv-org` não faz health-check contínuo de todas as URLs.

---

## 5. EPG no iptv-org

### 5.1 O que existe

- `iptv-org/epg` — *grabber* que visita os sites dos canais e gera XMLTV.
- `iptv-org/api` → `guides.json` — mapa `channel` → `sources[]` com URLs de
  guias.
- `GUIDES.md` — lista de hosts comunitários; à data, poucos e marcados como
  instáveis/vermelhos.

### 5.2 O que não existe

- **Não há garantia de um XMLTV público único e atualizado.**
- Os endpoints antigos `iptv-org.github.io/epg/guides/...` deixaram de ser uma
  solução estável; muitos guias foram removidos ou mudaram de sítio.
- Muitos sites não têm grelha em XML; o grabber faz scraping de HTML/JSON.
- Canais FAST raramente têm grelha.
- O guia cobre poucos dias e pode vir em `ISO-8859-1` ou gzip.

### 5.3 Implicação para a TeIP

- O guia é **gerado no CI** (`scripts/sync-epg.mjs`) e publicado como
  `/epg/lusofonia.xml`.
- A app **não** consulta o iptv-org em runtime.
- Se o guia falhar, mantém-se o último snapshot e a UI mostra “estimado” em vez
  de inventar programas.
- Canais sem fonte ficam com `epg: false` (ex.: TPA Online).

---

## 6. APIs e IDs

Endpoints úteis (quando a rede permite):

```
https://iptv-org.github.io/api/channels.json
https://iptv-org.github.io/api/streams.json
https://iptv-org.github.io/api/guides.json
https://iptv-org.github.io/api/categories.json
https://iptv-org.github.io/api/countries.json
https://iptv-org.github.io/api/languages.json
```

Formato de `guides.json` (resumo):

```json
[
  {
    "channel": "RTP1.pt",
    "feed": "HD",
    "site": "rtp.pt",
    "site_id": "...",
    "site_name": "RTP",
    "lang": "pt",
    "sources": [{ "host": "...", "url": "https://...xml", "format": "xmltv" }]
  }
]
```

O `channel` é o `tvg-id` sem `@HD`. É esta a chave que a TeIP usa como `epgId`.

### 6.1 Armadilhas de IDs

- `RTP1.pt@HD` → `RTP1.pt` (remover qualidade).
- `RTPAcores.pt@SD` → `RTPAcores.pt` (não `RTPAcores`).
- Nomes com pontos (`RTP.Mundo.pt`) exigem cuidado: o país é o **último**
  segmento, não o primeiro.
- O mesmo canal pode ter feeds diferentes; o `feed` em `guides.json` pode
  distinguir HD/SD.

---

## 7. Legalidade e conformidade

### 7.1 O que o iptv-org não faz

- Não celebra contratos de distribuição.
- Não verifica se o URL é autorizado.
- Não paga royalties.
- Não garante que o stream continue disponível.
- Não oferece indemnização se o utilizador for notificado.

### 7.2 O que a lei aplicável exige (em geral)

- Autorização do titular para comunicar publicamente a obra.
- Respeito por restrições territoriais e DRM.
- Processo de retirada (notice and takedown).
- Registo de proveniência dos streams.
- Cumprimento das condições de uso dos sites de origem (muitos proíbem
  *scraping* e *hotlinking*).

### 7.3 Matriz de risco

| Tipo de fonte | Exemplo | Risco | Decisão |
| --- | --- | --- | --- |
| Emissora pública no domínio oficial | `streaming-live.rtp.pt` | Médio (termos/geobloqueio) | Rever termos; manter se autorizado |
| Operador/FAST no domínio do operador | `sic.live.impresa.pt` | Médio | Rever contrato/termos |
| Canal parlamentar/estatal | `camara.gov.br`, ARTV | Baixo–médio | Confirmar termos de reutilização |
| Embed oficial do YouTube | TPA Online | Médio | Usar o embed oficial, não descarregar |
| Restream em dyndns/IP | Sport TV, AXN | **Alto** | **Não publicar** |
| Mirror em GitHub de terceiro | TVI, CNN Portugal | **Alto** | **Não publicar** |
| Canal premium sem DRM | Disney, Star | **Alto** | **Não publicar** |

### 7.4 Regra operacional da TeIP

1. `rights: review` nunca entra em produção.
2. `rights: public`/`official` exige URL no domínio do titular e revisão de
   termos.
3. `rights: fast` exige referência aos termos do agregador.
4. Qualquer pedido de titular → `enabled: false` imediato.
5. Guardar prova (URL, data, contacto) fora do repositório.

---

## 8. Fiabilidade e manutenção

| Problema | Frequência | Mitigação na TeIP |
| --- | --- | --- |
| URL muda | Alta | `alternateStreams` + sync semanal |
| Stream morre | Alta | `--check` + estado `offline` |
| Geobloqueio | Alta | `labels` + mensagem específica no player |
| Token expira | Média | Score penaliza `token=`; preferir URLs sem token |
| DMCA remove entrada | Média | Curadoria local; não depender do upstream em runtime |
| Guia EPG desaparece | Alta | Snapshot próprio + cache + fallback estimado |
| Logótipo 404 | Alta | Fallback para iniciais; `logo` manual |
| `tvg-id` muda | Baixa | Chave de curadoria + revisão do diff |

O sync semanal é o compromisso razoável: os URLs mudam mais depressa do que
isso, mas um sync diário gera ruído e aumenta o risco de apanhar um stream
temporariamente quebrado.

---

## 9. O que a TeIP faz com isto (decisões)

| Decisão | Porquê |
| --- | --- |
| Lista curada em JSON, não playlist remota | Revisão de direitos e estabilidade |
| IDs `lusofonia-*` e números 100+ | Não colidir com o catálogo legado |
| `tvgId` + `epgId` no modelo | Casar canais com XMLTV sem depender do nome |
| Política de hosts (HTTPS, sem IP, sem GitHub de terceiros) | Reduzir risco e streams instáveis |
| `denyHosts` para `znty`/`zntx` | Excluir o cluster de pirataria conhecido |
| `--check` opcional | Detetar mortos sem bloquear o build |
| EPG gerado no CI | Evitar CORS e dependência de terceiros |
| Cache IndexedDB | Offline e arranque rápido |
| Estado `UNVERIFIED` no cartão | Não prometer “AO VIVO” sem prova |

---

## 10. Como verificar você mesmo

### 10.1 Clonar e contar

```bash
git clone --depth 1 https://github.com/iptv-org/iptv.git /tmp/iptv
cd /tmp/iptv/streams
wc -l pt.m3u ao.m3u br.m3u mz.m3u cv.m3u st.m3u tl.m3u
grep -c '^#EXTINF' pt.m3u
grep -o 'tvg-id="[^"]*"' pt.m3u | sort -u | wc -l
```

### 10.2 Ver hosts suspeitos

```bash
grep -Eo 'https?://[^/]+' pt.m3u | sort | uniq -c | sort -rn | head -20
grep -nE 'dyndns|githubusercontent|https?://[0-9]' pt.m3u
```

### 10.3 Ver rótulos

```bash
grep -c 'Geo-blocked' pt.m3u
grep -c 'Not 24/7' pt.m3u
```

### 10.4 Testar um manifesto

```bash
curl -sI "https://streaming-live.rtp.pt/liverepeater/smil:rtp1.smil/playlist.m3u8" | head
curl -s "https://streaming-live.rtp.pt/liverepeater/smil:rtp1.smil/playlist.m3u8" | head -5
```

Um `200` com `#EXTM3U` é o mínimo. Não prova que o vídeo toca no browser
(CORS/geobloqueio/segmentos).

### 10.5 Ver guias

```bash
curl -s https://iptv-org.github.io/api/guides.json | head -40
```

Se o endpoint não responder, o `sync-epg` mantém o último snapshot.

---

## 11. Veredicto

| Critério | Nota | Comentário |
| --- | :---: | --- |
| Cobertura Portugal | 7/10 | RTP/SIC/FAST, mas 40% das entradas fora de CDN oficial |
| Cobertura Angola | 3/10 | 3 canais; TPA ausente |
| Cobertura Brasil | 6/10 | Muitos canais, mas 42% em IP e muito ruído |
| Cobertura PALOP | 2/10 | MZ 6 IDs, CV 1, ST/TL/GW nada |
| Qualidade dos metadados | 6/10 | `tvg-id` útil; logótipos e grupos inconsistentes |
| EPG | 3/10 | Sem guia público garantido; grabber exige operação |
| Legalidade | 2/10 | Índice sem licenças; cluster premium evidente |
| Estabilidade | 4/10 | URLs mudam; sem SLA |
| Utilidade como camada de descoberta | **9/10** | Ótimo para encontrar canais e IDs |

**Recomendação:** usar o `iptv-org` para **descobrir** canais e IDs, nunca como
fonte em runtime, e nunca como prova de direitos. A TeIP já segue este modelo:
lista curada, política de hosts, sync semanal, EPG próprio e estado honesto.

---

## 12. Referências

- `https://github.com/iptv-org/iptv`
- `https://github.com/iptv-org/api`
- `https://github.com/iptv-org/epg`
- `https://github.com/iptv-org/database`
- `https://iptv-org.github.io/api/guides.json`
- [`../AUDITORIA.md`](../AUDITORIA.md) — auditoria da aplicação TeIP
- [`LUSOFONIA.md`](LUSOFONIA.md) — guia de implementação
- [`CANAIS.md`](CANAIS.md) — catálogo incluído e exclusões
