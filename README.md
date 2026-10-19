# TeIP — TV Lusófona ao Vivo

PWA de televisão em língua portuguesa, com canais de Portugal, Angola, Brasil,
Moçambique e Cabo Verde, guia de programação XMLTV e funcionamento offline.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline-5A0FC8)

## O que inclui

- **56 canais curados** da lusofonia, com metadados, logótipos, estado e
  direitos: 20 PT, 4 AO, 26 BR, 5 MZ, 1 CV.
- **EPG XMLTV** gerado a partir das fontes do `iptv-org`, com cache local
  (IndexedDB), janela de 7 dias e fallback para grelha estimada.
- **Player HLS** com `hls.js`, failover para fontes alternativas, recuperação
  de erros e controlo por teclado/telecomando.
- **PWA** com service worker (network-first para navegação e EPG) e manifest
  em português.
- **Pipeline reprodutível**: lista curada em JSON → script de sync → build.

## Início rápido

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # dist/
```

Requisitos: Node 20+ e npm.

## Dados e atualização

A lista **não** é obtida em runtime do `iptv-org`. É gerada em tempo de build:

```bash
npm run sync:channels       # atualiza data/lusofonia.generated.json
npm run sync:channels:check # testa os manifestos HLS antes de publicar
npm run sync:epg            # gera public/epg/lusofonia.xml
npm run build               # build de produção
npm run build:full          # sync + build
```

- Edite **`data/lusofonia.curation.json`** para acrescentar/remover canais.
- Nunca edite `data/lusofonia.generated.json` à mão.
- O workflow `.github/workflows/sync-lusofonia.yml` corre semanalmente e faz
  commit do catálogo e do guia.

## Estrutura

```
App.tsx                  UI principal
components/              player, grelha EPG, cartões, admin
data/                    curadoria + artefactos gerados + config EPG
scripts/                 pipelines de canais e EPG
src/data/                adaptadores para o modelo Channel
src/epg/                 parser XMLTV, cache IndexedDB, contexto React
public/epg/              snapshot XMLTV servido pela app
docs/                    guia de implementação e catálogo
```

## Documentação

- [Auditoria técnica](AUDITORIA.md) — problemas, riscos e roadmap da app.
- [Auditoria do iptv-org](docs/IPTV-ORG.md) — cobertura, qualidade, EPG e riscos da fonte.
- [Canais portugueses](docs/PORTUGAL.md) — análise do `pt.m3u`, lista de 20 canais e formato `Channel`.
- [Guia de implementação](docs/LUSOFONIA.md) — passo a passo para canais e EPG.
- [Catálogo de canais](docs/CANAIS.md) — lista atual e exclusões deliberadas.

## Aviso legal

O `iptv-org` é um índice comunitário de URLs públicos; **não** concede
direitos de retransmissão. A lista curada exclui os streams de canais pagos e
os restreams em `dyndns`/IPs privados. Antes de publicar ou monetizar, confirme
os direitos de cada canal com o titular. Ver
[secção 9 da auditoria](AUDITORIA.md#9-legalidade-e-conformidade).
