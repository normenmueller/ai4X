let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-wrong-version.dhall
        sha256:ee55f4d28da30909ab114536daae14412de20d99a92a2a25d761a2f2a78ca404

in  view fixture
