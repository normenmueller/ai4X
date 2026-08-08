let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-capability-conflict.dhall
        sha256:1c5c8627a7e77b4c5036fdcbf23f67ca0ceaac104b4c6cae70ab891e9830ed9a

in  view fixture
