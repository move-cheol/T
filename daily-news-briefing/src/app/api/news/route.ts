import { NextResponse } from 'next/server';
// @ts-ignore
import Parser from 'rss-parser';
// @ts-ignore
import yts from 'yt-search';
// @ts-ignore
import { search } from 'duck-duck-scrape';

async function fetchGoogleNews(keyword: string, limit = 5) {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`);
    return feed.items.slice(0, limit).map((item: any) => ({
      source: '뉴스',
      title: item.title || '',
      description: item.contentSnippet || item.content || '',
      link: item.link,
      pubDate: item.pubDate,
      brand: keyword,
    }));
  } catch (e) {
    console.error(`Google News Error for ${keyword}:`, e);
    return [];
  }
}

async function fetchYouTube(keyword: string, limit = 3) {
  try {
    const r = await yts(keyword);
    return r.videos.slice(0, limit).map((v: any) => ({
      source: '유튜브',
      title: v.title || '',
      description: v.description || `채널: ${v.author.name}`,
      link: v.url,
      pubDate: v.ago || '',
      brand: keyword,
    }));
  } catch (e) {
    console.error(`YouTube Error for ${keyword}:`, e);
    return [];
  }
}

async function fetchInstagram(keyword: string, limit = 3) {
  try {
    const r = await search(`site:instagram.com ${keyword}`);
    return r.results.slice(0, limit).map((res: any) => ({
      source: '인스타그램',
      title: res.title || '',
      description: res.description || '',
      link: res.url,
      pubDate: '',
      brand: keyword,
    }));
  } catch (e) {
    console.error(`Instagram Error for ${keyword}:`, e);
    return [];
  }
}

// 키워드 기반 감성 분석 및 점수 부여 함수
function heuristicAnalyze(title: string, description: string, negativeKeywordsStr: string) {
  const text = (title + ' ' + description).toLowerCase();
  
  // 부정 키워드 배열 파싱
  const negativeWords = negativeKeywordsStr
    ? negativeKeywordsStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0)
    : ['논란', '리콜', '소송', '불매', '사고', '공정위', '하락', '위기', '부작용', '의혹'];

  const positiveWords = ['출시', '1위', '돌파', '달성', '수상', '호조', '상승', '인기', '매출', '성공'];

  let isNegative = false;
  let isPositive = false;

  for (const word of negativeWords) {
    if (text.includes(word)) {
      isNegative = true;
      break;
    }
  }

  if (!isNegative) {
    for (const word of positiveWords) {
      if (text.includes(word)) {
        isPositive = true;
        break;
      }
    }
  }

  let sentiment = "중립";
  let score = 40 + Math.floor(Math.random() * 15); // 40~54

  if (isNegative) {
    sentiment = "부정";
    score = 80 + Math.floor(Math.random() * 21); // 80~100
  } else if (isPositive) {
    sentiment = "긍정";
    score = 60 + Math.floor(Math.random() * 15); // 60~74
  }

  // 단순 텍스트 요약 (최대 80자)
  let summary = description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (summary.length > 80) {
    summary = summary.substring(0, 80) + '...';
  } else if (summary.length === 0) {
    summary = title;
  }

  return { summary, sentiment, score };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config || !config.clientBrand) {
      return NextResponse.json({ error: '기준 브랜드가 설정되지 않았습니다.' }, { status: 400 });
    }

    const competitors = config.competitors
      ? config.competitors.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0)
      : [];

    const promises: Promise<any[]>[] = [];

    // 1. 자사 수집 (뉴스 10, 유튜브 5, 인스타 5)
    promises.push(fetchGoogleNews(config.clientBrand, 10));
    promises.push(fetchYouTube(config.clientBrand, 5));
    promises.push(fetchInstagram(config.clientBrand, 5));

    // 2. 경쟁사 수집 (뉴스 5, 유튜브 3, 인스타 3)
    competitors.forEach((comp: string) => {
      promises.push(fetchGoogleNews(comp, 5));
      promises.push(fetchYouTube(comp, 3));
      promises.push(fetchInstagram(comp, 3));
    });

    const resultsArray = await Promise.all(promises);
    const allItems = resultsArray.flat();

    if (allItems.length === 0) {
      return NextResponse.json({ ownNews: [], competitorNews: [] });
    }

    // 3. Heuristic 분석 병합
    const finalItems = allItems.map(item => {
      const analysis = heuristicAnalyze(item.title, item.description, config.negativeKeywords);
      return {
        ...item,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        score: analysis.score,
        selected: true
      };
    });

    // 4. 분류 및 정렬
    let finalOwnItems = finalItems.filter(n => n.brand === config.clientBrand);
    finalOwnItems.sort((a, b) => {
      if (a.sentiment === '부정' && b.sentiment !== '부정') return -1;
      if (a.sentiment !== '부정' && b.sentiment === '부정') return 1;
      return b.score - a.score;
    });

    let finalCompetitorItems = finalItems.filter(n => n.brand !== config.clientBrand);
    finalCompetitorItems.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      ownNews: finalOwnItems,
      competitorNews: finalCompetitorItems
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
