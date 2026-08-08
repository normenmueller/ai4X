let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-delegation-accountability.dhall
        sha256:ff84ed37e78741cbb1724efe4ef5e4cd669cd44c77ff650ccba74af74491332d

in  view fixture
