<div style="font-size: 2rem; font-weight: 700;">Update List</div>

***TOC***

- [Update List](#update-list)
  - [v0.2.3 업데이트](#v023-업데이트)
    - [수정 사항](#수정-사항)
    - [추가 사항](#추가-사항)
  - [v0.2.2 업데이트](#v022-업데이트)
    - [버그 수정](#버그-수정)
    - [수정 사항](#수정-사항-1)
    - [추가 사항](#추가-사항-1)
  - [v0.2.1 업데이트](#v021-업데이트)
    - [버그 수정](#버그-수정-1)
    - [수정 사항](#수정-사항-2)
  - [v0.2.0 pre-release 수정 사항](#v020-pre-release-수정-사항)
    - [초기화 옵션 방식 수정](#초기화-옵션-방식-수정)
    - [메신저 창 추가](#메신저-창-추가)
    - [변경사항](#변경사항)
  - [부분 업데이트](#부분-업데이트)
    - [네비게이션](#네비게이션)
    - [UI부분](#ui부분)
    - [추가되는 기능](#추가되는-기능)
  - [Merge oho-fetch-5 and latest result](#merge-oho-fetch-5-and-latest-result)
  - [Update and Fixed Bugs](#update-and-fixed-bugs)
    - [수정사항](#수정사항)
    - [추가사항](#추가사항)
    - [예정사항](#예정사항)
  - [List of updates and some fixed bugs](#list-of-updates-and-some-fixed-bugs)
  - [Update documentify functions and added regexParser](#update-documentify-functions-and-added-regexparser)
  - [Fixed Bugs, Update Documentify](#fixed-bugs-update-documentify)
  - [Update Documentify](#update-documentify)
  - [Change to select file parsing method](#change-to-select-file-parsing-method)
  - [Structural change](#structural-change)

# Update List

## v0.2.3 업데이트

### 수정 사항

1. GNB 파일 네임 uppercase로 변경

### 추가 사항

1. 단일 | 분할 페이지 저장 기능 추가

***kimson, ohoraming | 2021-10-29 15:29:25***

-----

## v0.2.2 업데이트

### 버그 수정

1. `param` 태그 `desc`가 잘려서 나오는 버그 수정
2. `return` 잘려서 나오는 버그 수정

### 수정 사항

1. `param`, `return` 주석 파싱 구조 변경
2. 사이드바 ui 변경

### 추가 사항

1. `@see` 태그 참조 메서드로 이동
> **사용법**   
> @see ParentMethod.childMethod,method,method // 단일 메서드는 이름만 쓰고, 메서드 안의 메서드는 "."으로 연결하며, 단일 메서드는 이름만 표기

***kimson, ohoraming | 2021-10-29 15:29:25***

-----

## v0.2.1 업데이트

### 버그 수정

1. `showOrigin` 초기화 옵션 추가

### 수정 사항

1. `Documentify` 문서화 주석 작업 완료
2. `d-for` 태그 `extend` 속성추가 커스텀 표현식 `{@...@}`을 사용해서 다른 객체를 상속시킴
3. `@see`태그 임시로 참조 메서드로 이동하게 작동 구현
   - 기능 수정해야하며 `docuPack` 객체 구성을 변경 가능성 있음

***kimson | 2021-10-28 22:23:45***

-----

## v0.2.0 pre-release 수정 사항

### 초기화 옵션 방식 수정

1. `init({ ... })`메서드로 초기화할 때 커스터마이징 가능한 명령어 추가
   1. selectFileMode : true(default) | false
   2. url: "dist/assets/js/example.js"(default)
   3. datapath: "dist/data/userData.json"(default)
   4. basepath: "dist/include/"(default)
   5. darkMode: true | false(default)

### 메신저 창 추가

1. 메신저 창
   1. 명령어
      1. save as | 저장 | 파일저장
      2. send mail | 메일전송 | 메일
      3. darkMode(토글) | on | off | 켜기 | 끄기
      4. 도와줘 | ? | 명령어

### 변경사항

1. mkHead 메서드 수정
   1. html파일로 분리해서 불러오는 형식으로 변경
2. mkNav 메서드 삭제
   1. mkBody 메서드에 포함되어 불러오기 때문

***kimson, ohoraming | 2021-10-23 11:28:41***

-----

## 부분 업데이트

### 네비게이션

1. snb 결정
   1. 모바일 >> 버튼메뉴 안에 함수, 검색창
   2. 웹 >> 사이드바
2. 기존 gnb 삭제

### UI부분

1. information 디자인 따로 ( 함수와 분리 )

### 추가되는 기능

1. 메신저 창 구현
   1. recent updates 포함
   2. save file, send mail 포함
   3. darkmode 포함
2. originLines userOption으로 선택 조정

***kimson, ohoraming | 2021-10-22 14:36:03***

-----

## Merge oho-fetch-5 and latest result

1. gnb, snb 병합 레이아웃 및 css 손볼 것 의논
2. 이전 코드 구조보다 확실히 파일이 분리되어 수정이 편함
3. 의논해서 나온 제안이나 문제점, 버그는 서로 추가하기로

***kimson, ohoraming | 2021-10-21 22:13:35***

-----

## Update and Fixed Bugs

### 수정사항

1. 전역변수로 지정되어 있던 docuPack, page, initOption 세 가지를 지역변수로 보호 수정
2. 외부 코드 병합
   1. regexParser 코드 통합 및 정리
   2. Zip클래스 코드 통합 및 정리
3. mkScript메서드 script태그 생성하는 방식 변경 >> scriptBundle.html을 따로 만들어 사용자가 필요한 스크립트를 보다 편하게 수정하고 반영될 수 있도록 하기 위함
4. convertFileToElements메서드가 단일 요소(body)만 리턴하여 활용성이 떨어져 메서드 분기
   1. convertFileToHeadElements >> head반환
   2. convertFileToBodyElements >> body반환
   3. convertFileToBodyElements(예정) >> document반환
5. css 및 js파일 경로 변경 dist/assets/js|css
6. documentify 결과 페이지 구조 변경

### 추가사항

1. <d-if test="">...</d-if>, <d-for var="" target="">...</d-for> 컴포넌트 추가, 태그로 if, for문을 html에서도 사용가능

### 예정사항

1. mkDocumentifyJS v0.1.0 Pre-release 예정 ( 2021. 10. 25 :: 4일 후)

***kimson, ohoraming | 2021-10-21 19:51:20***

-----

## List of updates and some fixed bugs

1. regexReader.js를 regexParser.js로 변경
2. regexParser기능에서 정규식 변경 한 줄에 겹치는 커스텀 표현식을 인식하지 못하는 버그 수정
3. userData.json 파일 추가
   - 문서화할 때 작성자 및 문서화 대상 파일의 기본적인 정보를 입력 및 사용할 수 있도록 함

4. updates 영역 드롭다운 변경
5. footer영역 direct top/down버튼 버그 수정

***kimson, ohoraming | 2021-10-15 16:46:52***

-----

## Update documentify functions and added regexParser

1. 143 line 코드 삭제
   - 기존에 리터럴 방식으로 파싱하던 메서드를 regexParser 함수로 {@ ... @} 형식의 표현식을 파싱하여 html에서 필요한 객체정보 사용 가능
   - mkDocumentifyJS의 mkContent메서드 삭제
   - mkDocumentifyJS의 mkOriginLines메서드 삭제

***kimson, ohoraming | 2021-10-15 12:42:35***

-----

## Fixed Bugs, Update Documentify

1. parameter 이름 알기쉽게 변경
2. 라이선스 추가
3. 가공된 주석 객체에 각 태그별 라인 추가
4. 띄어쓰기만 있을 때 description등 나머지 내용 안 뜨는 안되는 버그 수정
5. 컨텐츠 만드는 메서드 구조분해할당으로 코드 정리

***kimson | 2021-10-08 16:57:37***

-----

## Update Documentify

1. footer 추가
2. sub nav bar 수정 -> 원본보기 버튼, 앵커 버튼
3. gnb 수정 -> 추후 페이지 분리하기 위함
4. regdate 표시 -> gnb + footer
5. zip으로 내보내기 기능 구현
6. 해당 내용 원문 해당 라인으로 이동 구현
7. ReadMe.md에 업데이트 리스트 링크 추가

***kimson | 2021-10-07 14:51:02***

-----

## Change to select file parsing method

1. documentify를 init할 때 url을 입력하면 파일선택 없이 경로에 있는 파일을 파싱하여 문서화 출력
2. init에 인자 값 없이 index.html을 실행하면 파일 선택 input이 생성, 파일을 선택하면 파싱하여 문서화 출력
3. update list에 참여자 프로필 추가

***kimson | 2021-10-06 17:49:00***

-----

## Structural change

1. 전체 코드 수정
2. 도큐먼트화 객체 구조 수정
3. 도큐먼트 최상위 객체에 파일 객체 추가
4. 도큐먼트 하위 props 배열 단위 객체에 원문 파일의 line index 포함하여 객체 생성하는 것으로 변경 (기존에 없었음)

***kimson | 2021-10-06 15:01:39***

-----