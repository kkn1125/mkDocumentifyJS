<div style="font-size: 2rem; font-weight: 700;">Update List</div>

*TOC*

- [Update](#update)
  - [Structural change](#structural-change)
  - [Change to select file parsing method](#change-to-select-file-parsing-method)

# Update

## Structural change

1. 전체 코드 수정
2. 도큐먼트화 객체 구조 수정
3. 도큐먼트 최상위 객체에 파일 객체 추가
4. 도큐먼트 하위 props 배열 단위 객체에 원문 파일의 line index 포함하여 객체 생성하는 것으로 변경 (기존에 없었음)

<span style="color: gray; font-size: .8rem">2021-10-06 15:01:39</span>

-----

## Change to select file parsing method

1. documentify를 init할 때 url을 입력하면 파일선택 없이 경로에 있는 파일을 파싱하여 문서화 출력
2. init에 인자 값 없이 index.html을 실행하면 파일 선택 input이 생성, 파일을 선택하면 파싱하여 문서화 출력
3. update list에 참여자 프로필 추가

<span style="color: gray; font-size: .8rem">2021-10-06 17:49:00</span>

-----