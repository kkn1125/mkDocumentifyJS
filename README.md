![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/kkn1125/mkDocumentifyJS?color=violet&include_prereleases&label=pre-release&style=for-the-badge)

# mkDocumentifyJS

- [mkDocumentifyJS](#mkdocumentifyjs)
  - [목적](#목적)
  - [만든이](#만든이)
  - [알림](#알림)
  - [버전](#버전)
  - [사용법](#사용법)
    - [필수 준비사항](#필수-준비사항)
    - [초기화 옵션](#초기화-옵션)
    - [문서화 정보 입력 예제](#문서화-정보-입력-예제)
    - [{@ ... @} 표현식과 d-*태그](#---표현식과-d-태그)
  - [문서화 페이지 저장](#문서화-페이지-저장)
  - [기여](#기여)

## 목적

사용자가 만든 `JavaScript API`를 `JavaScript`로 파일을 파싱하고 문서로 페이지를 쉽게 생성하는 것을 도와주기 위함

## 만든이

@kkn1125 , @ohoraming 

## 알림

js 주석을 구문 분석하고 문서화합니다. 현재는 기능만 구현하고 디자인 패턴을 연구하고 있어 깔끔한 코드는 아닙니다.

`mkDocumentifyJS`는 문서화 된 내용을 보면서 사용자가 쉽게 커스터마이징 가능하도록 하기 때문에 최종 결과물을 검토하고, 문서화 된 내용을 파일로 저장할 수 있도록 하는 것이 목표입니다.

부가 기능은 `kimson`과 `ohoraming`의 재량으로 만들어졌으며, `bootstrap`과 `fontawesome`이 사용되었음을 미리 알려드리며, 다른 사람이 구현한 기능을 사용할 때는 현재 `README.md`의 하단과 사용된 파일 상단에 `개발자의 명칭`과 `url`을 주석으로 남깁니다.

`라이선스`는 `MIT라이선스`입니다.

어떠한 의견도 환영입니다.

## 버전

v0.2.4

## 사용법

문서화 대상 `javascript`파일을 지정합니다. 그리고 실행하면 문서화된 페이지를 미리 볼 수 있습니다.

이때 `Documentify`메서드를 초기화 할 때 초기화 옵션에서 문서화 페이지에 대한 정보를 입력하여 `커스터마이징`이 가능합니다.

```html
<!-- preview.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documentify</title>
    </head>

    <body>
        <script src="documentify.js"></script>
        <script src="index.js"></script>
    </body>
  </body>
</html>
```

`documentify.js`를 먼저 연결하고 나서 `Documentify.init();`로 초기화 해주셔야합니다.

물론 `CDN`도 있습니다. 하지만 `userData.json`과 `include`파일이 존재하기 때문에 `CDN`을 사용하기보다 해당 저장소를 `fork` 또는 다운로드 받아 커스터마이징 하는 것을 추천합니다.

```html
<script src="https://cdn.jsdelivr.net/gh/kkn1125/mkDocumentifyJS@v0.1.0/dist/assets/js/documentify.js" integrity="sha384-LomLOKjZc2Q63LCfYatoRmM2tEEupYa2HKIkKM1bsczTvn5ShodXpObhtlbImOkt" crossorigin="anonymous"></script>
```

### 필수 준비사항

> dist폴더에 모두 있습니다.

- `documentify.js` 연결
- `init` 메서드 호출
- `data` 폴더 내의 `userData.json`
- `include` 폴더 내의 템플릿 파일들

### 초기화 옵션

`index.js`에서 `Documentify.init()`을 호출 할 때 정해진 초기화 옵션은 아래와 같습니다.

```javascript
// index.js

// 기본옵션으로 문서화를 진행합니다.
const documentify = Documentify.init();

// 파일 선택을 조정합니다.
const documentify = Documentify.init({
    selectFileMode: false,
    // or
    url: 'dist/assets/js/example.js',
});

// 커스터마이징하여 문서화를 진행합니다.
const documentify = Documentify.init({
    selectFileMode: false,
    url: 'dist/assets/js/example.js',
    datapath: 'dist/data/userData.json',
    basepath: 'dist/include/',
});
```

|구분|옵션명|기능|기본값|단위|
|---|---|---|---|---|
|1|selectFileMode|문서화 대상 파일을 로컬에서 찾아 선택합니다.|`false`|boolean|
|2|url|`selectFileMode`가 `false`일 때 직접 경로를 입력하여 선택합니다. (Customizing 작업 시 추천합니다.)|`dist/assets/js/example.js`|string|
|3|datapath|문서화에 구현될 정보를 담는 `userData.json`파일의 경로를 설정합니다.|`dist/data/userData.json`|string|
|4|basepath|문서화에 필요한 html template파일이 존재하는 폴더 경로를 설정합니다.|`dist/include/`|string|

### 문서화 정보 입력 예제

```json
{
    "page": {
        "url": "https://kkn1125.github.io",
        "baseurl": "/",
        "name": "DocumentifyJS",
        "descriptions": "문서화 웹 애플리케이션입니다. 현재 2인 개발중이며, JSDOC과는 감히 비교조차 안되지만, 문서를 만들고, 사용자로 하여금 보는데 편리한 기능을 넣고자 합니다. 개인적으로 다른 문서들을 보는데 불편했던 점과 비전공자로서 처음 문서를 접했을 때 무엇을 봐야하는지 몰랐던 것을 떠올려 원하는 것을 물어보고 찾아주는 \"안내자\"를 도입할 예정이며, node.js가 아닌 javascript로만 구현하여 간편하게 제공하고 있습니다.",
        "authors": {
            "list": [
                "kimson",
                "ohoraming"
            ],
            "kimson": {
                "name": "kyungnam",
                "desc": "현재 백앤드 개발자를 준비하고 있는 예비 개발자입니다. 문의사항이나 버그발생은 '문의'라고 입력하셔서 내용을 남겨주시기 바랍니다.",
                "github": "https://github.com/kkn1125/",
                "blog": "https://kkn1125.github.io/"
            },
            "ohoraming": {
                "name": "minji",
                "desc": "",
                "github": "https://github.com/ohoraming/",
                "blog": "https://ohoraming.github.io/"
            }
        }
    }
}
```

문서화 정보 입력은 정해진 구조가 없기 때문에 자유롭게 변경하여 사용가능하며, `Documentify`에서 지원하는 표현식인 `{@ ... @}`를 사용하여 `page`정보를 `html`에서 사용할 수 있으며, `d-if`, `d-for`태그를 사용하여 `html`에서 if문과 for문을 태그로 구현할 수 있습니다.

### {@ ... @} 표현식과 d-*태그

```html
<!-- d-*태그 사용 예제 입니다. -->

<d-for var="author" target="page.authors.list">
    <d-if test="${author == 'ohoraming'}">
        <span>나는 ${author}입니다</span>
    </d-if>
</d-for>

<d-for var="i" target="5">
    ${i} 단순히 다섯 번 반복됩니다. var의 i는 0부터 4인 인덱스번호를 사용할 수 있습니다.
</d-for>

<d-for var="test" target="[1,2,3,4,5,'test']">
    ${test} d-for문 내부는 ${...}을 사용해야하며 속성값 외 {@...@}를 사용할 수 있습니다.
</d-for>

<div>
    {@ page.* @} page는 userData.json의 최상위 객체명입니다. json에서 page라는 이름 외 모든 내용을 수정하여 사용할 수 있습니다. <d-if test="3<2">출력되지 않습니다.</d-if>
</div>

{@! page.desc @} "@"뒤에 "!"를 붙이면 주석처리되어 페이지에 표시되지 않습니다.
```

## 문서화 페이지 저장

채팅팝업을 통해 저장할 수 있으며, 현재는 단일 페이지로 구성되어 있으며 다음 업데이트에 분할 페이지 저장기능을 추가 할 예정입니다.

저장 후 커스터마이징 가능하도록 assets, html이 따로 분리되어 알집으로 저장됩니다.

## 기여

관심을 가져주는 것 만으로도 감사할 따름입니다. 현재 두 명 개발 진행 중이며 버그나 에러, 미흡한 부분, 제안 등 모든 의견 주시면 검토하고 반영하도록 하겠습니다.

-----

[devkimson Blog](https://kkn1125.github.io/ "Blog")  
[devkimson Blog](https://github.com/ohoraming "Github")  
[Sample page](https://kkn1125.github.io/mkDocumentifyJS/ "Documentify Sample Page")  
[Update List](https://github.com/kkn1125/mkDocumentifyJS/blob/main/UPDATE.md)
