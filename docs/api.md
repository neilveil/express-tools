## Core API

```
ET_CORE_KEY = core
```

---

GET :: `/core/status`

To get Application status

---

GET :: `/core/mirror`

To view request received by server

---

POST :: `/core/auth`*

To test if authenticatin token is valid or not.

---

POST :: `/core/stop`*

To temporarily stop server. To start the server again, start API need to be called. Server starts again if server is restarted.

---

POST :: `/core/start`*

To start server

---

POST :: `/core/stats`*

To get server statistics

---

> *Authentication required
