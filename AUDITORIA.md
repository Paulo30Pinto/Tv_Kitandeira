# Auditoria técnica — TeIP (`Tv_Kitandeira`)

**Data:** 19 de outubro de 2026  
**Commit auditado:** `22d9e32` (`refactor: rebrand as TeIP and improve UI stability`)  
**Branch de trabalho:** `arena/e140c238-tv-kitandeira`  
**Âmbito:** aplicação React/Vite/PWA, catálogo de canais, player HLS, EPG, service worker, painel de administração, configuração Capacitor e integração com o `iptv-org`. A auditoria da **fonte** (`iptv-org`) está em [`docs/IPTV-ORG.md`](docs/IPTV-ORG.md).

> Esta auditoria é técnica. A secção 9 aponta riscos legais, mas **não é parecer jurídico**. Antes de publicar ou monetizar, valide os direitos de cada canal com um advogado e com o titular.

---

## 0. Como ler este documento

- **Antes** = estado no commit auditado.
- **Feito** = já corrigido nesta branch.
- **P0/P1/P2** = prioridade (P0 bloqueia produção, P1 deve entrar no próximo ciclo, P2 é melhoria).
- Os caminhos de ficheiro são relativos à raiz do repositório.

---

## 1. Sumário executivo

A aplicação tem uma base visual sólida e um player HLS funcional, mas estava a funcionar como **protótipo**: o catálogo tinha canais com streams trocados, o EPG era inventado, o painel de administração não persistia nada, o service worker podia servir uma versão antiga da app indefinidamente e a configuração de build não instalava de forma limpa.

### 1.1 Nota por área (antes)

> Guia de implementação passo a passo: [`docs/LUSOFONIA.md`](docs/LUSOFONIA.md). Catálogo gerado: [`docs/CANAIS.md`](docs/CANAIS.md).


| Área | Nota | Comentário |
| --- | :---: | --- |
| Arquitetura / organização | 4/10 | Duas aplicações no mesmo repo (`App.tsx` e `src/App.tsx`), tipos e componentes duplicados. |
| Catálogo de canais | 3/10 | 29 canais, vários com nome/stream/país errados; streams duplicados e não autorizados. |
| Player HLS | 5/10 | `hls.js` bem integrado, mas sem failover, sem headers, sem tratamento de CORS/geobloqueio. |
| EPG | 2/10 | Grelha gerada por categoria e horas fixas; nenhum XMLTV real. |
| PWA / offline | 4/10 | SW cache-first para tudo, manifest com marca antiga, assets externos. |
| Segurança / privacidade | 2/10 | Painel admin sem autenticação, PIN parental em texto simples, permissões desnecessárias. |
| Legalidade | 1/10 | AXN em `dyndns` e vários restreams de terceiros, sem qualquer registo de direitos. |
| Build / DX | 4/10 | `npm install` falhava, Tailwind por CDN, sem testes, sem CI, sem README. |

### 1.2 Top 10 riscos

1. **P0 — Direitos de transmissão.** O catálogo legado inclui AXN em `znty.dyndns.org`; a lista pública `pt.m3u` usada como base inclui Sport TV, Disney, Star e TVI em `znty`/`zntx`, IPs literais e um repositório de terceiros (`thomraider12/canaistvpt`). Isto é retransmissão não autorizada aparente. Risco de takedown, bloqueio de conta de anúncios, rejeição nas lojas e responsabilidade civil.
2. **P0 — Catálogo enganador.** `AXN` tem logo da TPA, país Angola e `type: YOUTUBE` com um URL HTTP `.m3u8`; `RTP África` aponta para o stream da RTP Mundo; `Disney Junior` aponta para um canal infantil religioso (3ABN); `Cartoon Network` aponta para a RetroTV.
3. **P0 — EPG fabricado.** O guia inventava programas por categoria, com horas fixas (12:00–20:00) e “Hora Atual: 14:25” hardcoded.
4. **P0 — Admin sem autenticação.** Qualquer utilizador abre o painel pelo menu e adiciona/remove canais; não há backend nem auditoria.
5. **P1 — Service worker cache-first.** Podia continuar a servir `index.html` antigo depois de um deploy, com assets já removidos.
6. **P1 — `npm install` falhava.** `@vitejs/plugin-legacy@8` exige Vite 8, mas o projeto usa Vite 6. Só funcionava com `--legacy-peer-deps`.
7. **P1 — Tailwind por CDN.** `cdn.tailwindcss.com` é um JIT de desenvolvimento: adiciona dependência de rede, não funciona offline e não é recomendado em produção.
8. **P1 — Sem verificação de streams.** Nenhum canal era testado; streams mortos ficavam “ONLINE” para sempre.
9. **P1 — PIN parental em claro.** `localStorage` guarda o PIN (`0000` por omissão) legível por qualquer script; `isAdult` nunca é preenchido e `blockAdultContent` nunca filtra nada.
10. **P2 — Bundle monolítico.** 951,84 kB de JS (282,43 kB gzip) num único chunk, mais 990 kB de legacy.

### 1.3 O que já foi corrigido nesta branch

- Lista curada de **56 canais** de Portugal, Angola, Brasil, Moçambique e Cabo Verde, com `tvg-id`, `epgId`, direitos, estado e logotipo.
- Pipeline `scripts/sync-lusofonia.mjs` com política de fontes, ranking, deduplicação e teste HTTP (`--check`).
- `scripts/sync-epg.mjs` que gera um XMLTV único a partir do `iptv-org` e o publica em `public/epg/lusofonia.xml`.
- Parser XMLTV (`src/epg/xmltv.ts`), cache IndexedDB (`src/epg/epgCache.ts`), serviço (`epgService.ts`) e contexto React (`EpgContext.tsx`).
- `EPGGuide` reescrito com eixo temporal real, filtros por país e indicação “EPG” vs “estimado”.
- Player com failover para `alternateStreams` e recuperação de erros HLS.
- Build limpo: `npm ci` sem `--legacy-peer-deps`; plugin-legacy fixado em `^6.1.0`.
- Tailwind compilado localmente (CSS 70,85 kB / 11,25 kB gzip), CDN removido.
- Service worker v7 (network-first para navegação e EPG, stale-while-revalidate para assets).
- Manifest e `metadata.json` com a marca TeIP; ícone e tema corrigidos.
- Workflow `.github/workflows/sync-lusofonia.yml` (semanal + manual).

---

## 2. Arquitetura e organização

### 2.1 Antes

```
index.html ──> index.tsx ──> App.tsx (raiz)           ← aplicação realmente usada
                               ├── constants.ts (29 canais)
                               ├── components/*.tsx
                               ├── data/programs.ts (EPG inventado)
                               └── hooks/useTVNavigation.ts

src/App.tsx ──> screens/*, src/context/AppContext, src/data/mockData   ← aplicação paralela, não usada
src/components/StreamPlayer.tsx ──> re-export do componente raiz
src/types.ts ──> re-export do types.ts raiz
```

O `index.tsx` monta o `App` da raiz. A pasta `src/screens`, `src/context` e `src/data/mockData.ts` **não é importada por ninguém** (exceto pelos próprios ficheiros). Mesmo assim, o `tsc` verifica-a e o bundle pode incluí-la por engano se alguém importar um ecrã.

### 2.2 Depois

```
index.tsx ──> App.tsx (raiz)
                ├── EpgProvider (src/epg/EpgContext.tsx)
                ├── ALL_CHANNELS (src/data/channels.ts)
                │      ├── constants.ts (legado TeIP)
                │      └── src/data/lusofonia.ts ← data/lusofonia.generated.json
                ├── components/EPGGuide.tsx ──> useEpg()
                └── components/StreamPlayer.tsx ──> useEpg()

scripts/sync-lusofonia.mjs ──> data/lusofonia.generated.json
scripts/sync-epg.mjs       ──> public/epg/lusofonia.xml
.github/workflows/sync-lusofonia.yml (cron semanal)
```

### 2.3 Problema estrutural que continua

Há **dois** `App.tsx`, dois `StreamPlayer`, dois `VideoPlayer`, dois `types.ts`, duas `index.css` e duas abordagens de navegação. Recomendação P1:

- apagar `src/App.tsx`, `src/screens/`, `src/context/`, `src/data/mockData.ts`, `src/components/*` que são re-exports e `src/index.css`;
- manter apenas `src/epg/` e `src/data/` (novos módulos) e o código da raiz;
- ou, melhor a médio prazo, migrar tudo para `src/` e apagar a raiz duplicada.

Não o fiz automaticamente porque remove funcionalidades que podem ser reaproveitadas e porque o utilizador não pediu uma reestruturação total.

---

## 3. Build, dependências e DX

| # | Problema | Evidência | Estado |
| --- | --- | --- | --- |
| 3.1 | `npm install` falhava com `ERESOLVE` | `@vitejs/plugin-legacy@8.0.1` pede `vite@^8`, o projeto tem `vite@^6.2` | **Feito**: plugin fixado em `^6.1.0`; `npm ci` passa |
| 3.2 | Dois lockfiles | `package-lock.json` e `bun.lock` | P2: escolher um; o CI usa npm |
| 3.3 | Tailwind por CDN | `<script src="https://cdn.tailwindcss.com">` | **Feito**: Tailwind 3.4 + PostCSS; CSS gerado no build |
| 3.4 | Sem testes | 0 ficheiros `*.test.*` ou `*.spec.*` | P1: Vitest + Testing Library para parser EPG e normalização de canais |
| 3.5 | Sem lint | `npm run lint` é apenas `tsc --noEmit` | P2: ESLint + `eslint-plugin-react-hooks` |
| 3.6 | `tsconfig` permissivo | sem `strict`, sem `include` | P1: ativar `strict` por etapas; excluir `src` morto |
| 3.7 | Bundle grande | 951,84 kB JS / 282,43 kB gzip; 990 kB legacy | P1: `manualChunks`, lazy load de ecrãs, avaliar remoção do plugin legacy |
| 3.8 | Sem README | nenhum `README.md` | **Feito**: README na raiz |
| 3.9 | Sem CI de build | só existe o workflow de sync | P1: `npm ci && npm run lint && npm run build` em cada PR |
| 3.10 | `vite.config.ts` com `hmr: false` | dificulta desenvolvimento | P2: remover; o SW já não é registado em localhost |
| 3.11 | `@vitejs/plugin-legacy` | adiciona 990 kB para browsers antigos | P2: remover se o alvo for PWA/Capacitor moderno |

### 3.1 Comandos de validação

```bash
npm ci
npm run lint          # tsc --noEmit
npm run build
npm run dev           # http://localhost:3000
```

Resultado atual: `tsc` OK, build OK em ~14 s.

---

## 4. Catálogo e integridade de dados

### 4.1 Os 29 canais legados (`constants.ts`)

| # | ID | Nome | Problema encontrado |
| ---: | --- | --- | --- |
| 1 | `teip-tv` | TeIP | Usa o stream da TV Zimbo; não é um canal próprio. |
| 2 | `AXN.pt@SD` | AXN | Logo da TPA, país Angola, `type: YOUTUBE` com URL HTTP `.m3u8` → o player renderiza um iframe e nunca reproduz. Stream em dyndns não autorizado. |
| 3 | `tpa2` | TPA2 | Embed YouTube `9Xxhiz8UU6M` repetido; não é a emissão linear da TPA2. |
| 4 | `tpa-noticias` | TPA Notícias | Mesmo embed da TPA2. |
| 5 | `tv-zimbo` | TV Zimbo | Stream correto, mas duplicado com TeIP/Girassol/ZAP Viva. |
| 6 | `tv-girassol` | TV Girassol | Aponta para o stream da TV Zimbo. |
| 7 | `globo-on` | Globo ON | “Globo ON” não é um canal; URL `cidadeverdenovo` de terceiros. |
| 8 | `zap-novelas` | ZAP Novelas | URL da Canela TV (FAST), não é a ZAP Novelas. |
| 9 | `zap-viva` | ZAP Viva | Stream da TV Zimbo. |
| 10 | `s-plus-maximo` | S+ Máximo 1 | URL da TVI Ficção; marca inexistente. |
| 11 | `tln-network` | TLN | URL da Canela TV; conteúdo genérico. |
| 12 | `rtp-africa` | RTP África | URL da **RTP Mundo** (`smil:rtpi`), não da RTP África. |
| 13 | `nat-geo` | National Geographic | URL CloudFront partilhado com Odisseia; origem duvidosa. |
| 14 | `odisseia` | Odisseia | Mesmo URL do Nat Geo. |
| 15 | `afro-music` | Afro Music | URL da Trace Urban. |
| 16 | `be-kuduro` | Be Kuduro | URL da Trace Urban. |
| 17 | `assembleia-nacional` | Assembleia Nacional | Mesmo embed da TPA2. |
| 18 | `disney-junior` | Disney Junior | URL do 3ABN Kids (canal religioso). |
| 19 | `cartoon-network` | Cartoon Network | URL da RetroTV. |
| 20 | `espn` | ESPN Sports | URL `nsprt` (FAST de desporto), não ESPN. |
| 21 | `cinema-hd` | Cine Premium 4K | Marca inventada; URL `cidadeverdenovo`. |
| 22 | `series-zone` | Séries Prime HD | Marca inventada; URL Canela TV. |
| 23 | `euronews-pt` | EuroNews PT | Plausível (Samsung TV Plus); verificar contrato. |
| 24 | `cnn-brasil` | CNN Brasil | Embed YouTube; substituído pela fonte oficial CloudFront na lista curada. |
| 25 | `cnn-portugal` | CNN Portugal | URL `video-auth1.iol.pt`; pode ser oficial, mas sujeita a geobloqueio. |
| 26 | `trace-urban` | Trace Urban | FAST plausível; verificar direitos. |
| 27 | `fifa-plus` | FIFA+ | FAST oficial plausível. |
| 28 | `barca-tv` | Barça TV | Canal encerrado em 2023. |
| 29 | `real-madrid-tv` | Real Madrid TV | FAST oficial plausível. |

### 4.2 Streams duplicados

| URL | Canais que a usam |
| --- | --- |
| `sgn-cdn-video.vods2africa.com/Tv-Zimbo/...` | TeIP, TV Zimbo, TV Girassol, ZAP Viva |
| `stmv1.transmissaodigital.com/cidadeverdenovo/...` | Globo ON, Cine Premium 4K |
| `spt-novelas-1-us.canelatv.wurl.tv/...` | ZAP Novelas, TLN, Séries Prime HD |
| `...traceurban-xiaomi...` | Afro Music, Be Kuduro, Trace Urban |
| `d1j2csarxnwazk.cloudfront.net/...` | National Geographic, Odisseia |
| `youtube.com/embed/9Xxhiz8UU6M` | TPA2, TPA Notícias, Assembleia Nacional |

Consequência: quatro cartões diferentes mostram o mesmo vídeo. Isto destrói a confiança do utilizador e facilita confusão de marcas.

### 4.3 Outros problemas de dados

- `DEFAULT_PLAYLISTS` em `constants.ts` aponta para `https://iptv-org.github.io/iptv/languages/por.m3u`. O URL existe (gerado na branch `gh-pages`, 477 entradas, ~106 KB), mas a playlist mistura Brasil/EUA/PALOP e não passa por curadoria; a app não a usa em runtime.
- O admin anuncia “43 canais” na playlist por omissão, mas o catálogo real tem 29 (antes) e 82 (depois).
- `Channel.resolution` só aceitava `4K | 1080p | 720p`; streams de 480p/360p não tinham tipo válido (corrigido para incluir 480p/360p).
- `Country` só tinha Angola, Brasil, Portugal e Global; não havia Moçambique nem Cabo Verde (corrigido).
- Não existia `tvg-id`/`epgId` no modelo; era impossível casar o canal com um guia XMLTV (corrigido).
- `isAdult` existe no tipo mas nunca é preenchido; o controlo parental não tem efeito.

### 4.4 O que foi feito

- Catálogo curado em `data/lusofonia.curation.json` (57 entradas, 56 ativas; a TVM Internacional ficou de fora porque só tem fonte HTTP).
- `data/lusofonia.generated.json` com 56 canais: 20 PT, 4 AO, 26 BR, 5 MZ, 1 CV.
- Merge em `src/data/channels.ts`: a lista curada substitui duplicados por nome (RTP África, TV Zimbo, CNN Brasil). O catálogo final tem **82 canais**.
- Canais da lusofonia recebem IDs `lusofonia-*`, números 100+, `source: 'iptv-org'`, `rights` e `labels`.
- Correção automática de tipo: se `type === YOUTUBE` mas o URL não é YouTube, passa a HLS.

### 4.5 Recomendações

- **P0:** remover do catálogo legado os canais 2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 e 28, ou substituí-los por fontes oficiais. Enquanto não houver direitos, não os apresentar como “AO VIVO”.
- **P1:** mostrar no cartão o estado real (`verified`/`offline`) e um selo “Lusofonia”.
- **P1:** criar um registo de direitos por canal (`rights`, `evidence`, `territories`, `expiresAt`) e um processo de takedown.
- **P2:** numerar canais de forma estável e documentada (evitar renumeração quando a lista muda).

---

## 5. Player (`components/StreamPlayer.tsx`)

### 5.1 O que está bem

- `hls.js` com worker, low-latency e recuperação de erros de media.
- Autoplay com fallback para muted.
- Teclado/telecomando: setas para zapping/volume, números para canal direto, `F` fullscreen, `C` canais, `E` EPG, `I` info.
- Drawer de canais, OSD de zapping, relógio e controlo de volume.
- Cleanup do `Hls` no unmount.

### 5.2 Problemas

| # | Problema | Impacto |
| --- | --- | --- |
| 5.1 | Ignora `EXTVLCOPT` (`http-user-agent`, `http-referrer`) | Muitos streams do iptv-org exigem estes headers. O browser **não permite** definir `User-Agent`/`Referer`; é preciso um proxy server-side autorizado. |
| 5.2 | Sem estratégia de CORS | Se o manifesto não tiver `Access-Control-Allow-Origin`, o hls.js falha com erro de rede genérico. |
| 5.3 | Sem failover | `alternateStreams` existia no modelo mas não era usado (corrigido). |
| 5.4 | Menu de qualidade decorativo | Mostra “1080p HD (Automático)” mas não chama `hls.currentLevel`; é apenas UI. |
| 5.5 | `type` inconsistente | O caso AXN demonstra que o tipo pode não corresponder ao URL (corrigido com normalização). |
| 5.6 | Erros genéricos | “Sinal HLS temporariamente indisponível” não distingue 403, geobloqueio, CORS ou stream morto. |
| 5.7 | Sem PiP/Cast/DRM | Limitação de produto; documentar. |
| 5.8 | Sem pré-verificação | O utilizador só descobre que o canal está morto ao clicar. |

### 5.3 O que foi feito

- Failover automático para `channel.alternateStreams` após 2 tentativas de rede e 2 de media.
- `xhrSetup` aplica headers personalizados quando o browser o permite (os proibidos são ignorados).
- Mensagem de erro específica para rede/CORS/geobloqueio e para media.
- Normalização de tipo no merge de canais.

### 5.4 Recomendações

- **P0:** para canais cujo manifesto exige `Referer`/`User-Agent`, usar um proxy próprio **apenas com fontes licenciadas**; nunca proxificar pirataria.
- **P1:** implementar seletor de qualidade real (`hls.levels`, `hls.currentLevel`).
- **P1:** health-check no sync (`--check`, já implementado) e um botão “testar stream” no admin.
- **P2:** adicionar `preload="none"`, legendas, áudio alternativo e PiP.

---

## 6. EPG

### 6.1 Antes

- `data/programs.ts` fabricava uma grelha de 24 h por categoria (`Notícias`, `Desporto`, `Novelas`, etc.), sempre a começar às 06:00.
- `MOCK_EPG_SHOWS` tinha programas para 5 canais.
- `EPGGuide` mostrava horas fixas `12:00–20:00`, “Hora Atual: 14:25” hardcoded e apenas os primeiros 15 canais.
- Não havia `tvg-id`, parsing XMLTV, cache, timezone ou matching por nome.
- `isLive` era calculado no render e podia ficar errado após meia-noite.

### 6.2 Depois

| Peça | Ficheiro | Função |
| --- | --- | --- |
| Parser XMLTV | `src/epg/xmltv.ts` | Lê `<channel>`/`<programme>`, converte `YYYYMMDDHHmmss ±HHMM` para ms UTC, filtra janela, deduplica. |
| Cache | `src/epg/epgCache.ts` | IndexedDB (`teip-epg`), TTL 6 h, cópia antiga até 168 h em caso de falha, suporte a `.gz`. |
| Serviço | `src/epg/epgService.ts` | Tenta `/epg/lusofonia.xml` e depois fontes extra; junta guias; mantém cópia em memória. |
| Contexto | `src/epg/EpgContext.tsx` | `useEpg()` com `getPrograms`, `getNowNext`, `hasRealEpg`, `refresh`, estado e erro. |
| UI | `components/EPGGuide.tsx` | Eixo temporal real, filtros por país, “só com EPG real”, estado da cache, modal. |
| Pipeline | `scripts/sync-epg.mjs` | Lê `api/guides.json`, descobre fontes, descarrega XMLTV, mapeia IDs e gera um guia único. |
| Workflow | `.github/workflows/sync-lusofonia.yml` | Corre semanalmente e faz commit do guia. |

### 6.3 Como funciona o matching

1. `epgId` do canal (ex.: `RTP1.pt`) → chave normalizada (`rtp1.pt`).
2. `tvgId` sem `@HD`/`@SD`.
3. `id` do canal (incluindo `lusofonia-*`).
4. Fallback por `display-name` do XMLTV vs nome do canal (sem acentos/maiúsculas).

### 6.4 Limitações importantes

- O `iptv-org` **não garante** que `https://iptv-org.github.io/epg/guides/...` esteja sempre disponível; em 2026 o modelo passou a ser “corre o grabber e auto-hospeda”. O nosso script usa `api/guides.json` e as `sources` indicadas; se o endpoint falhar, mantém o último snapshot.
- Muitos guias estão em HTML/JSON de sites que mudam; o `sync-epg` pode falhar em canais individuais sem falhar o resto (é registado em `failedSources`).
- O sandbox desta sessão não tem acesso a `iptv-org.github.io`, por isso **não foi possível gerar o snapshot real aqui**. O workflow foi preparado para o fazer em CI. Até lá, a UI mostra “Grelha estimada” — não finge que é real.
- CORS: o guia é servido pelo **mesmo domínio** da app (`/epg/lusofonia.xml`), evitando o problema de CORS. Fontes externas em `data/epg.sources.json` precisam de CORS.

### 6.5 Recomendações

- **P1:** correr `npm run sync:epg` no CI e versionar o snapshot para o primeiro arranque já ter grelha.
- **P1:** adicionar um teste automático ao parser com um fixture XMLTV (o parser foi validado manualmente: `+0100` → UTC correto).
- **P2:** guardar apenas 48 h em IndexedDB e usar compressão; evitar crescimento indefinido.
- **P2:** mostrar a fonte e a hora de atualização no modal do programa.

---

## 7. PWA, cache e offline

### 7.1 Antes

- `manifest.json` dizia **Angoflix**, usava ícones do `picsum.photos` e não tinha `scope`/`id`.
- `metadata.json` pedia câmara e microfone e declarava capacidade Gemini, sem uso.
- O `sw.js` fazia **cache-first para tudo** (exceto `.m3u8`, `.ts`, YouTube), incluindo `/index.html` e pedidos de API. Um deploy novo podia ficar invisível durante dias.
- O SW era registado também em `localhost`, atrapalhando o Vite.
- `index.html` tinha `maximum-scale=1, user-scalable=0` (má acessibilidade).
- Dependência de `cdn.tailwindcss.com` e Google Fonts.

### 7.2 Depois

- `manifest.json`: nome TeIP, `lang: pt`, `scope`, `id`, tema `#090B16`, ícone TeIP.
- `metadata.json`: descrição TeIP, sem permissões.
- `sw.js` v7:
  - navegação: network-first com fallback a `index.html`;
  - `/epg/`: network-first, só guarda respostas `xml`;
  - assets same-origin: stale-while-revalidate;
  - streams: pass-through;
  - cross-origin: não cacheia respostas opacas.
- Registo do SW ignorado em `localhost`/`127.0.0.1`.
- Tailwind compilado localmente; já não há dependência do CDN.

### 7.3 O que falta

- **P1:** prompt “nova versão disponível” (`registration.waiting` + `skipWaiting`).
- **P1:** precache dos assets com hash (hoje só `/`, `/index.html`, `/manifest.json`).
- **P2:** página offline dedicada.
- **P2:** cache de logótipos (mesmo que opaca) com limite de tamanho.

---

## 8. Segurança, privacidade e controlo parental

| # | Achado | Gravidade | Detalhe |
| --- | --- | --- | --- |
| 8.1 | Painel admin sem autenticação | **Alta** | `AccountModal` chama `onOpenAdmin` e `App` muda para `activeView='admin'` sem login. |
| 8.2 | Alterações não persistem | Média | `handleAddChannel`/`handleDeleteChannel` só alteram estado React; recarregar perde tudo. |
| 8.3 | Playlist “sincronizada” é um toast | Média | `AdminPanel.handleCreatePlaylist` não descarrega nem faz parsing do M3U; `channelsCount: 50` é fixo. |
| 8.4 | PIN parental em texto simples | **Alta** | `localStorage['teip_parental']` guarda `pinCode` em claro; o campo está mascarado, mas qualquer script/XSS lê o valor; sem hash, sem bloqueio por tentativas. |
| 8.5 | `blockAdultContent` não é aplicado | Alta | Nenhum filtro usa `isAdult`; `isAdult` nunca é definido. |
| 8.6 | Admin mostra “100% Online” e “Cloud CDN” | Baixa | Valores hardcoded, não medidos. |
| 8.7 | `allowNavigation: ["*"]` no Capacitor | **Alta** | WebView pode navegar para qualquer domínio. |
| 8.8 | App ID/nome inconsistentes | Média | `capacitor.config.ts`: `ao.angoflix.app`/Angoflix/`dist`; `capacitor.config.json`: `com.teip.smartpwa`/TEIP/`.` |
| 8.9 | Sem CSP | Média | Scripts e imagens de qualquer origem; fontes e logótipos externos podem rastrear utilizadores. |
| 8.10 | Dados de utilizador fictícios | Baixa | `MOCK_USER` e `angoflix_favorites`; não há backend. |

### Recomendações P0/P1

- Remover o acesso público ao admin ou colocá-lo atrás de autenticação real (Supabase Auth, por exemplo — o conector Supabase está disponível nesta conversa).
- Persistir canais e playlists numa base de dados; nunca confiar no cliente.
- Guardar apenas um **hash** do PIN (PBKDF2/Argon2) e nunca o mostrar; bloquear após N tentativas.
- Filtrar `isAdult` no catálogo e no player; aplicar o PIN antes de abrir o canal.
- Corrigir/remover `allowNavigation: ["*"]`; usar allowlist.
- Definir CSP (`default-src 'self'; img-src 'self' https: data:; media-src ...`).
- Unificar a configuração Capacitor e testar `npx cap sync`.

---

## 9. Legalidade e conformidade

> Repetição: não é parecer jurídico.

### 9.1 O que o `iptv-org` é (e não é)

O `iptv-org/iptv` é um **índice comunitário** de URLs públicos. Não hospeda vídeo nem concede licenças. Cada stream pertence a quem o opera, e muitos são restreams não autorizados. O projeto mantém uma blocklist e remove canais por DMCA, mas isso não transfere direitos para quem consome a lista.

### 9.2 Sinais de risco no catálogo atual

- Host `znty.dyndns.org` no catálogo legado (AXN) e, na lista pública `pt.m3u` usada como base, `zntx.dyndns.org`, IPs literais (`50.7.120.34`, `188.115.15.121`, `45.162.*`) e um repositório de terceiros (`thomraider12/canaistvpt`).
- Canais premium pagos: Sport TV, AXN, Disney, Star e TVI (em `pt.m3u`); Globo/SBT/Record aparecem em `br.m3u` em fontes de terceiros.
- Ausência total de contrato, território, validade ou prova de autorização.
- Conteúdo geobloqueado oferecido sem indicar a restrição (SIC, RTP, Record News).

### 9.3 Modelo mínimo de conformidade

1. **Registo de direitos** por canal: titular, contrato/termo, territórios, janela temporal, restrições (geobloqueio, DRM, publicidade).
2. **Curadoria explícita**: nada entra em produção sem `rights` diferente de `review`.
3. **Bloqueio geográfico** no edge (Netlify/Cloudflare) quando exigido.
4. **Processo de takedown** com contacto e SLA.
5. **Registo de alterações** (quem adicionou, quando, com que prova).
6. **Não usar VPN/proxy para contornar geobloqueios.**
7. **Privacidade**: consentimento para analytics, política de cookies, retenção mínima.

### 9.4 Recomendação imediata

A lista curada já separa `public`/`official`/`review`. Antes de publicar:

- manter em produção apenas canais cuja fonte seja **oficial ou FAST licenciada**;
- remover os canais premium e os restreams;
- se o objetivo é distribuir TV paga, negociar com os titulares (Sport TV, Media Capital, Impresa, Disney, Warner Bros. Discovery, Globo, etc.);
- para Angola, falar com a TPA, TV Zimbo, ZAP e operadores locais.

---

## 10. Performance

| Métrica (build atual) | Valor |
| --- | --- |
| JS principal | 951,84 kB (282,43 kB gzip) |
| JS legacy | 990,45 kB (283,96 kB gzip) |
| Polyfills legacy | 73,23 kB |
| CSS | 70,85 kB (11,25 kB gzip) |
| Módulos transformados | 1 725 |
| Canais no catálogo | 82 |

Observações:

- O bundle principal inclui React, `hls.js`, `lucide-react` e todos os ecrãs. `manualChunks` para `hls`, `react` e `ui` reduz o custo inicial.
- `EPGGuide` renderiza até 40 canais; cada linha calcula a grelha. É aceitável, mas pode ser virtualizado.
- 56 logótipos externos sem `loading="lazy"` no `ChannelCard` (o `EPGGuide` já usa lazy).
- O service worker não cacheia logótipos (decisão consciente); offline mostra placeholders.
- `@vitejs/plugin-legacy` duplica o bundle para browsers que uma PWA/Capacitor moderno não precisa.

Recomendações: `manualChunks`, `React.lazy` para `EPGGuide`/`AdminPanel`, remover legacy, converter logótipos para WebP/AVIF com cache próprio.

---

## 11. Acessibilidade e UX

- **Bom:** navegação por teclado/telecomando, `aria` básico em alguns botões, foco visível nos cartões, textos em português.
- **Fraco:** `user-scalable=0` impede zoom; modais sem `role="dialog"`, `aria-modal` ou focus trap; vários botões só com ícone (título ajuda, mas falta `aria-label`); contraste de textos `text-slate-400` sobre `#090B16` no limite; “AO VIVO” em todos os cartões, mesmo offline.
- **Feito:** EPG com relógio real; `maximum-scale=1`/`user-scalable=0` removidos (zoom permitido); badges de estado real no cartão (AO VIVO/POR TESTAR/OFFLINE).
- **Recomendado:** `aria-label` em todos os ícones, focus trap nos modais, teste com leitor de ecrã, contraste mínimo AA.

---

## 12. Roadmap priorizado

| Prioridade | Ação | Esforço | Estado |
| --- | --- | --- | --- |
| P0 | Remover canais premium/restreams não autorizados do catálogo de produção | 1 dia | Parcial (curadoria exclui; legado continua) |
| P0 | Autenticar o admin e persistir canais/playlists | 2–3 dias | Pendente |
| P0 | Aplicar controlo parental real (hash + filtro `isAdult`) | 1–2 dias | Pendente |
| P0 | Corrigir `capacitor.config.*` e `allowNavigation` | 2 h | Pendente |
| P1 | Gerar o snapshot EPG no CI e validar o parser com teste | 4 h | Pipeline pronto; snapshot pendente |
| P1 | Health-check semanal + badge de estado no cartão | 1 dia | Sync pronto; UI pendente |
| P1 | `manualChunks` + lazy load + remover plugin legacy | 1 dia | Pendente |
| P1 | Testes (parser, merge, cache) + CI de build | 1–2 dias | Pendente |
| P1 | Remover código morto `src/` duplicado | 2 h | Pendente |
| P2 | Página offline, prompt de atualização, CSP | 1 dia | Pendente |
| P2 | Seletor de qualidade real e PiP | 2 dias | Pendente |
| P2 | Virtualizar grelha e otimizar imagens | 1 dia | Pendente |

---

## 13. Como validar o que foi feito

```bash
# 1. Instalação limpa
npm ci

# 2. Tipos e build
npm run lint
npm run build

# 3. Catálogo (offline, usando a cache local do iptv-org se existir)
npm run sync:channels

# 4. Com teste de streams (precisa de internet)
npm run sync:channels:check

# 5. EPG (precisa de internet; pode falhar sem quebrar a app)
npm run sync:epg

# 6. Servidor local
npm run dev
# abrir http://localhost:3000 → aba "Lusófonos" e "Programação (EPG)"
```

Verificações manuais recomendadas:

- Abrir 3 canais de cada país; confirmar áudio/vídeo e failover.
- Desligar a rede depois de carregar o EPG; confirmar que o guia em cache aparece com aviso “offline”.
- Instalar como PWA e testar em modo standalone.
- Testar teclado/telecomando: setas, números, `C`, `E`, `F`, `Esc`.
- Confirmar que `RTP África` abre o stream `rtpafrica` (não `rtpi`).
- Confirmar que `AXN` legado deixou de tentar iframe com URL `.m3u8` (normalização de tipo).

---

## 14. Ficheiros alterados/criados

**Criados**

```
AUDITORIA.md
README.md
docs/LUSOFONIA.md
docs/CANAIS.md
docs/PORTUGAL.md
docs/IPTV-ORG.md
data/channels/README.md
data/channels/portugal.reference.ts
data/lusofonia.curation.json
data/lusofonia.generated.json
data/epg.sources.json
scripts/sync-lusofonia.mjs
scripts/sync-epg.mjs
public/epg/README.md
.github/workflows/sync-lusofonia.yml
src/data/lusofonia.ts
src/data/channels.ts
src/epg/xmltv.ts
src/epg/epgCache.ts
src/epg/epgService.ts
src/epg/EpgContext.tsx
tailwind.config.js
postcss.config.js
```

**Alterados**

```
App.tsx
components/EPGGuide.tsx
components/StreamPlayer.tsx
types.ts
tsconfig.json
vite.config.ts
index.html
index.css
manifest.json
metadata.json
sw.js
package.json
package-lock.json
```

---

## 15. Limitações desta auditoria

- Não houve testes em dispositivos físicos (Android TV, iOS, Smart TV) nem em browsers reais neste ambiente; a validação foi estática, build, SSR do parser e pedidos HTTP locais.
- Não foi possível aceder a `iptv-org.github.io` a partir do sandbox, logo o snapshot EPG real e o health-check dos 56 streams ficam para o CI ou para a máquina do utilizador.
- Os URLs de stream mudam com frequência; qualquer lista pública envelhece em dias.
- A análise legal é de risco, não de conformidade formal.
- O catálogo legado foi mantido para não quebrar favoritos; a limpeza recomendada na secção 4.5 continua por fazer.
