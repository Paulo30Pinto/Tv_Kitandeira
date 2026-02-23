import { Channel, StreamType, Country, Category } from './types';

export const CHANNELS: Channel[] = [
  // --- ANGOLA ---
  {
    id: 'tpa-online-yt',
    name: 'TPA Online (Direto)',
    description: 'Sinal oficial da Televisão Pública de Angola via YouTube. Acompanhe toda a programação informativa e de entretenimento angolano em tempo real.',
    logoColor: 'bg-yellow-600',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/TPA_Angola_Logo.png/600px-TPA_Angola_Logo.png',
    streamUrl: 'https://www.youtube.com/embed/9Xxhiz8UU6M',
    type: StreamType.YOUTUBE,
    country: Country.ANGOLA,
    category: Category.PUBLIC
  },
  {
    id: 'tv-zimbo',
    name: 'TV Zimbo',
    description: 'A primeira emissora privada de Angola. Programação diversificada com foco em jornalismo e debates em alta definição.',
    logoColor: 'bg-orange-700',
    logoImage: 'https://targeting.ao/shatsuph/2024/09/tvzimbohd.jpg',
    streamUrl: 'https://sgn-cdn-video.vods2africa.com/Tv-Zimbo/index.fmp4.m3u8',
    type: StreamType.HLS,
    country: Country.ANGOLA,
    category: Category.GENERAL
  },

  // --- INFANTIL & GEEK ---
  {
    id: 'retro-cartoon',
    name: 'Retro Cartoon',
    description: 'O melhor da animação clássica 24 horas por dia. Reviva os desenhos que marcaram gerações em sinal digital.',
    logoColor: 'bg-yellow-500',
    logoImage: 'https://logos.textgiraffe.com/logos/logo-name/Cartoon-designstyle-cartoon-m.png',
    streamUrl: 'https://stmv1.video.brstream.com.br/retrotv/retrotv/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.KIDS
  },
  {
    id: 'retro-tv',
    name: 'Retro TV',
    description: 'Uma viagem no tempo com os maiores clássicos da TV brasileira e mundial. Filmes, séries e programas que marcaram época.',
    logoColor: 'bg-amber-600',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Retro_TV_logo.svg/250px-Retro_TV_logo.svg.png',
    streamUrl: 'https://stmv1.video.brstream.com.br/retrotv/retrotv/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'anime-tv',
    name: 'Anime TV',
    description: 'O portal para o mundo das animações orientais. Séries e clássicos da cultura japonesa 24 horas por dia.',
    logoColor: 'bg-indigo-600',
    logoImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0PfTP__Jqm9TMzhLoZL6IKIeiQj3efnfkRtWqCYW-xLc9zIyXh_SobraWhxQ&s',
    streamUrl: 'https://stmv1.srvif.com/anime/anime/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.KIDS
  },
  {
    id: 'ichiban-tv',
    name: 'Ichiban TV',
    description: 'O melhor da cultura pop japonesa, animes clássicos e modernos em sinal digital 24 horas.',
    logoColor: 'bg-red-600',
    logoImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyntJ3MH-NKUjedapKMxMzhC_GVI4G4k5N_PJvVORwbv5hpSVpTfnAbR9w4Q&s',
    streamUrl: 'https://stream.ichibantv.com:3764/hybrid/play.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.KIDS
  },
  {
    id: '3abn-kids',
    name: '3ABN Kids',
    description: 'Programação infantil educativa com foco em valores cristãos, música e histórias bíblicas (Inglês).',
    logoColor: 'bg-cyan-500',
    logoImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcRPDqgv2LryTarq5J8q6eQMIcPvYHiK56nCXWfU2Mdkamy2A2cryTdLtW0Q&s',
    streamUrl: 'https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.USA,
    category: Category.KIDS
  },
  {
    id: 'gospel-cartoon',
    name: 'Gospel Cartoon',
    description: 'Animações e desenhos com valores cristãos e mensagens positivas para o público infantil em sinal digital.',
    logoColor: 'bg-sky-600',
    logoImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsuPadrMESkbDWic6fsrchFUcqQsd_oUqco3x3sZHqBP0SN_MJvcLfRqF-6UY&s',
    streamUrl: 'https://stmv1.srvif.com/gospelcartoon/gospelcartoon/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.KIDS
  },
  {
    id: 'lucas-tv',
    name: 'Lucas TV',
    description: 'Diversão garantida para o público infantil e juvenil. Aventuras, cores e muito entretenimento para a criançada.',
    logoColor: 'bg-sky-400',
    logoImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCp0rApjP985RchYaQnu5Ddhcy2O_TxyavrxMf9sMBQnnUg4rnr21PdnQ9lg&s',
    streamUrl: 'https://stmv1.srvif.com/lucastv/lucastv/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.KIDS
  },
  {
    id: 'loading-tv',
    name: 'Loading TV',
    description: 'Cultura pop, games, eSports e animes. O canal definitivo para a geração conectada e fã de entretenimento geek.',
    logoColor: 'bg-fuchsia-600',
    logoImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqWf_QVWyV9NgNuOHtoKF7OCsvXrn8bcyN3HLXCpHTSPAnylJBE9zXBJ4iWA&s',
    streamUrl: 'https://stmv1.srvif.com/loadingtv/loadingtv/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.KIDS
  },

  // --- BRASIL ---
  {
    id: 'cnn-brasil',
    name: 'CNN Brasil',
    description: 'A maior rede de notícias do mundo em sua versão brasileira. Cobertura completa 24 horas dos principais fatos globais.',
    logoColor: 'bg-red-800',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/CNN_Brasil_logo.svg/250px-CNN_Brasil_logo.svg.png',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCv9f3uUuayI-R_Ww88E7YxA',
    type: StreamType.YOUTUBE,
    country: Country.BRASIL,
    category: Category.NEWS
  },
  {
    id: 'central-tv',
    name: 'Central TV',
    description: 'Programação variada com foco em jornalismo, entretenimento e cultura regional em alta definição.',
    logoColor: 'bg-indigo-500',
    streamUrl: 'https://tv01.zas.media:1936/centraltvweb/centraltvweb/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'tv-cidade-verde',
    name: 'TV Cidade Verde',
    description: 'Afiliada SBT no Piauí. O jornalismo de credibilidade e a programação que o povo piauiense confia.',
    logoColor: 'bg-emerald-600',
    logoImage: 'https://upload.wikimedia.org/wikipedia/pt/1/15/Logotipo_da_TV_Cidade_Verde.png',
    streamUrl: 'https://stmv1.transmissaodigital.com/cidadeverdenovo/cidadeverdenovo/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'tv-cidade-brasil',
    name: 'TV Cidade Brasil',
    description: 'Um canal dedicado à integração nacional, trazendo informação, cultura e o melhor do entretenimento regional para todo o país.',
    logoColor: 'bg-cyan-700',
    streamUrl: 'https://stmv2.samcast.com.br/tvcidadebrasil/tvcidadebrasil/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'multicanais-tv',
    name: 'Multicanais TV',
    description: 'Conteúdo variado com filmes, séries e programas de variedades em alta definição para o público brasileiro.',
    logoColor: 'bg-blue-950',
    streamUrl: 'https://stmv2.painelvideocast.com.br/multicanais/multicanais/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'clouding-tv',
    name: 'Clouding TV',
    description: 'Uma nova experiência em televisão digital com foco em entretenimento, variedades e programação cultural dinâmica.',
    logoColor: 'bg-blue-500',
    streamUrl: 'https://stmv7.voxtvhd.com.br/clouding/clouding/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'rogerio-tv',
    name: 'Rogério TV',
    description: 'Canal de variedades com programação diversificada, incluindo música, cultura e informação regional.',
    logoColor: 'bg-blue-800',
    streamUrl: 'https://video01.kshost.com.br:4443/rogerio7271/rogerio7271/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'sony-one-emocoes',
    name: 'Sony One Emoções',
    description: 'O canal dedicado aos grandes sucessos da Sony Pictures. Dramas, romances e histórias emocionantes que cativam o público brasileiro.',
    logoColor: 'bg-slate-900',
    streamUrl: 'https://spt-sonyoneemocoes-1-br.samsung.wurl.tv/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'tvr',
    name: 'TVR',
    description: 'Programação variada com foco em informação, cultura regional e entretenimento de qualidade para toda a família.',
    logoColor: 'bg-blue-600',
    streamUrl: 'https://tvchannel.tvr.ovh/video28392/video28392/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'canal-29',
    name: 'Canal 29',
    description: 'Conteúdo regional diversificado, trazendo informação, cultura e entretenimento local em alta qualidade.',
    logoColor: 'bg-purple-700',
    streamUrl: 'https://stmv1.srvif.com/canal29/canal29/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'tv-serie',
    name: 'TV Série',
    description: 'As melhores séries, dramas e maratonas de entretenimento em um canal dedicado 24h para os apaixonados por seriados.',
    logoColor: 'bg-rose-700',
    streamUrl: 'https://stmv1.srvif.com/tvserie/tvserie/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'tv-aracati',
    name: 'TV Aracati',
    description: 'A voz do litoral leste cearense. Notícias locais, cultura e entretenimento direto de Aracati para o mundo.',
    logoColor: 'bg-blue-700',
    streamUrl: 'https://video04.logicahost.com.br/tvaracati/tvaracati/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'xtreme-tv',
    name: 'Xtreme TV',
    description: 'Ação, esportes radicais e entretenimento dinâmico. O canal para quem busca adrenalina e cultura urbana.',
    logoColor: 'bg-orange-600',
    streamUrl: 'https://stmv.webtvninjas.com.br/xtremetv54/xtremetv54/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.GENERAL
  },
  {
    id: 'record-news-br',
    name: 'Record News',
    description: 'Jornalismo 24 horas por dia. Acompanhe as principais notícias do Brasil e do mundo em sinal digital.',
    logoColor: 'bg-slate-800',
    streamUrl: 'https://run-rnw-rn.otteravision.com/rnw/rn/rnw_rn_720p_high.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.NEWS
  },

  // --- NOVELAS & FILMES ---
  {
    id: 'sony-novelas',
    name: 'Sony Novelas',
    description: 'O destino principal para os amantes de teledramaturgia. Sucessos internacionais 24h por dia.',
    logoColor: 'bg-pink-900',
    streamUrl: 'https://spt-novelas-1-us.canelatv.wurl.tv/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.GENERAL
  },
  {
    id: 'telemundo-accion',
    name: 'Telemundo Acción',
    description: 'Adrenalina pura com as melhores séries de action, suspense e dramas policiais latinos.',
    logoColor: 'bg-red-950',
    streamUrl: 'https://d3rciv7av2te5a.cloudfront.net/v1/master/3fec3e5cac39a52b2132f9c66c83dae043dc17d4/prod-plex/master.m3u8?ads.xumo_channelId=88889470',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.GENERAL
  },
  {
    id: 'azteca-mundo',
    name: 'Azteca Mundo',
    description: 'Um dos maiores canais de entretenimento da América Latina, trazendo novelas, séries e variedades de grande sucesso global.',
    logoColor: 'bg-emerald-700',
    streamUrl: 'https://azt-mun.otteravision.com/azt/mun/mun.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.GENERAL
  },

  // --- PORTUGAL ---
  {
    id: 'cnn-portugal',
    name: 'CNN Portugal',
    description: 'Informação de rigor e credibilidade. Acompanhe as notícias de Portugal e do mundo em direto.',
    logoColor: 'bg-red-700',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/CNN_Portugal.svg/1200px-CNN_Portugal.svg.png',
    streamUrl: 'https://video-auth1.iol.pt/live_cnn/live_cnn/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.PORTUGAL,
    category: Category.NEWS
  },
  {
    id: 'rtp-i',
    name: 'RTP Internacional',
    description: 'O canal que une a comunidade lusófona global com o melhor da cultura e informação de Portugal.',
    logoColor: 'bg-blue-900',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/RTP_Internacional.svg/800px-RTP_Internacional.svg.png',
    streamUrl: 'https://streaming-live.rtp.pt/liverepeater/smil:rtpi.smil/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.PORTUGAL,
    category: Category.PUBLIC
  },
  {
    id: 'tvi-ficcao',
    name: 'TVI Ficção',
    description: 'Canal português dedicado à melhor ficção nacional. Reviva as grandes histórias, novelas e séries de sucesso da TVI 24 horas por dia.',
    logoColor: 'bg-pink-600',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/TVI_Fic%C3%A7%C3%A3o_2017.svg/800px-TVI_Fic%C3%A7%C3%A3o_2017.svg.png',
    streamUrl: 'https://video-auth2.iol.pt/live_tvi_ficcao/live_tvi_ficcao/edge_servers/tvificcao-720p/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.PORTUGAL,
    category: Category.GENERAL
  },

  // --- MÚSICA ---
  {
    id: 'trace-urban',
    name: 'Trace Urban',
    description: 'O canal número um de música urbana. Acompanhe os maiores sucessos do Hip-Hop, R&B e ritmos globais 24 horas por dia.',
    logoColor: 'bg-indigo-950',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Trace_Urban_Logo_2011.png/640px-Trace_Urban_Logo_2011.png',
    streamUrl: 'https://amg01076-lightningintern-traceurban-xiaomi-m78n3.amagi.tv/playlist/amg01076-lightningintern-traceurban-xiaomi/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.MUSIC
  },

  // --- ESPECIALIZADOS & GLOBAL ---
  {
    id: 'euronews-pt',
    name: 'Euronews',
    description: 'Acompanhe as últimas notícias da Europa e do mundo. Informação independente e cobertura em tempo real.',
    logoColor: 'bg-blue-600',
    logoImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Euronews_logo.svg/800px-Euronews_logo.svg.png',
    streamUrl: 'https://www.youtube.com/embed/XuZAl-ZPEcA',
    type: StreamType.YOUTUBE,
    country: Country.GLOBAL,
    category: Category.NEWS
  },
  {
    id: 'premier-uk',
    name: 'Premier UK',
    description: 'O melhor do desporto e entretenimento internacional direto do Reino Unido em alta definição.',
    logoColor: 'bg-blue-900',
    streamUrl: 'https://profamouslife.com/premium.php?player=desktop&live=premieruk',
    type: StreamType.IFRAME,
    country: Country.UK,
    category: Category.SPORTS
  },
  {
    id: 'gia-tv',
    name: 'GIA TV',
    description: 'Transmissão global com foco em espiritualidade, cultura e programas de variedades para toda a família.',
    logoColor: 'bg-violet-800',
    streamUrl: 'https://live20.bozztv.com/giatvplayout7/giatv-208272/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.GENERAL
  },
  {
    id: 'rssports',
    name: 'RSSports',
    description: 'O canal dedicado à emoção do esporte. Acompanhe as principais competições, debates e coberturas completas.',
    logoColor: 'bg-red-900',
    streamUrl: 'https://video03.logicahost.com.br/rssports5/rssports5/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.SPORTS
  },
  {
    id: 'nsports',
    name: 'NSports',
    description: 'O canal de esportes para quem vive a emoção das competições. Transmissões variadas e eventos ao vivo.',
    logoColor: 'bg-red-700',
    streamUrl: 'https://ogc-nsprt-tcl-roku-syndication.otteravision.com/ogc/nsprt/nsprt_720p.m3u8',
    type: StreamType.HLS,
    country: Country.BRASIL,
    category: Category.SPORTS
  },
  {
    id: 'fifa-plus',
    name: 'FIFA+',
    description: 'O canal oficial da FIFA com o melhor do futebol mundial. Jogos históricos, documentários e transmissões ao vivo.',
    logoColor: 'bg-blue-800',
    logoImage: 'https://digitalhub.fifa.com/transform/54504179-8d76-411a-8c7c-482470c1737e/FIFA_Plus_Logo_Neutral_White',
    streamUrl: 'https://c2657533.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UGxleC1icl9GSUZBUGx1c1BvcnR1Z3Vlc2VfSExT/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.SPORTS
  },
  {
    id: 'barca-tv',
    name: 'Barça TV',
    description: 'O canal oficial do FC Barcelona. Acompanhe os bastidores, jogos históricos e conteúdos exclusivos.',
    logoColor: 'bg-blue-900',
    logoImage: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/800px-FC_Barcelona_%28crest%29.svg.png',
    streamUrl: 'https://amg17560-fcb-amg17560c1-rakuten-uk-4891.playouts.now.amagi.tv/playlist/amg17560-fcbarcelona-topbarcaenglish-rakutenuk/playlist.m3u8',
    type: StreamType.HLS,
    country: Country.SPAIN,
    category: Category.SPORTS
  },
  {
    id: 'real-madrid-tv',
    name: 'Real Madrid TV',
    description: 'O canal oficial do Real Madrid CF. Notícias, treinos, jogos históricos e cobertura exclusiva.',
    logoColor: 'bg-blue-600',
    logoImage: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/800px-Real_Madrid_CF.svg.png',
    streamUrl: 'https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8',
    type: StreamType.HLS,
    country: Country.SPAIN,
    category: Category.SPORTS
  },
  {
    id: 'redbull-tv',
    name: 'Red Bull TV',
    description: 'Esportes de ação, festivais de música e documentários exclusivos sobre alta performance.',
    logoColor: 'bg-zinc-900',
    logoImage: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/RedBullTVLogo.svg/800px-RedBullTVLogo.svg.png',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    type: StreamType.HLS,
    country: Country.GLOBAL,
    category: Category.SPORTS
  }
];