let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-empty-join-all.dhall
        sha256:3aee7c281e92f8964b4235056d8539364dd84047aed27de008e85965764e95bb

in  view fixture
