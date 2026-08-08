let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/positive.dhall
        sha256:559cd80f5b9154680e03efb80f797ff9d286d05a4006b463ebe0472133a23afc

in  view fixture
