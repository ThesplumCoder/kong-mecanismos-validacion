# Kong Gateway: Mecanismos de validación
Archivos relacionados con la configuración de los diferentes mecanismos de validación de Kong Gateway

## Levantar servicios

### Red docker
Para la comunicación interna se crea la red `red-kong`.
```bash
sudo docker network create red-kong
```

### Contenedor NodeJS
Este contenedor sirve de API para probar cada uno de los mecanismos de validación. Utiliza el framework 
**express** para el servidor.

Para construir la imagen:
```bash
cd api/;
sudo docker build . -t thesplumcoder/nodejs-express
```

Para correr el contenedor:
```bash
sudo docker run -d --name api-local --network=red-kong -p 3000:3000 thesplumcoder/nodejs-express
```

### Contenedor Postgres
Este contenedor guardará las configuraciones de Kong.

Para correr el contenedor:
```bash
sudo docker run -d --name bd-kong \
--network=red-kong \
-e "POSTGRES_USER=kong" \
-e "POSTGRES_DB=kong" \
-e "POSTGRES_PASSWORD=kongpass" \
-p 5432:5432 \
-v $HOME/Documentos/postgresBD:/var/lib/postgresql/data \
postgres
```

Para las configuraciones de Postgres con Kong:
```bash
sudo docker run --rm --network=red-kong \
-e "KONG_DATABASE=postgres" \
-e "KONG_PG_HOST=bd-kong" \
-e "KONG_PG_PASSWORD=kongpass" \
kong/kong-gateway:3.3.0.0 kong migrations bootstrap
```

### Contenedor Kong Gateway
Este contenedor permitirá la conexión con Kong Gateway a sus diferentes puertos.

Para correr el contenedor:
```bash
sudo docker run -d --name kong-gateway \
--network=red-kong \
-e "KONG_DATABASE=postgres" \
-e "KONG_PG_HOST=bd-kong" \
-e "KONG_PG_USER=kong" \
-e "KONG_PG_PASSWORD=kongpass"\
-e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
-e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
-e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
-e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
-e "KONG_ADMIN_LISTEN_LOG=/dev/stderr" \
-e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \
-e "KONG_ADMIN_GUI_URL=http://localhost:8002" \
-e 8000:8000 \
-e 8443:8443 \
-e 8001:8001 \
-e 8444:8444 \
-e 8002:8002 \
-e 8445:8445 \
-e 8003:8003 \
-e 8004:8004 \
-p 8000:8000 \
-p 8001:8001 \
-p 8002:8002 \
-v $HOME/Documentos/kong:/etc/kong \
kong/kong-gateway:3.3.0.0
```

Para crear el servicio conectado a la API:
```bash
curl -i -s -X POST localhost:8001/services --data name=api_local --data url='http://api-local:3000'
```

Ruta para *Key Authentication*:
```bash
curl -i -X POST localhost:8001/services/api_local/routes \
--data 'paths[]=/key-auth' \
--data name=ruta_key_auth
```

## Mecanismos de validación

### Autenticación por llave (Key Authentication)
En este método necesitamos un consumidor con una constraseña:
+ Nombre: `usr_key_auth`
+ Contraseña: `pss_key_auth`

Creamos el consumidor:
```bash
curl -i -X POST localhost:8001/services/consumers/ --data username=usr_key_auth
```

Asignamos la constraseña:
```bash
curl -i -X POST localhost:8001/services/consumers/usr_key_auth --data key=pss_key_auth
```

Activamos el plugin en la ruta:
```bash
curl -X POST localhost:8001/routes/ruta_key_auth/plugins --data name=key-auth
```

Probamos la conexión:
```bash
curl -i localhost:8000/key-auth/saludo -H 'apikey:pss_key_auth'
```
