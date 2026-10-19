# `data/channels/` — listas de referência

Esta pasta **não** é a fonte de verdade do catálogo em runtime.

A app carrega os canais de:

```
data/lusofonia.curation.json
        │  scripts/sync-lusofonia.mjs
        ▼
data/lusofonia.generated.json
        │  src/data/lusofonia.ts
        ▼
LUSOFONIA_CHANNELS → src/data/channels.ts → ALL_CHANNELS
```

## O que está aqui

| Ficheiro | Papel |
| --- | --- |
| `portugal.reference.ts` | 20 canais portugueses recomendados, tipados como `Channel`. Serve para revisão, migração e cópia para projetos que ainda usam `constants.ts`. |

## Regras

- **Não importar** `portugal.reference.ts` em paralelo com
  `LUSOFONIA_CHANNELS`: os canais aparecem duplicados.
- Para adicionar canais à app, editar `data/lusofonia.curation.json` e correr
  `npm run sync:channels`.
- As listas de referência devem continuar a compilar (`npx tsc --noEmit`),
  para garantir que o formato acompanha a interface `Channel`.
- Não guardar aqui URLs de `dyndns`/IP/GitHub de terceiros como se fossem
  fontes oficiais.

Ver [`docs/PORTUGAL.md`](../../docs/PORTUGAL.md) para a análise e o
enquadramento legal.
