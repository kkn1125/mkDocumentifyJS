<div style="font-size: 2rem; font-weight: 700;">Update List</div>

*TOC*

- [Update](#update)
  - [Structural change](#structural-change)
  - [Change to select file parsing method](#change-to-select-file-parsing-method)
  - [Update Documentify](#update-documentify)
  - [Fixed Bugs, Update Documentify](#fixed-bugs-update-documentify)
  - [Update](#update-1)

# Update

## Structural change

1. 전체 코드 수정
2. 도큐먼트화 객체 구조 수정
3. 도큐먼트 최상위 객체에 파일 객체 추가
4. 도큐먼트 하위 props 배열 단위 객체에 원문 파일의 line index 포함하여 객체 생성하는 것으로 변경 (기존에 없었음)

<span style="color: gray; font-size: .8rem">kimson | 2021-10-06 15:01:39</span>

-----

## Change to select file parsing method

1. documentify를 init할 때 url을 입력하면 파일선택 없이 경로에 있는 파일을 파싱하여 문서화 출력
2. init에 인자 값 없이 index.html을 실행하면 파일 선택 input이 생성, 파일을 선택하면 파싱하여 문서화 출력
3. update list에 참여자 프로필 추가

<span style="color: gray; font-size: .8rem">kimson | 2021-10-06 17:49:00</span>

-----

## Update Documentify

1. footer 추가
2. sub nav bar 수정 -> 원본보기 버튼, 앵커 버튼
3. gnb 수정 -> 추후 페이지 분리하기 위함
4. regdate 표시 -> gnb + footer
5. zip으로 내보내기 기능 구현
6. 해당 내용 원문 해당 라인으로 이동 구현
7. ReadMe.md에 업데이트 리스트 링크 추가

<span style="color: gray; font-size: .8rem">kimson | 2021-10-07 14:51:02</span>

-----

## Fixed Bugs, Update Documentify

1. parameter 이름 알기쉽게 변경
2. 라이선스 추가
3. 가공된 주석 객체에 각 태그별 라인 추가
4. 띄어쓰기만 있을 때 description등 나머지 내용 안 뜨는 안되는 버그 수정
5. 컨텐츠 만드는 메서드 구조분해할당으로 코드 정리

<span style="color: gray; font-size: .8rem">kimson | 2021-10-08 16:57:37</span>

-----

## Update

1. 143 line 코드 삭제
   - 기존에 리터럴 방식으로 파싱하던 메서드를 regexParser 함수로 {@ ... @} 형식의 표현식을 파싱하여 html에서 필요한 객체정보 사용 가능
   - mkDocumentifyJS의 mkContent메서드 삭제
   - mkDocumentifyJS의 mkOriginLines메서드 삭제

<span style="color: gray; font-size: .8rem;">kimson, ohoraming | 2021-10-14 21:36:55</span>

-----
