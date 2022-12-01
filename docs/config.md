# Express tools environment variables

`ET_LOGS` (yes | no) Default: no

Print request and response logs.

---

`ET_DEBUG` (yes | no) Default: no

Print full error stack on error response.

---

`ET_AUTH_TOKEN`

Token to access core API. Assume if your token is `ET_AUTH_TOKEN = 098f6bcd4621d373cade4e832627b4f6`, then you need to pass `098f6bcd4621d373cade4e832627b4f6` in `Authorization` header.

---

`ET_AUTH_URL`

To authenticate server from other server. Authorization header is forwared to this url and it should return 200 for successful authentication.

---

`ET_CORE_KEY`

Key at which you want to host core APIs. If `ET_CORE_KEY = core` then your status API url will be `{host}/core/status`

---

`ET_PERSISTENT_ID` (yes | no) Default: no

Each response returned from the server has an unique integral ID. But it's stored in the memory, so when the server restarts it again starts from 1. So to persist it's value, it need to be stored on the server which creates a `.et` file at root of the project.

---

`ET_SID`

All response ID will always be unique if `ET_PERSISTENT_ID` is `yes`, but if you are running multiple containers of your application then the request ID will again clash as all the servers will start the ID from 0. So to bind each response with an unique ID, a server ID need to attached with each response. And now using this information, server from which the response was served and the response can be uniquely tracked.

For e.g. while running multiple containers of your application with docker, container ID can be used as server ID which you find as `HOSTNAME` environment variable in your application. So to set server ID, you just need to do `process.env.ET_SID = process.env.HOSTNAME` at the top of your main enrty file of your application.

---

`ET_ENC_KEY`
`ET_ENC_IV`

Set these to use `_encrypt` & `_decrypt` helpers.

---

`ET_DELAY`

To add a custom delay in all request served from the server in milliseconds. Very helpful in development mode to test the impact of slow API response on the application.
