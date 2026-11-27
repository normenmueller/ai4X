let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-illegal-transition.dhall
        sha256:dd7eb4e9e5011df73a344d672fd3429ceaf70464281cbaf1dac5b3cca7ace7e7

in  view fixture
