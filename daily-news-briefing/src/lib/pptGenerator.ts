import pptxgen from 'pptxgenjs';

export async function generatePPTX(config: any, ownNews: any[], competitorNews: any[], dateStr: string) {
  let pres = new pptxgen();

  // 슬라이드 크기: 16:9 표준 비율 (가로 10인치, 세로 5.625인치)
  pres.layout = 'LAYOUT_16x9';

  // 공통 상수
  const FONT_FACE = '맑은 고딕';
  const COLOR_INDIGO = '1E1A70';
  const COLOR_RED = 'C00000';
  const COLOR_GRAY = 'CCCCCC';
  const BG_GRADIENT_SIM = '1A1549';

  // 선택된 뉴스만 필터링
  const selectedOwn = ownNews.filter(n => n.selected);
  const selectedComp = competitorNews.filter(n => n.selected);

  // --- 1. 표지 슬라이드 ---
  let slideCover = pres.addSlide();
  slideCover.background = { color: BG_GRADIENT_SIM };
  
  slideCover.addText(`${config.clientBrand} 데일리 뉴스 브리핑`, {
    x: 0.5, y: 1.8, w: 9.0, h: 1.0,
    fontSize: 40, bold: true, color: 'FFFFFF', fontFace: FONT_FACE,
    align: 'center'
  });

  slideCover.addShape(pres.ShapeType.line, {
    x: 2.5, y: 3.0, w: 5, h: 0, line: { color: COLOR_RED, width: 3 }
  });

  slideCover.addText(`작성일: ${dateStr}`, {
    x: 1, y: 3.3, w: 8.0, h: 0.5,
    fontSize: 20, color: COLOR_GRAY, fontFace: FONT_FACE,
    align: 'center'
  });

  slideCover.addText('작성자: 몽규', {
    x: 1, y: 4.8, w: 8.0, h: 0.5,
    fontSize: 14, color: 'FFFFFF', fontFace: FONT_FACE,
    align: 'center'
  });

  // --- 2. 요약 대시보드 ---
  let slideDash = pres.addSlide();
  slideDash.background = { color: 'FFFFFF' };
  
  // 상단 헤더 바 (높이 0.4")
  slideDash.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.4, fill: { color: COLOR_INDIGO }
  });
  slideDash.addText('Executive Summary', {
    x: 0.4, y: 0.05, w: 9, h: 0.3,
    fontSize: 18, color: 'FFFFFF', bold: true, fontFace: FONT_FACE
  });

  // 요약: 자사 최대 3건 / 경쟁사 최대 3건
  const topOwn = selectedOwn.slice(0, 3);
  const topComp = selectedComp.slice(0, 3);

  slideDash.addText('■ 자사 주요 이슈', {
    x: 0.5, y: 0.6, w: 4.2, h: 0.4,
    fontSize: 18, bold: true, color: COLOR_INDIGO, fontFace: FONT_FACE
  });

  let curY = 1.1;
  topOwn.forEach((news) => {
    slideDash.addText(`[${news.sentiment}] ${news.summary.substring(0, 50)}...`, {
      x: 0.5, y: curY, w: 4.2, h: 0.7,
      fontSize: 14, color: news.sentiment === '부정' ? COLOR_RED : '333333', fontFace: FONT_FACE,
      bullet: { type: 'number' }, valign: 'top', breakLine: true
    });
    curY += 0.85;
  });

  slideDash.addText('■ 경쟁사 주요 동향', {
    x: 5.1, y: 0.6, w: 4.2, h: 0.4,
    fontSize: 18, bold: true, color: COLOR_INDIGO, fontFace: FONT_FACE
  });

  curY = 1.1;
  topComp.forEach((news) => {
    slideDash.addText(`[${news.brand}] ${news.summary.substring(0, 50)}...`, {
      x: 5.1, y: curY, w: 4.2, h: 0.7,
      fontSize: 14, color: '333333', fontFace: FONT_FACE,
      bullet: { type: 'number' }, valign: 'top', breakLine: true
    });
    curY += 0.85;
  });

  // --- 3. 자사 이슈 섹션 구분 ---
  let slideOwnDivider = pres.addSlide();
  slideOwnDivider.background = { color: BG_GRADIENT_SIM };
  slideOwnDivider.addText('자사 이슈 상세', {
    x: 1, y: 2.2, w: 8.0, h: 1.2,
    fontSize: 44, bold: true, color: 'FFFFFF', fontFace: FONT_FACE,
    align: 'center'
  });

  // --- 4. 자사 이슈 슬라이드 (16:9 환경에서는 한 장에 3건 권장) ---
  let slideOwnDetail = pres.addSlide();
  slideOwnDetail.background = { color: 'FFFFFF' };
  slideOwnDetail.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10, h: 0.4, fill: { color: COLOR_INDIGO }
  });
  slideOwnDetail.addText(`자사 주요 보도/동향 (${config.clientBrand})`, {
    x: 0.4, y: 0.05, w: 9, h: 0.3,
    fontSize: 18, color: 'FFFFFF', bold: true, fontFace: FONT_FACE
  });

  curY = 0.8;
  selectedOwn.slice(0, 3).forEach((news, idx) => {
    const accentColor = news.sentiment === '부정' ? COLOR_RED : COLOR_INDIGO;
    
    // 단계 번호
    slideOwnDetail.addShape(pres.ShapeType.ellipse, {
      x: 0.5, y: curY + 0.05, w: 0.3, h: 0.3, fill: { color: accentColor }
    });
    slideOwnDetail.addText(`0${idx + 1}`, {
      x: 0.5, y: curY + 0.05, w: 0.3, h: 0.3,
      fontSize: 12, color: 'FFFFFF', bold: true, fontFace: FONT_FACE, align: 'center'
    });

    // 제목
    slideOwnDetail.addText(`[${news.source}] ${news.title}`, {
      x: 1.0, y: curY, w: 8.5, h: 0.5,
      fontSize: 16, bold: true, color: accentColor, fontFace: FONT_FACE, valign: 'top', breakLine: true
    });

    // 본문 요약
    slideOwnDetail.addText(news.summary.substring(0, 100), {
      x: 1.0, y: curY + 0.55, w: 8.5, h: 0.6,
      fontSize: 13, color: '555555', fontFace: FONT_FACE, valign: 'top', breakLine: true
    });

    curY += 1.4;
  });

  // --- 5. 경쟁사 동향 섹션 구분 ---
  let slideCompDivider = pres.addSlide();
  slideCompDivider.background = { color: BG_GRADIENT_SIM };
  slideCompDivider.addText('경쟁사 동향 상세', {
    x: 1, y: 2.2, w: 8.0, h: 1.2,
    fontSize: 44, bold: true, color: 'FFFFFF', fontFace: FONT_FACE,
    align: 'center'
  });

  // --- 6. 경쟁사별 슬라이드 (16:9) ---
  const compGroups: { [key: string]: any[] } = {};
  selectedComp.forEach(news => {
    if (!compGroups[news.brand]) compGroups[news.brand] = [];
    compGroups[news.brand].push(news);
  });

  Object.keys(compGroups).forEach(brand => {
    const brandNews = compGroups[brand].slice(0, 3);
    
    let slideBrand = pres.addSlide();
    slideBrand.background = { color: 'FFFFFF' };
    slideBrand.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 10, h: 0.4, fill: { color: COLOR_INDIGO }
    });
    slideBrand.addText(`경쟁사 동향 (${brand})`, {
      x: 0.4, y: 0.05, w: 9, h: 0.3,
      fontSize: 18, color: 'FFFFFF', bold: true, fontFace: FONT_FACE
    });

    let yPos = 0.8;
    brandNews.forEach((news, idx) => {
      slideBrand.addShape(pres.ShapeType.ellipse, {
        x: 0.5, y: yPos + 0.05, w: 0.3, h: 0.3, fill: { color: COLOR_RED }
      });
      slideBrand.addText(`0${idx + 1}`, {
        x: 0.5, y: yPos + 0.05, w: 0.3, h: 0.3,
        fontSize: 12, color: 'FFFFFF', bold: true, fontFace: FONT_FACE, align: 'center'
      });

      slideBrand.addText(`[${news.source}] ${news.title}`, {
        x: 1.0, y: yPos, w: 8.5, h: 0.5,
        fontSize: 16, bold: true, color: '333333', fontFace: FONT_FACE, valign: 'top', breakLine: true
      });

      slideBrand.addText(news.summary.substring(0, 100), {
        x: 1.0, y: yPos + 0.55, w: 8.5, h: 0.6,
        fontSize: 13, color: '555555', fontFace: FONT_FACE, valign: 'top', breakLine: true
      });

      yPos += 1.4;
    });
  });

  // --- 7. 끝장 슬라이드 ---
  let slideEnd = pres.addSlide();
  slideEnd.background = { color: BG_GRADIENT_SIM };
  
  slideEnd.addText('The End', {
    x: 1, y: 1.8, w: 8.0, h: 1.0,
    fontSize: 44, bold: true, color: 'FFFFFF', fontFace: FONT_FACE,
    align: 'center'
  });

  slideEnd.addShape(pres.ShapeType.line, {
    x: 2.5, y: 3.0, w: 5, h: 0, line: { color: COLOR_RED, width: 3 }
  });

  slideEnd.addText('컴퍼스랩 임선집 / E-mail: nestad@naver.com', {
    x: 1, y: 3.3, w: 8.0, h: 0.5,
    fontSize: 16, color: COLOR_GRAY, fontFace: FONT_FACE,
    align: 'center'
  });

  const safeFileName = `${config.clientBrand}_데일리브리핑_${dateStr.replace(/-/g, '')}.pptx`;
  await pres.writeFile({ fileName: safeFileName });
}
