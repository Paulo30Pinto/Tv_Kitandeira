import { Channel, EPGProgram, Category } from '../types';

// Dynamic EPG schedule generator based on channel category and name
export const getChannelSchedule = (channel: Channel): EPGProgram[] => {
  const now = new Date();
  const currentHour = now.getHours();

  // Template programs based on category
  const programTemplates: Record<string, { title: string; desc: string; duration: number }[]> = {
    [Category.NEWS]: [
      { title: 'Jornal da Manhã', desc: 'Primeira edição com as principais manchetes de Angola e do mundo.', duration: 2 },
      { title: 'Notícias em Foco', desc: 'Análise detalhada dos acontecimentos políticos e económicos.', duration: 1 },
      { title: 'Telejornal 1ª Edição', desc: 'Informação rigorosa, reportagens em direto e entrevistas.', duration: 2 },
      { title: 'Jornal da Tarde', desc: 'Atualização das notícias nacionais e cotações dos mercados.', duration: 1.5 },
      { title: 'Grande Entrevista', desc: 'Debate com personalidades de destaque da sociedade.', duration: 1.5 },
      { title: 'Telejornal da Noite', desc: 'A síntese completa dos principais factos do dia em Angola.', duration: 2 },
      { title: 'Radar Internacional', desc: 'Cobertura diplomática e acontecimentos globais.', duration: 1.5 },
      { title: 'Última Hora 24H', desc: 'Boletim de encerramento e síntese jornalística noturna.', duration: 2 },
    ],
    [Category.SPORTS]: [
      { title: 'Manhã Desportiva', desc: 'Resumo dos treinos e antevisão dos grandes jogos da rodada.', duration: 2 },
      { title: 'Girabola em Revista', desc: 'Melhores lances, golos e entrevistas do campeonato nacional.', duration: 1.5 },
      { title: 'Futebol Internacional HD', desc: 'Transmissão e análise das maiores ligas europeias.', duration: 2.5 },
      { title: 'Debate da Bola', desc: 'Comentários táticos com ex-jogadores e especialistas.', duration: 1.5 },
      { title: 'Champions League Show', desc: 'Magazines e resumos dos encontros europeus de elite.', duration: 2 },
      { title: 'Planeta Desporto', desc: 'Basquetebol, automobilismo e desportos de combate.', duration: 1.5 },
      { title: 'Jornal dos Campeões', desc: 'Golos da rodada e classificação atualizada.', duration: 2 },
    ],
    [Category.NOVELAS]: [
      { title: 'Novela da Manhã: Segredos do Destino', desc: 'Reprise dos capítulos mais marcantes com reviravoltas emocionantes.', duration: 1.5 },
      { title: 'Coração Apaixonado', desc: 'Drama romântico e intrigas familiares em alta tensão.', duration: 1.5 },
      { title: 'Amor Proibido', desc: 'A luta de duas famílias rivais pelo controlo do império.', duration: 2 },
      { title: 'Terra de Paixões', desc: 'Grandes revelações e segredos do passado vêm à tona.', duration: 1.5 },
      { title: 'Vidas Cruzadas (Estreia)', desc: 'Capítulo especial com grandes desfechos e fortes emoções.', duration: 2 },
      { title: 'Estrela Guia', desc: 'Novela internacional de grande sucesso dobrada em português.', duration: 1.5 },
    ],
    [Category.MUSIC]: [
      { title: 'Top Afrobeat & Kizomba', desc: 'Os videoclipes mais pedidos nas pistas de dança.', duration: 2 },
      { title: 'Semba das Nossas Raízes', desc: 'Homenagem aos grandes clássicos da música popular angolana.', duration: 2 },
      { title: 'Mix Urbano & Hip-Hop', desc: 'Lançamentos de videoclipes nacionais e internacionais.', duration: 2 },
      { title: 'Kuduro Total Power', desc: 'As melhores coreografias e hits do momento.', duration: 1.5 },
      { title: 'Sessão Acústica Ao Vivo', desc: 'Concertos intimistas e performances exclusivas.', duration: 2 },
      { title: 'Noite Eletrónica & Amapiano', desc: 'Setlists dos melhores DJs da África Austral.', duration: 2.5 },
    ],
    [Category.KIDS]: [
      { title: 'Despertar com Desenhos', desc: 'Aventuras animadas cheias de cor e diversão para começar o dia.', duration: 2 },
      { title: 'O Clube das Crianças', desc: 'Histórias educativas, canções e fantoches divertidos.', duration: 1.5 },
      { title: 'Aventuras na Selva', desc: 'Animação fantástica com animais exploradores e lições de amizade.', duration: 2 },
      { title: 'Super-Heróis em Ação', desc: 'Missões eletrizantes para salvar o planeta de vilões cómicos.', duration: 2 },
      { title: 'Cinema Infantil: O Reino Mágico', desc: 'Longa-metragem animada para toda a família.', duration: 2 },
    ],
    [Category.MOVIES]: [
      { title: 'Clássicos do Cinema', desc: 'Obras-primas da sétima arte que marcaram gerações.', duration: 2 },
      { title: 'Sessão da Tarde: Comédia em Família', desc: 'Filmes leves e divertidos para animar a tarde.', duration: 2 },
      { title: 'Ação Sem Limites HD', desc: 'Muita adrenalina, perseguições e efeitos especiais.', duration: 2.5 },
      { title: 'Cine Premium 4K: Lançamento', desc: 'Estreia exclusiva de um blockbuster premiado.', duration: 2.5 },
      { title: 'Suspense & Mistério Noturno', desc: 'Trilhas eletrizantes e reviravoltas de tirar o fôlego.', duration: 2 },
    ],
    [Category.EDUCATION]: [
      { title: 'Mundo Selvagem & Natureza', desc: 'Expedições pelos ecossistemas mais fascinantes do planeta.', duration: 2 },
      { title: 'Ciência do Futuro', desc: 'As inovações tecnológicas e avanços espaciais.', duration: 1.5 },
      { title: 'História das Civilizações', desc: 'Documentário arqueológico sobre reinos antigos de África.', duration: 2 },
      { title: 'Planeta Terra 4K', desc: 'Imagens espetaculares da vida marinha e florestas tropicais.', duration: 2 },
    ],
  };

  const defaultTemplates = [
    { title: `${channel.name} Ao Vivo Especial`, desc: `Programação exclusiva transmitida pelo canal ${channel.name} em alta qualidade.`, duration: 2 },
    { title: 'Revista de Variedades', desc: 'Cultura, moda, gastronomia e entrevistas com convidados.', duration: 2 },
    { title: 'Tarde em Direto', desc: 'Entretenimento, música ao vivo e concursos interativos.', duration: 2.5 },
    { title: 'Jornal da Noite', desc: 'A informação mais importante da atualidade nacional e internacional.', duration: 1.5 },
    { title: 'Noite de Espetáculo', desc: 'Grandes concertos, humor e cinema de alta definição.', duration: 2.5 },
    { title: 'Emissão Noturna', desc: 'Os melhores momentos do dia e selecção musical relaxante.', duration: 3 },
  ];

  const templates = programTemplates[channel.category] || defaultTemplates;

  // Build a 24-hour cycle of programs starting from 06:00
  let startHour = 6;
  const programs: EPGProgram[] = [];

  templates.forEach((t, i) => {
    const sH = (startHour % 24).toString().padStart(2, '0');
    const sM = '00';
    const endRaw = startHour + t.duration;
    const eH = (Math.floor(endRaw) % 24).toString().padStart(2, '0');
    const eM = endRaw % 1 === 0.5 ? '30' : '00';

    const isCurrent = (currentHour >= startHour && currentHour < endRaw) || 
                      (startHour > endRaw && (currentHour >= startHour || currentHour < endRaw));

    programs.push({
      id: `prog-${channel.id}-${i}`,
      channelId: channel.id,
      title: t.title,
      description: t.desc,
      startTime: `${sH}:${sM}`,
      endTime: `${eH}:${eM}`,
      category: channel.category,
      isLive: isCurrent,
    });

    startHour = Math.floor(endRaw);
  });

  return programs;
};

// Returns the active live program, next upcoming program, and dynamic progress bar percent
export const getCurrentAndNextProgram = (channel: Channel) => {
  const schedule = getChannelSchedule(channel);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentIndex = schedule.findIndex((p) => {
    const [sH, sM] = p.startTime.split(':').map(Number);
    const [eH, eM] = p.endTime.split(':').map(Number);
    const startMin = sH * 60 + sM;
    let endMin = eH * 60 + eM;
    if (endMin < startMin) endMin += 24 * 60; // crossed midnight

    let checkMin = currentMinutes;
    if (checkMin < startMin && endMin > 24 * 60) checkMin += 24 * 60;

    return checkMin >= startMin && checkMin < endMin;
  });

  if (currentIndex === -1) {
    currentIndex = 0;
  }

  const currentProgram = schedule[currentIndex] || {
    id: `live-${channel.id}`,
    channelId: channel.id,
    title: `${channel.name} Ao Vivo HD`,
    description: channel.description || 'Emissão ao vivo contínua no TeIP.',
    startTime: '14:00',
    endTime: '16:00',
    category: channel.category,
    isLive: true,
  };

  const nextProgram = schedule[(currentIndex + 1) % schedule.length] || {
    id: `next-${channel.id}`,
    channelId: channel.id,
    title: `Próximo Programa: ${channel.name}`,
    description: 'Sequência da grade de programação oficial.',
    startTime: '16:00',
    endTime: '18:00',
    category: channel.category,
    isLive: false,
  };

  // Calculate realistic progress percent
  const [sH, sM] = currentProgram.startTime.split(':').map(Number);
  const [eH, eM] = currentProgram.endTime.split(':').map(Number);
  const startTotal = sH * 60 + sM;
  let endTotal = eH * 60 + eM;
  if (endTotal < startTotal) endTotal += 24 * 60;

  let currentTotal = currentMinutes;
  if (currentTotal < startTotal && endTotal > 24 * 60) currentTotal += 24 * 60;

  const duration = Math.max(1, endTotal - startTotal);
  const elapsed = Math.max(0, currentTotal - startTotal);
  const progressPercent = Math.min(100, Math.max(5, Math.round((elapsed / duration) * 100)));

  const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return {
    currentProgram,
    nextProgram,
    progressPercent,
    formattedTime,
    fullSchedule: schedule,
  };
};
