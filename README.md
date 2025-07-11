# PedZap Desktop

## Autenticação
Agora o sistema utiliza **exclusivamente Supabase Auth** para login, cadastro e login social (Google/Facebook). Não há mais autenticação própria no backend.

## Limpeza Realizada
- Removidas rotas, middlewares e arquivos de autenticação local/social do backend.
- Removidas colunas `senha_hash`, `google_id`, `facebook_id` da tabela `usuarios`.
- Removidas dependências `bcryptjs` e `jsonwebtoken` do backend.
- Conferido que não há mais referências a autenticação própria no frontend.

## Observações
- Se necessário, rode um comando de migração para remover as colunas do banco de dados real:

```sql
ALTER TABLE usuarios DROP COLUMN senha_hash;
ALTER TABLE usuarios DROP COLUMN google_id;
ALTER TABLE usuarios DROP COLUMN facebook_id;
```

- Atualize o banco de dados conforme o novo schema.
- Atualize variáveis de ambiente e documentação conforme necessário.

---

Para dúvidas ou manutenção, consulte este README.
#   p e d z a p  
 