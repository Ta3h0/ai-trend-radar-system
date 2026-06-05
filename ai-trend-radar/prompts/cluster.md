# Cluster Prompt

여러 출처에서 같은 이슈가 반복되면 하나의 클러스터로 묶는다.

클러스터링 기준:

- 같은 제품, 모델, 논문, 기능, 데모, 사건인지 확인한다.
- 공식 출처가 있으면 primary source로 둔다.
- Hacker News, Reddit, YouTube, GitHub, Product Hunt 반응은 supporting source로 둔다.
- 같은 이슈를 릴스와 카드뉴스로 나눠 재활용할 수 있는지 확인한다.

출력 구조:

```json
{
  "cluster_id": "",
  "cluster_title": "",
  "primary_source": "",
  "supporting_sources": [],
  "summary": "",
  "key_facts": [],
  "community_reaction": "",
  "content_angles": [],
  "cluster_score": 0
}
```
