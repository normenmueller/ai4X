# Work-continuity Target Binding

The ai4X project instance currently requires one logical
`SyncedDirectoryTarget` for inert recovery material. The concrete provider and
absolute target path are machine-local facts and must not be committed.

Record the active machine's target root as the only line in:

```text
.ai4x/local/work-continuity/target
```

The target must provide this bounded layout:

```text
work-continuity/
├─ README.md
├─ CURRENT
├─ baseline/
└─ rolling/
   ├─ slot-a/
   ├─ slot-b/
   └─ slot-c/
```

`CURRENT` contains one relative rolling-slot name such as `rolling/slot-a`.
The target remains outside the active repository and must never be used as a
working directory, tracked authority, or destination for build output.
