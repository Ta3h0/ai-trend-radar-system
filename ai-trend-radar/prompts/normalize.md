# Normalize Prompt

수집한 원자료를 아래 규칙으로 정규화한다.

- 출처 URL을 반드시 보존한다.
- 출처명, 출처 유형, 출처 등급, 발행일, 수집일을 분리한다.
- 제목과 저자를 원문 그대로 보존한다.
- 출처 기반 사실과 해석을 섞지 않는다.
- 이미지, 영상, 미디어 URL은 각각 배열로 분리한다.
- 좋아요, 댓글, 조회수, 스타 수 같은 지표는 확인 가능한 값만 넣고 모르면 `null`로 둔다.
- 검증되지 않은 숫자를 만들지 않는다.

출력 구조:

```json
{
  "id": "YYYY-MM-DD-source-slug",
  "source_name": "",
  "source_type": "",
  "source_tier": "",
  "source_url": "",
  "published_at": "",
  "collected_at": "",
  "original_title": "",
  "original_author": "",
  "raw_summary": "",
  "raw_content_excerpt": "",
  "language": "",
  "media_urls": [],
  "video_urls": [],
  "image_urls": [],
  "tags": [],
  "metrics": {
    "comments": null,
    "likes": null,
    "upvotes": null,
    "views": null,
    "stars": null
  }
}
```
