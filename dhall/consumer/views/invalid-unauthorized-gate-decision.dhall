let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-unauthorized-gate-decision.dhall
        sha256:e9970648e82800284d326b783f40e03f49d364e790c2440875d445f60d1fa93a

in  view fixture
