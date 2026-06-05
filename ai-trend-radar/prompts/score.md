# Score Prompt

후보를 0~10점 척도로 평가한다.

최종 점수:

```txt
final_score = material_score * 0.4 + content_score * 0.4 - risk_score * 0.2
```

material_score 기준:

- 새로움
- 신기함
- 자극성
- 대중성
- 한국 독자 관련성
- 돈/일/자동화 연결성

content_score 기준:

- 제목 후킹 가능성
- 이미지화 가능성
- 카드뉴스 구성 가능성
- 릴스 구성 가능성
- 캡션 확장 가능성
- 저장 가치
- 공유 가치
- 댓글 유도 가능성

risk_score 기준:

- 허위정보 위험
- 출처 부족
- 투자/금융 조언 위험
- 정치/갈등 위험
- 저작권 위험
- 실존 인물 합성 위험
- 의료/법률 조언 위험
- 과장광고 위험

후보마다 아래 점수를 포함한다.

```json
{
  "hook_score": 0,
  "usefulness_score": 0,
  "visual_score": 0,
  "korea_relevance_score": 0,
  "carousel_fit_score": 0,
  "reels_fit_score": 0,
  "risk_score": 0,
  "final_score": 0,
  "publish_recommendation": "A | B | C | HOLD"
}
```
