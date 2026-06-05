# AI Trend Radar

`AI Trend Radar`는 AI 관련 최신 자료를 수집하고, 중복을 정리하고, 신뢰도와 바이럴 가능성을 평가한 뒤 한국어 인스타그램 카드뉴스/릴스 콘텐츠 후보로 가공하는 편집국 시스템이다.

자동 실행이나 자동 게시가 아니라, 사용자가 평일에 직접 명령했을 때 Codex가 자료 수집, 정리, 후보 보고서 생성을 수행하는 수동 트리거형 프로젝트다.

## 계정 콘셉트

> AI 시대에 돈과 일이 어떻게 바뀌는지 가장 쉽게 정리하는 계정

관점은 항상 좁게 유지한다.

> 이 AI 변화가 일반인의 일, 돈, 자동화, 콘텐츠 수익화, 부업, 업무 방식에 어떤 영향을 주는가?

## 지원하는 콘텐츠 범위

- AI TREND, AI NEWS, AI TOOL
- AI AUTOMATION, AI 콘텐츠 자동화
- AI MONEY, AI SIDE HUSTLE, SNS 수익화
- AI 부업 현실과 과장광고/사기/착각 해부
- AI가 일과 직업에 미치는 영향
- AI 신기능, 신제품, 공식 발표
- GitHub/오픈소스 AI 도구
- Product Hunt 신규 AI 제품
- YouTube AI 데모
- arXiv AI 논문 중 일반인에게 흥미롭게 풀 수 있는 것

## 후보 포맷

`REELS`: 움직임과 시각적 충격이 핵심인 자료다. 영상 데모, 로봇, AI 영상 생성, AI 광고, AI 음성, AI 아바타, AI 게임, AI 시뮬레이션처럼 한 장면만 봐도 반응이 나오는 소재에 사용한다.

`CAROUSEL`: 설명, 정리, 해석, 저장 가치가 핵심인 자료다. AI 자동화 흐름, 프롬프트 가이드, 부업 구조, 업무 적용법, 수익화 분석, 사기성 주장 해부에 사용한다.

`REELS_FIRST`: 릴스와 카드뉴스 둘 다 가능하지만 오늘 제작은 릴스를 먼저 추천하는 자료다. Visual 8 이상, Reels fit 8 이상이면 Summary의 릴스 1순위 후보로 우선 검토한다.

`BOTH`: 시각적 충격도 있고 시장 변화나 활용법 설명도 가능한 자료다. 단, 릴스 적합도가 충분히 높으면 `REELS_FIRST`로 분리한다.

`HOLD`: 리스크가 높거나 출처가 부족하거나 저작권이 애매하거나 내용이 빈약한 자료다. HIGH 위험 후보는 기본적으로 HOLD 처리한다.

## 설치 방법

```bash
npm install
```

현재 버전은 외부 패키지 없이 동작하는 스켈레톤이다. `npm install`은 잠금 파일과 환경 확인용으로만 사용해도 된다.

## 실행 방법

오늘 날짜 기준 후보 보고서를 생성한다.

```bash
npm run daily
```

특정 날짜로 실행하려면 다음처럼 날짜를 넘긴다.

```bash
npm run daily -- --date 2026-06-04
```

샘플 수집 결과만 저장한다.

```bash
npm run collect
```

보고서 생성 흐름을 쓰기 없이 확인한다.

```bash
npm run check
```

저장된 scored JSON으로 보고서만 다시 만든다.

```bash
npm run report
```

## 결과물 위치

일일 결과물은 항상 `outputs/daily/`에 저장한다.

예:

```txt
outputs/daily/2026-06-04-candidates.md
outputs/daily/2026-06-04-candidates.json
```

중간 산출물은 다음 위치에 저장된다.

```txt
data/raw/
data/normalized/
data/clusters/
data/scored/
```

## Windows/Mac Git 동기화 방법

작업 시작 전:

```bash
git pull
```

작업 후:

```bash
git status
git add .
git commit -m "Add AI trend candidates for YYYY-MM-DD"
git push
```

Codex 작업 전 규칙:

```txt
작업 전에 git status 확인
README.md와 AGENTS.md 확인
기존 구조 유지
결과물은 outputs/daily/에 저장
```

이 저장소는 `.gitattributes`로 주요 텍스트 파일의 LF 줄바꿈을 고정한다. Windows와 MacBook을 번갈아 사용할 때도 파일 구조와 줄바꿈이 흔들리지 않도록 한다.

## API 키 설정 방법

실제 수집기는 이후 단계에서 연결한다. API 키가 필요한 경우 `.env.example`에 정의된 이름을 참고해 로컬 `.env` 파일에만 넣는다.

```bash
cp .env.example .env
```

실제 키는 절대 커밋하지 않는다. 현재 스켈레톤은 API 키 없이 샘플 데이터만으로 실행된다.

## 주간 운영 기준

초기 1개월 운영 기준:

```txt
주 7회 업로드
릴스 3회
카드뉴스 4회
```

추천 요일:

```txt
월: 카드뉴스 / AI 트렌드 정리
화: 릴스 / 강한 데모·시각 자료
수: 카드뉴스 / AI 자동화·활용법
목: 릴스 / 신기한 AI 사례
금: 카드뉴스 / AI 부업·돈벌이 구조
토: 릴스 / 바이럴형 AI 데모
일: 카드뉴스 또는 주간 AI 요약
```

역할:

- 릴스: 도달/발견/바이럴
- 카드뉴스: 저장/신뢰/팔로우 전환
- 캡션: 체류/이해/전문성

## 저작권/출처/리스크 주의 사항

- 출처 URL을 반드시 보존한다.
- 사실과 후킹 문구를 분리한다.
- 공식 확인되지 않은 내용을 확정 표현으로 쓰지 않는다.
- 무단 다운로드나 무단 재사용을 하지 않는다.
- 저작권이 애매한 이미지/영상은 참고 자료로만 분류한다.
- 정치, 투자, 코인, 금융수익 보장, 실존 인물 가짜 발언, 의료/법률 조언은 고위험 주제로 본다.
- HIGH RISK 후보는 발행 추천하지 않고 HOLD 처리한다.
- "100%", "무조건 돈 됨", "수익 보장", "확정" 같은 표현은 금지한다.

## Codex 사용 루틴

1. 사용자가 평일에 직접 Codex에게 실행을 요청한다.
2. Codex는 `AGENTS.md`와 `README.md`를 확인한다.
3. Codex는 필요한 수집기 또는 샘플 데이터를 실행한다.
4. 자료를 정규화하고 클러스터링한다.
5. 신뢰도, 바이럴 가능성, 한국 독자 관련성, 리스크를 평가한다.
6. `REELS`, `REELS_FIRST`, `CAROUSEL`, `BOTH`, `HOLD`를 판단한다.
7. 소스 링크와 요약 주제가 일치하는지 확인하고 `source_match_status`, `fact_check_status`를 남긴다.
8. `non_expert_hook`, `plain_language_summary`, `why_people_should_care`, `everyday_example`, `jargon_translation`, `expert_note`를 생성한다.
9. `scroll_stop_score`, `easy_understanding_score`, `jargon_penalty`로 대중화 가능성을 평가한다.
10. 제목 후보를 `General Hook`, `Viral Hook`, `Expert Note Hook`으로 생성하고 가장 쉽게 이해되는 강한 후킹 제목을 추천한다.
11. 카드 구성안, 릴스 구성안, 후보별로 다른 문장 구조의 캡션 초안, 구체적인 이미지 프롬프트를 생성한다.
12. 보고서에 노출되는 사실/주의/해석 문장은 사람이 바로 읽을 수 있게 한국어 표시를 우선한다.
13. Markdown과 JSON 결과를 `outputs/daily/`에 저장한다.

## 다음 구현 우선순위

1단계는 현재 스켈레톤과 샘플 보고서 생성이다.

2단계에서는 Hacker News, GitHub, arXiv, YouTube 링크 수집 구조, Product Hunt 구조를 준비한다.

3단계에서는 정규화, 클러스터링, 점수화, 리스크 분류, 포맷 판단 품질을 높인다.

4단계에서는 제목 후보, 카드 구성, 릴스 구성, 자세한 캡션, 이미지 프롬프트 품질을 개선한다.

5단계에서는 실제 운영 결과를 보며 출력 포맷을 다듬는다.
