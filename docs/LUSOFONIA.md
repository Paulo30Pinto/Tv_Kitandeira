# Guia de implementação — canais da lusofonia e EPG

Este guia explica, passo a passo, como a lista de canais e o guia de programação
foram integrados na TeIP e como você pode acrescentar, testar e manter canais.

**Estado atual:** 56 canais curados (Portugal 20, Angola 4, Brasil 26,
Moçambique 5, Cabo Verde 1) e um pipeline que aceita também São Tomé e
Príncipe, Timor-Leste e Guiné-Bissau.

> **Leia primeiro a secção 1.5 e a secção 4.** Para os números e riscos da
> fonte, ver [`IPTV-ORG.md`](IPTV-ORG.md). O `iptv-org` é um índice de URLs
> públicos, **não** uma licença de retransmissão. Vários streams da lista
> `pt.m3u` são restreams não autorizados de canais pagos. A lista curada da
> TeIP exclui-os; não os volte a introduzir sem um contrato.

---

## Índice

1. [Entender o iptv-org](#1-entender-o-iptv-org-antes-de-importar)
2. [Arquitetura escolhida](#2-arquitetura-escolhida)
3. [Primeira execução](#3-primeira-execução)
4. [Fase 1 — Curadoria e direitos](#4-fase-1-curadoria-e-direitos)
5. [Fase 2 — Gerar e testar a lista](#5-fase-2-gerar-e-testar-a-lista)
6. [Fase 3 — EPG XMLTV](#6-fase-3-epg-xmltv)
7. [Fase 4 — Atualização automática](#7-fase-4-atualização-automática)
8. [Fase 5 — Build e deploy](#8-fase-5-build-e-deploy)
9. [Operação e manutenção](#9-operação-e-manutenção)
10. [Resolução de problemas](#10-resolução-de-problemas)
11. [Referência rápida](#11-referência-rápida)

---

## 1. Entender o iptv-org antes de importar

### 1.1 O que é

- `iptv-org/iptv` — repositório de **playlists** M3U, uma por país
  (`streams/pt.m3u`, `streams/ao.m3u`, `streams/br.m3u`, …).
- `iptv-org/api` — dados normalizados em JSON (`channels.json`, `streams.json`,
  `guides.json`, `categories.json`, …), publicado em
  `https://iptv-org.github.io/api/`.
- `iptv-org/epg` — *grabber* que gera XMLTV a partir dos sites dos canais.
  O projeto **não** publica um guia único garantido; cada utilizador deve
  gerar ou alojar o seu.
- `iptv-org/database` — CSV com metadados (país, idioma, logótipo, categoria).

O repositório **não aloja vídeo**. Cada URL pertence a quem a opera. Muitas são
oficiais (RTP, EBC, Câmara dos Deputados), muitas são FAST (Canela, Samsung TV
Plus) e muitas são restreams de terceiros. O iptv-org remove canais por pedido
do titular, mas isso não valida os restantes.

### 1.2 Anatomia de uma entrada

```m3u
#EXTM3U
#EXTINF:-1 tvg-id="RTP1.pt@HD" tvg-logo="https://..." group-title="General",RTP 1
#EXTVLCOPT:http-user-agent=Mozilla/5.0
#EXTVLCOPT:http-referrer=https://www.rtp.pt/
https://streaming-live.rtp.pt/liverepeater/smil:rtp1.smil/playlist.m3u8
```

| Campo | Para que serve | Como usamos |
| --- | --- | --- |
| `tvg-id` | Identificador do canal no formato `Nome.cc@Qualidade` | Chave de curadoria e de EPG (`epgId` sem `@HD`) |
| `tvg-logo` | Logótipo | `logo` no JSON; pode ser substituído na curadoria |
| `group-title` | Categoria | Mapeado para `appCategory` / `Category` |
| `#EXTVLCOPT` | `user-agent`, `referrer`, `origin`, `cookie` | Guardado em `headers`; **o browser não permite** definir UA/Referer |
| `[Geo-blocked]`, `[Not 24/7]` | Restrições declaradas | Guardado em `labels`; penaliza o ranking |
| URL | Manifesto HLS | Testado com `--check` antes de publicar |

### 1.3 O que é `tvg-id`

É a chave mais importante. Exemplos reais:

```
RTP1.pt@HD          → canal RTP1, país pt, variante HD
RTPAfrica.pt@SD     → RTP África, SD
SIC.pt@SD           → SIC, SD
TVZimbo.ao@SD       → TV Zimbo, Angola
```

Regras práticas:

- O sufixo depois de `@` é a qualidade, não faz parte do ID lógico.
- O sufixo depois do último ponto é o país (`pt`, `ao`, `br`, `mz`, `cv`).
- O mesmo canal pode ter várias entradas (HD, SD, backup). A curadoria escolhe
  a melhor e guarda até duas em `alternateStreams`.

### 1.4 Como o EPG se liga ao canal

O XMLTV identifica canais por `<channel id="...">`. O iptv-org usa o mesmo
`tvg-id` sem a qualidade (`RTP1.pt`). A app tenta, por esta ordem:

1. `epgId` do canal (`RTP1.pt`);
2. `tvgId` sem `@HD`;
3. `id` do canal (`lusofonia-rtp1.pt`);
4. `display-name` do XMLTV igual ao nome curado (sem acentos/maiúsculas).

Se nada casar, o canal continua a funcionar, mas a grelha é estimada.

### 1.5 A limitação dos `#EXTVLCOPT` (importante)

O browser **proíbe** que JavaScript defina `User-Agent` e `Referer` em
pedidos XHR/fetch. O `hls.js` aceita `xhrSetup`, mas esses dois headers são
ignorados pelo browser. Consequências:

- Se um stream exigir `Referer`, ele **não toca** diretamente no browser.
- A solução legítima é um **proxy seu**, alojado por si, que acrescente os
  headers e sirva apenas canais que você tem direito de distribuir.
- Nunca use um proxy para contornar geobloqueio ou para servir canais pagos.

O player guarda os headers no modelo e tenta aplicá-los; quando o browser os
bloqueia, mostra uma mensagem de erro em vez de falhar em silêncio. O código do
proxy não faz parte deste repositório porque exige infraestrutura e revisão
jurídica.

### 1.6 Geobloqueio, DRM e disponibilidade

- Muitos canais portugueses só emitem em Portugal (RTP, SIC, TVI). Fora da UE,
  o manifesto pode devolver `403` ou uma playlist vazia.
- Sport TV, AXN, Disney, Star e TVI Ficção exigem subscrição/DRM. Não há
  stream HLS aberto legítimo.
- Canais FAST (Canela, Samsung TV Plus, Pluto) mudam de URL com frequência.
- `[Not 24/7]` significa que o canal emite apenas parte do dia; não é um erro.

---

## 2. Arquitetura escolhida

```
data/lusofonia.curation.json          ← você edita (fonte de verdade)
            │
            ▼
scripts/sync-lusofonia.mjs            ← descarrega iptv-org, valida, deduplica
            │
            ▼
data/lusofonia.generated.json         ← artefacto (commit no repo)
            │
            ▼
src/data/lusofonia.ts                 ← adapta ao modelo Channel
src/data/channels.ts                  ← junta ao catálogo legado
            │
            ▼
App.tsx / EPGGuide / StreamPlayer

scripts/sync-epg.mjs                  ← descarrega XMLTV e funde
            │
            ▼
public/epg/lusofonia.xml              ← servido pela própria app (sem CORS)
            │
            ▼
src/epg/epgService.ts → IndexedDB → useEpg()
```

**Porquê lista estática e não fetch em runtime?**

- O `iptv-org` não garante CORS nem disponibilidade.
- Um fetch em runtime faz a app depender de um terceiro e pode trazer canais
  novos sem revisão de direitos.
- A lista é revista, testada e versionada; o utilizador vê sempre o mesmo
  catálogo e o build é reproduzível.
- A atualização é automática (GitHub Actions semanal), mas passa por revisão
  no diff do commit.

**Porquê EPG no mesmo domínio?**

- Evita CORS e permite cache pelo service worker.
- Permite guardar o guia em IndexedDB e funcionar offline.
- O guia é regenerado no CI; se falhar, o último snapshot válido é mantido.

---

## 3. Primeira execução

Requisitos: Node 20+ (o CI usa 22), npm e Git.

```bash
git clone https://github.com/Paulo30Pinto/Tv_Kitandeira.git
cd Tv_Kitandeira
npm ci
npm run dev
```

Abrir `http://localhost:3000`.

Verificar:

- [ ] O separador **Lusófonos** mostra 56 canais.
- [ ] Cada cartão mostra o país e a categoria.
- [ ] O separador **Programação (EPG)** abre a grelha.
- [ ] Sem snapshot EPG, a grelha diz “estimada” (é o comportamento correto).

Build de produção:

```bash
npm run build
npm run preview
```

---

## 4. Fase 1: curadoria e direitos

### 4.1 Classificar antes de adicionar

Antes de tocar no JSON, responda a três perguntas:

1. **Quem é o titular?** Emissora, operador, produtor ou agregador?
2. **A URL é do titular?** Um domínio oficial (`rtp.pt`, `ebc.com.br`,
   `camara.gov.br`) é melhor do que um CDN de terceiro.
3. **Que direitos temos?** Serviço público, FAST com termos públicos,
   autorização escrita, ou “desconhecido”.

Classificação usada no campo `rights`:

| Valor | Significado | Pode publicar? |
| --- | --- | --- |
| `public` | Emissora pública, stream oficial | Sim, com revisão dos termos e geobloqueio |
| `official` | Operador/FAST no domínio do operador | Sim, se os termos permitirem embed/retransmissão |
| `fast` | Canal FAST agregado (Canela, Samsung, etc.) | Só com contrato/termos aplicáveis |
| `review` | Fonte duvidosa ou desconhecida | **Não**; fica desativado |

O script **não** decide direito por si. O campo `rights` é uma declaração sua;
guarde a prova (URL, contrato, email) fora do repositório e referencie-a nas
notas internas.

### 4.2 Ficheiro de curadoria

Editar `data/lusofonia.curation.json`. Estrutura:

```json
{
  "schemaVersion": 1,
  "policy": {
    "allowHttp": false,
    "allowIpHost": false,
    "allowThirdPartyGithub": false,
    "denyHosts": ["znty.dyndns.org", "zntx.dyndns.org"],
    "maxSourcesPerChannel": 2
  },
  "channels": [
    {
      "id": "RTP1.pt",
      "tvgId": "RTP1.pt",
      "name": "RTP 1",
      "country": "PT",
      "appCategory": "Variedades",
      "priority": 10,
      "rights": "public",
      "type": "hls",
      "logo": "https://cdn-images.rtp.pt/.../rtp1_2026.png",
      "enabled": true,
      "epg": true,
      "notes": "Canal público RTP. Pode estar limitado a Portugal."
    }
  ]
}
```

| Campo | Obrigatório | Regra |
| --- | :---: | --- |
| `id` | Sim | `<tvg-id sem @qualidade>.<cc>`, único. É também a chave de match. |
| `tvgId` | Sim | ID exato do iptv-org. Pode incluir `@HD`/`@SD`. |
| `name` | Sim | Nome mostrado na app. |
| `country` | Sim | `PT`, `AO`, `BR`, `MZ`, `CV`, `ST`, `TL`, `GW`. |
| `appCategory` | Sim | `Variedades`, `Notícias`, `Infantil`, `Desporto`, `Educação & Gov`, `Internacional`, `Música`, `Filme`, `Novelas`, `Séries`, `Desenhos`, `Anime`. |
| `priority` | Sim | Menor = aparece primeiro. Números 10–99 por país. |
| `rights` | Sim | `public`, `official`, `fast` ou `review`. |
| `type` | Não | `hls` ou `youtube`. Deteta-se pelo URL se faltar. |
| `logo` | Não | URL HTTPS. Sem logo, usa as iniciais. |
| `enabled` | Não | `false` mantém a entrada documentada mas fora da lista. |
| `epg` | Não | `false` desliga o EPG para este canal. |
| `manualUrl` | Não | URL oficial fora do iptv-org; **ganha prioridade absoluta**. |
| `policy` | Não | Override local da política de hosts (use com justificação em `notes`). |
| `notes` | Não | Contexto e restrições. Aparece na descrição do canal. |

### 4.3 Acrescentar um canal: passo a passo

> Para o caso português, a análise do `pt.m3u` e uma lista de 20 canais já
> prontos estão em [`PORTUGAL.md`](PORTUGAL.md).

Exemplo: acrescentar um novo canal oficial `CanalExemplo.pt`.

**Passo 1 — encontrar o `tvg-id`.** Consulte `streams/pt.m3u` no repositório
`iptv-org/iptv` (ou clone local, ver 5.2). Procure o nome do canal e copie o
`tvg-id` exatamente:

```m3u
#EXTINF:-1 tvg-id="CanalExemplo.pt@HD" ... ,Canal Exemplo
https://cdn.canalexemplo.pt/live/master.m3u8
```

**Passo 2 — confirmar a fonte.** Abra o URL no navegador ou execute:

```bash
curl -sI "https://cdn.canalexemplo.pt/live/master.m3u8" | head
curl -s "https://cdn.canalexemplo.pt/live/master.m3u8" | head -5
```

Deve devolver `200`, `content-type` de HLS e `#EXTM3U`. Se devolver `403`,
`404` ou HTML, não adicione ainda.

**Passo 3 — verificar se o domínio é do titular.** Se for um IP, `dyndns`,
`github.io`, `raw.githubusercontent.com` ou um domínio de terceiro, classifique
como `review` e **não ative**.

**Passo 4 — acrescentar ao JSON**, respeitando a ordem de `priority`:

```json
{
  "id": "CanalExemplo.pt",
  "tvgId": "CanalExemplo.pt@HD",
  "name": "Canal Exemplo",
  "country": "PT",
  "appCategory": "Variedades",
  "priority": 30,
  "rights": "official",
  "type": "hls",
  "logo": "https://cdn.canalexemplo.pt/logo.png",
  "enabled": true,
  "epg": true,
  "notes": "Stream oficial do operador; verificado em 2026-10-19."
}
```

**Passo 5 — correr o sync** (secção 5) e confirmar que aparece em
`data/lusofonia.generated.json` com `status` correto.

**Passo 6 — rebuild e testar na app** (aba Lusófonos, tecla `C`, procurar o
canal). Confirmar que toca e que não há erro de CORS.

**Passo 7 — EPG.** Se o canal tiver `epgId`, correr `npm run sync:epg` e
verificar se aparece no guia (secção 6.3). Se não houver guia para ele, a app
mostra grelha estimada; não é erro.

### 4.4 Canal sem entrada no iptv-org

Use `manualUrl` com uma URL **oficial**:

```json
{
  "id": "TPAOnline.ao",
  "tvgId": "TPAOnline.ao",
  "name": "TPA Online",
  "country": "AO",
  "appCategory": "Variedades",
  "priority": 33,
  "rights": "official",
  "type": "youtube",
  "manualUrl": "https://www.youtube.com/embed/live_stream?channel=UCpf7-LhTbmKk11p4nqw5LYA",
  "enabled": true,
  "epg": false,
  "notes": "Emissão oficial da TPA no YouTube."
}
```

Notas:

- O `id` continua a precisar do sufixo do país para o script saber que lista
  carregar (mesmo com `manualUrl`).
- Para YouTube, use o URL `/embed/live_stream?channel=...` ou `/embed/<id>`.
- O EPG de YouTube não existe no `guides.json`; use `epg: false`.
- Se a fonte oficial for um `.m3u8`, use `type: "hls"`.

### 4.5 Desativar ou remover

- **Desativar** (recomendado): `"enabled": false`. O canal desaparece da app
  mas fica documentado e o histórico de direitos mantém-se.
- **Remover**: apague o objeto. O canal sai da lista e do EPG no próximo sync.
- Nunca edite `data/lusofonia.generated.json` à mão — é substituído.

### 4.6 Política de hosts

Por omissão, o script rejeita:

- `http://` (só HTTPS);
- IPs literais e IPs privados/loopback;
- `github.com` / `raw.githubusercontent.com` (mirrors de terceiros);
- hosts em `denyHosts` (`znty.dyndns.org`, `zntx.dyndns.org`).

Se precisar de uma exceção, use `policy` no canal e explique em `notes`:

```json
"policy": { "allowHttp": true, "denyHosts": [] }
```

Isto não torna a fonte legal. É apenas uma decisão técnica.

---

## 5. Fase 2: gerar e testar a lista

### 5.1 Modo online (normal)

```bash
npm run sync:channels
```

O script descarrega `https://iptv-org.github.io/iptv/streams/{pt,ao,br,mz,cv}.m3u`
e, se falhar, tenta `raw.githubusercontent.com/iptv-org/iptv/master/streams/...`.

Saída esperada:

```
[lusofonia] curadoria: 57 canais, países: pt, ao, br, mz, cv
[lusofonia]   pt: 152 streams
...
[lusofonia] gerado data/lusofonia.generated.json: 56 canais
[lusofonia] stats: { curated: 57, included: 56, verified: 0, unverified: 55, youtube: 1, noSource: 1 }
```

`TVMInternacional.mz` fica em `noSource` porque a única fonte do iptv-org é
HTTP/RTMP e a política exige HTTPS.

### 5.2 Modo offline (clone local)

Útil quando a rede bloqueia `iptv-org.github.io` ou para revisões reproduzíveis:

```bash
git clone --depth 1 https://github.com/iptv-org/iptv.git vendor/iptv
IPTV_STREAMS_DIR="$PWD/vendor/iptv/streams" npm run sync:channels
```

`vendor/` está no `.gitignore`. Não faça commit do clone.

### 5.3 Testar os streams

```bash
npm run sync:channels:check
```

Para cada canal, o script faz um `GET` com `Range: bytes=0-2048`, verifica
`#EXTM3U` e grava `status`:

| `status` | Significado | UI |
| --- | --- | --- |
| `verified` | Manifesto respondeu com HLS válido | “AO VIVO” |
| `unverified` | Ainda não foi testado | “POR TESTAR” |
| `offline` | Falhou no último teste | “OFFLINE” |
| `youtube` | Embed oficial | “AO VIVO” |

Cuidados:

- Um `200` não garante que o vídeo toca (pode haver geobloqueio no segmento).
- Muitos canais limitam pedidos por IP; o CI pode ver `403` onde a sua máquina
  vê `200`.
- `--check` demora; `--strict` remove canais cujo **primeiro** stream falhou.
  Não use `--strict` no CI sem revisar o diff, porque uma falha temporária
  remove o canal da app.

### 5.4 O que o script escreve

`data/lusofonia.generated.json`:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-10-19T...",
  "generator": "scripts/sync-lusofonia.mjs",
  "upstream": { "project": "iptv-org/iptv", "lists": { "pt": "..." } },
  "stats": { "curated": 57, "included": 56, "verified": 0, ... },
  "channels": [
    {
      "id": "RTP1.pt",
      "tvgId": "RTP1.pt",
      "epgId": "RTP1.pt",
      "name": "RTP 1",
      "country": "PT",
      "appCategory": "Variedades",
      "rights": "public",
      "language": "Português",
      "logo": "...",
      "streamUrl": "...",
      "alternateStreams": ["..."],
      "headers": { "user-agent": "..." },
      "labels": [],
      "quality": "1080p",
      "status": "unverified",
      "checkedAt": null,
      "notes": "..."
    }
  ]
}
```

Se **todas** as listas falharem, o script aborta sem tocar no ficheiro antigo.
Se um canal não tiver fonte compatível, fica em `noSource` e não entra.

### 5.5 Como a lista chega à UI

`src/data/lusofonia.ts` lê o JSON no build (import estático), converte para
`Channel` e atribui:

- `id`: `lusofonia-rtp1.pt`
- `channelNumber`: 100 + índice
- `source`: `iptv-org`
- `tvgId`/`epgId`: preservados
- `rights`: `public`/`official`/…
- `status`: `ONLINE`/`OFFLINE`/`UNVERIFIED`

`src/data/channels.ts` junta com os 29 canais legados. Se o nome normalizado
coincidir, a versão curada ganha (RTP África, TV Zimbo, CNN Brasil, etc.).
Os canais legados mantêm IDs e números para não quebrar favoritos.

Para confirmar no browser, abra a consola:

```js
// depois de carregar a app
document.querySelectorAll('h3').length
```

Ou, em Node, sem browser:

```bash
node -e "const d=require('./data/lusofonia.generated.json'); console.log(d.stats); console.log(d.channels.map(c=>c.id).join('\n'))"
```

---

## 6. Fase 3: EPG XMLTV

### 6.1 Como funciona

1. `data/lusofonia.generated.json` dá a lista de canais com `epgId`.
2. `scripts/sync-epg.mjs` lê `https://iptv-org.github.io/api/guides.json`,
   que associa `channel` → `sources[].url`.
3. Descarrega cada XMLTV (com gzip/latin1), faz parsing, filtra a janela
   `agora − 12 h` … `agora + 7 dias` e funde num único guia.
4. Escreve `public/epg/lusofonia.xml` e `public/epg/lusofonia.meta.json`.
5. A app pede `/epg/lusofonia.xml`. Se já tiver cache válida (6 h), usa-a.
   Se a rede falhar, usa a cópia em IndexedDB até 7 dias.
6. `useEpg()` expõe `status`, `refresh()`, `getPrograms()`, `getNowNext()`,
   `hasRealEpg`.

O guia é **um só ficheiro** para todos os canais; não há pedidos por canal.

### 6.2 Correr

```bash
npm run sync:epg
```

Saída esperada:

```
[epg] a obter https://iptv-org.github.io/api/guides.json
[epg] 31 fontes XMLTV para 55 canais (máx. 40)
[epg]   + 812 programas de https://...
[epg] escrito public/epg/lusofonia.xml — 42 canais, 5900 programas, 480 KB
```

Opções:

```bash
node scripts/sync-epg.mjs --max-sources=20 --verbose
node scripts/sync-epg.mjs --input=./fixtures/guide.xml   # testar um XMLTV local
EPG_GUIDES_FILE=./fixtures/guides.json npm run sync:epg  # guias locais
EPG_FIXTURE_DIR=./fixtures/xml EPG_MAX_SOURCES=10 npm run sync:epg
```

### 6.3 Verificar o resultado

```bash
ls -lh public/epg/
head -40 public/epg/lusofonia.xml
grep -c "<programme" public/epg/lusofonia.xml
python3 - <<'EOF'
import json
m=json.load(open('public/epg/lusofonia.meta.json'))
print(m['channels'], m['programmes'], len(m['sources']), len(m['failedSources']))
for f in m['failedSources'][:5]: print('-', f['reason'], f['url'])
EOF
```

Validar o XML (se tiver `xmllint`):

```bash
xmllint --noout public/epg/lusofonia.xml
```

### 6.4 Porque alguns canais não têm grelha

- O `guides.json` não tem fonte para esse canal (ex.: TPA Online, canais FAST
  sem site com grelha).
- A fonte devolve HTML/JSON em vez de XMLTV.
- O canal tem `epg: false`.
- O guia só cobre parte do dia.
- A fonte mudou de URL; aparece em `failedSources` com o motivo.

A app **não inventa** programas quando não há guia: mostra a grelha estimada
por categoria, marcada como tal.

### 6.5 Acrescentar uma fonte EPG externa

Se tiver um XMLTV próprio (com CORS), acrescente em `data/epg.sources.json`:

```json
{
  "snapshotUrl": "/epg/lusofonia.xml",
  "sources": ["https://epg.exemplo.pt/guia.xml"],
  "refreshHours": 6,
  "maxStaleHours": 168,
  "maxDays": 7
}
```

Regras:

- O XMLTV tem de usar o mesmo `epgId` (`RTP1.pt`) ou um `display-name` igual.
- CORS é obrigatório para fontes externas; o snapshot local não precisa.
- `sources` é tentado **depois** do snapshot. Se o snapshot já tiver programas,
  as fontes externas não são necessárias para o arranque.
- Se a fonte externa falhar, a app mantém a cache e mostra um aviso.

### 6.6 Cache e offline

- Chave: URL do guia (`teip-epg` / store `guides`).
- Frescura: `refreshHours` (6 h). Depois disso tenta a rede.
- Se a rede falhar: usa a cópia até `maxStaleHours` (168 h = 7 dias) e marca
  `stale: true`.
- Se não houver cache: `programmeCount === 0` e a UI usa a grelha estimada.
- Para forçar: botão de atualizar no `EPGGuide` ou `refresh({ force: true })`.
- O service worker também guarda `/epg/` em network-first, apenas respostas
  `content-type: xml`.

### 6.7 Testar o parser sem rede

O parser foi validado com um fixture. Para repetir:

```bash
npm install --no-save jsdom
cat > /tmp/test-xmltv.mjs <<'EOF'
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.DOMParser = dom.window.DOMParser;

const server = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, include: [] },
});
const { parseXmltvDate, normalizeChannelId } = await server.ssrLoadModule('/src/epg/xmltv.ts');
console.log(parseXmltvDate('20261019200000 +0100')); // 1792436400000
console.log(normalizeChannelId('RTP1.pt@HD'));        // rtp1.pt
await server.close();
EOF
node /tmp/test-xmltv.mjs
```

`jsdom` não está no `package.json` (foi instalado com `--no-save`); se quiser
testes permanentes, acrescente Vitest + jsdom ao projeto.

### 6.8 Limitações do EPG do iptv-org

- O projeto deixou de garantir um guia público único; os *hosts* comunitários
  fecharam. O nosso script depende de `api/guides.json` e das `sources`
  indicadas.
- Muitas fontes são scrapers de sites que mudam; falham sem aviso.
- O guia pode vir em `ISO-8859-1`/`windows-1252`; o script deteta e converte.
- O guia pode vir comprimido (`.gz`); o script descomprime.
- Fuso horário: o parser converte `+0100` para UTC corretamente. A UI mostra
  sempre em hora local do dispositivo.
- Canais geobloqueados podem ter grelha mesmo que o vídeo não toque.

---

## 7. Fase 4: atualização automática

### 7.1 Workflow

`.github/workflows/sync-lusofonia.yml`:

- **Quando:** segunda-feira às 04:00 UTC (05:00 em Luanda), manual
  (`workflow_dispatch`) e em push que altere a curadoria ou os scripts.
- **O que faz:** `npm ci` → `sync-lusofonia.mjs --check` → `sync-epg.mjs
  --max-sources=40` → commit de `data/lusofonia.generated.json` e
  `public/epg/` → push.
- **Permissões:** `contents: write`.
- **Falhas:** os passos de sync têm `continue-on-error`; se ambos falharem, o
  último snapshot válido é mantido e o job emite um aviso. O commit só inclui
  ficheiros alterados.

### 7.2 Primeira execução

1. Faça merge do PR para `main`.
2. Abra **Actions → Sync Lusofonia → Run workflow**.
3. Aguarde 5–15 min.
4. Confirme o commit `chore: sync canais lusófonos e EPG`.
5. Verifique `public/epg/lusofonia.xml` no repositório.
6. O Netlify (ou outro host) reconstrói a app com o novo snapshot.

### 7.3 Branch protection

Se `main` estiver protegido, o `git push` do bot falha. Duas opções:

- permitir push do `github-actions[bot]`; ou
- trocar o passo de commit por `peter-evans/create-pull-request`, para revisão
  humana. Recomendado se há revisão de direitos.

### 7.4 Segredos

O workflow não precisa de segredos além do `GITHUB_TOKEN`. Se acrescentar
fontes EPG privadas, use `secrets.EPG_*` e nunca as coloque no JSON.

### 7.5 Monitorização

- Ver `public/epg/lusofonia.meta.json` → `failedSources`.
- Ver `stats` do JSON gerado (`verified`, `offline`, `noSource`).
- Criar um alerta se `programmes` cair > 50% numa semana.
- Rever o diff antes de promover para produção, sobretudo remoções.

---

## 8. Fase 5: build e deploy

### 8.1 Build

```bash
npm run build
```

Saída: `dist/` com `index.html`, assets com hash, `manifest.json`, `sw.js` e
`epg/lusofonia.xml` (copiado de `public/`).

Conferir:

```bash
ls dist/epg/
grep -o 'lusofonia.xml' dist/sw.js || echo "SW não referencia o guia (normal: cache em runtime)"
```

### 8.2 Netlify / Vercel / Cloudflare Pages

Configuração:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node:** 20 ou 22
- **Variáveis:** nenhuma obrigatória (`GEMINI_API_KEY` é legado e não é usada
  em runtime; pode remover do `vite.config.ts`).

Se usar Netlify, um `netlify.toml` mínimo:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/epg/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

Não cacheie `/epg/*` por mais de 6 h sem invalidar; o guia muda.

### 8.3 Service worker

- Versão atual: `teip-v7-lusofonia`.
- Ao mudar a estratégia de cache, **incremente a versão** em `sw.js`; o
  `activate` apaga caches antigas.
- O SW não é registado em `localhost`/`127.0.0.1`.
- Depois de um deploy, feche e reabra a app (ou aguarde o próximo arranque)
  para o novo SW assumir.

### 8.4 Capacitor / Android

- Unifique `capacitor.config.ts` e `capacitor.config.json` (hoje têm appId,
  nome e `webDir` diferentes).
- Corrija `allowNavigation: ["*"]` para uma allowlist dos domínios usados.
- `npm run build && npx cap sync`.
- Teste em Android TV: foco, teclas, reprodução em background.

---

## 9. Operação e manutenção

### 9.1 Rotina semanal

- [ ] Rever o commit automático (canais removidos/adicionados).
- [ ] Confirmar que `failedSources` não cresceu de forma anormal.
- [ ] Testar 2–3 canais por país.
- [ ] Confirmar que o EPG abre no dia seguinte (o guia tem 7 dias).

### 9.2 Rotina mensal

- [ ] Rever direitos e termos de cada canal `official`/`fast`.
- [ ] Remover canais `review` que nunca foram aprovados.
- [ ] Verificar links de logótipos.
- [ ] Atualizar a versão do service worker se houve mudanças de assets.

### 9.3 Quando um stream morre

1. Corra `npm run sync:channels:check`.
2. Veja se existe `alternateStreams` (o player faz failover automático).
3. Se só houver uma fonte morta, procure uma oficial e use `manualUrl`.
4. Se não houver fonte legal, `"enabled": false` e registe o motivo.
5. Nunca substitua por um restream de dyndns/IP para “resolver rápido”.

### 9.4 Quando um canal pede remoção

1. `"enabled": false` e novo sync.
2. Remova logótipo/descrição se forem da marca.
3. Registe data, pedido e contacto.
4. Se o pedido for de um titular, não readicione sem autorização escrita.

### 9.5 Acrescentar São Tomé, Timor-Leste ou Guiné-Bissau

Os ficheiros `streams/st.m3u` e `streams/tl.m3u` do iptv-org estão vazios e
`streams/gw.m3u` não existe. Para estes países:

1. Acrescente entradas com `manualUrl` oficial (RTP África, TPA, etc.) e
   `id` com o sufixo `st`/`tl`/`gw`.
2. Classifique como `review` até ter autorização.
3. Use `epg: false` se não houver guia.
4. O `COUNTRY_META` de `src/data/lusofonia.ts` já tem cores e nomes para estes
   países.

---

## 10. Resolução de problemas

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `npm ci` falha com ERESOLVE | Dependências antigas | Use o lockfile atual; o plugin-legacy está fixado em `^6.1.0` |
| `sync:channels` falha com `fetch failed` | Rede bloqueia `iptv-org.github.io` | Use `IPTV_STREAMS_DIR` com um clone local (5.2) |
| Canal não aparece | `id` não corresponde ao `tvg-id`, ou host rejeitado | Ver `noSource`/`skipped` no log; simplifique o `id` |
| Canal aparece sem logo | `tvg-logo` vazio ou 404 | Defina `logo` na curadoria |
| “Sinal indisponível (rede/CORS)” | CORS, geobloqueio ou 403 | Testar com `curl`; usar fonte oficial/proxy autorizado |
| “Formato de vídeo não suportado” | Codec/DRM | Não há solução no browser; documentar |
| EPG vazio | Snapshot não gerado ou sem programas na janela | Correr `npm run sync:epg`; ver `meta.json` |
| EPG desatualizado | Cache de 6 h | Botão de refresh / `force` |
| EPG mostra “estimado” | Sem guia para o canal | Normal; `epg: false` ou fonte em falta |
| App mostra versão antiga | SW cache-first | Incrementar versão do SW e recarregar |
| Logótipos não carregam offline | Não são cacheados | Esperado; usar iniciais |
| Admin não guarda canais | Estado React apenas | Implementar backend/persistência (P0) |

---

## 11. Referência rápida

### Comandos

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview

npm run sync:channels
npm run sync:channels:check
npm run sync:epg
npm run sync
npm run build:full
```

### Ficheiros

| Ficheiro | Papel |
| --- | --- |
| `data/lusofonia.curation.json` | Lista curada (editar aqui) |
| `data/lusofonia.generated.json` | Lista gerada (não editar) |
| `data/epg.sources.json` | Configuração do EPG em runtime |
| `scripts/sync-lusofonia.mjs` | Pipeline de canais |
| `scripts/sync-epg.mjs` | Pipeline de EPG |
| `public/epg/lusofonia.xml` | Snapshot XMLTV |
| `public/epg/lusofonia.meta.json` | Estatísticas do último sync |
| `src/data/lusofonia.ts` | Adaptador JSON → `Channel` |
| `src/data/channels.ts` | Merge com o catálogo legado |
| `src/epg/xmltv.ts` | Parser XMLTV |
| `src/epg/epgCache.ts` | Cache IndexedDB |
| `src/epg/epgService.ts` | Carregamento e fallback |
| `src/epg/EpgContext.tsx` | `useEpg()` |
| `components/EPGGuide.tsx` | Grelha |
| `components/StreamPlayer.tsx` | Player e failover |
| `.github/workflows/sync-lusofonia.yml` | Automação |

### Contagens atuais

| País | Canais |
| --- | ---: |
| Portugal | 20 |
| Angola | 4 |
| Brasil | 26 |
| Moçambique | 5 |
| Cabo Verde | 1 |
| **Total** | **56** |

### Idiomas e convenções

- `pt` no `tvg-id` é Portugal; `pt` no campo `language` é o idioma.
- Nomes com acentos são permitidos; o matching normaliza.
- Não use `@HD` no `id` da curadoria; use no `tvgId`.
- `appCategory` tem de existir no `CATEGORY_MAP`; caso contrário cai em
  `GENERAL`.

---

## 12. Próximos passos recomendados

1. **Gerar o snapshot EPG no CI** e versioná-lo (hoje a pasta só tem README).
2. **Completar o registo de direitos** (`rights` + prova) e remover do catálogo
   legado os canais sem autorização.
3. **Autenticar o admin** e persistir canais/playlists.
4. **Implementar o proxy de headers** apenas para fontes licenciadas.
5. **Adicionar testes** ao parser e ao merge (Vitest + jsdom).
6. **Code splitting** (`manualChunks` para `hls.js`/React) e remover o
   plugin legacy, se não for necessário.
7. **Confirmar o deploy** em Netlify e testar a PWA em Android TV e iOS.
