# 결품 대시보드 빌드 도구

## 마스터 갱신 (생활재마스터.xlsx 갱신 시)
1. dump_master.ps1 실행 (AI 폴더\생활재마스터.xlsx → master_dump.tsv)
2. node build_master.js (→ master-data.js)
3. node build_tool.js (→ 대시보드 HTML 생성, AI 폴더\claude\결품보고_대시보드.html)
4. 결품보고_대시보드.html을 ../index.html로 복사 후 git push

※ 스크립트 내 경로가 스크래치패드 기준이면 이 폴더 기준으로 수정 필요
