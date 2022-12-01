## Logs format

**Request**

`REQ | Timestamp | ?{Server ID} :: ID | Method | Path | IP`

**Success Response**

`SCS | Timestamp | ?{Server ID} :: ID | HTTP code | Code | Message | Response size | Response processing time`

**Error Response**

`ERR | Timestamp | ?{Server ID} :: ID | HTTP code | Code | Message | Response size | Response processing time`

**Template Response**

`TPL | Timestamp | ?{Server ID} :: ID | HTTP code | Template path | Response size | Response processing time`

**File Response**

`FIL | Timestamp | ?{Server ID} :: ID | HTTP code | File path | Response processing time`

**Redirect Response**

`RDR | Timestamp | ?{Server ID} :: ID | HTTP code | Redirect URL | Response processing time`
