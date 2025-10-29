Install 
```bash
pnpm install
pnpm approve-builds
```

Generate
```bash
# pnpx knex migrate:make create_aaa_bbb_table
pnpm clean
pnpm migrate
pnpm seed
```

Test & Develop
```bash
pnpm test
pnpm dev
```

Build & Serve
```bash
pnpm build
pnpm serve
```
