let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-unresolved-reference.dhall
        sha256:b3c617c595272396bd52c20ea5bfeb6d900741bfd56b1f477900d93c500aa777

in  view fixture
