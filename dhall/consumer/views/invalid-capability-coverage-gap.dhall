let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-capability-coverage-gap.dhall
        sha256:433c491d7b3099f34e29992328ec5ca87367df02322063db52a13d0ae3dd6e45

in  view fixture
