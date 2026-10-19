# EPG gerado

Esta pasta recebe o guia XMLTV curado em tempo de build:

```bash
node scripts/sync-epg.mjs
```

O ficheiro `lusofonia.xml` é gerado pelo workflow `sync-lusofonia.yml` a partir
das fontes listadas em `https://iptv-org.github.io/api/guides.json` e publicado
com a app (pode ser versionado para funcionar offline desde o primeiro arranque).

A app descarrega `/epg/lusofonia.xml`, valida o XMLTV, guarda-o em IndexedDB e
usa a última cópia válida quando está offline. Se o ficheiro não existir, o
guia mostra uma grelha estimada por categoria (fallback em
`data/programs.ts`).
