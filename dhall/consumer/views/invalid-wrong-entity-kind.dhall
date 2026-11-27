let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-wrong-entity-kind.dhall
        sha256:bfadc3778d1327dd56b33eb3587447d69bdf66ff7762da9d622e6dab8d06a027

in  view fixture
