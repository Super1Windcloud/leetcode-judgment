default:
    echo 'Hello, world!'


push:
  git add . && git commit -m 'Update' && git push repo main 


dev-backend:
    cd judgment &&   chmod +x dev.sh && ./dev.sh

prod-backend:
    cd judgment &&  docker compose up -d



start:
    just prod-backend  &&  pnpm start