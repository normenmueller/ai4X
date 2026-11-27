let view =
      ../view.dhall
        sha256:47c93066bf6c3269f89951a5ef4332ef5df36a70f85b31fefe94c0f73f46138e

let fixture =
      ../../cases/invalid-incomplete-join-all.dhall
        sha256:486f8cb494a9039aca74d27fdc47459f12e9b02bf426ba1f376b6fddcf3d8729

in  view fixture
