# Push Mailcow logs to Gotify server

I programmed this to get notified by gotify-service if any problems exists in the Mailcow infrastructure.
Im open for new Ideas or changes. So feel free to use, test and contacting me.


#### Minimal configuration in mailcow.conf
```env
REDIS_SLAVEOF_IP="172.10.55.5"  --These should alreade exists
REDIS_SLAVEOF_PORT=7654         --These should alreade exists
GFY_GOTIFY_ADDRESS="https://gotify.sample.com/message"
GFY_GOTYFY_HEALTH="https://gotify.sample.com/health"
GFY_GOTIFY_TOKEN="AGzVycCZ7iJsf8L"
```

Allowed environment variables in mailcow.conf<br>In the table used spacer \<service\> replace with following values.
* ACME
* AUTODISCOVER
* DOVECOT
* NETFILTER
* POSTFIX
* SOGO
* WATCHDOG
* RATELIMIT

## Needed environment variables
ENV | Default | Sample |  Description
--- | --- | --- | --- 
GFY_GOTIFY_ADDRESS | "" | "https://nfy.jpb-edv.de/message" | Full address where to send the gotify messages
GFY_GOTYFY_HEALTH | "" | "https://gotify.sample.gov/health" | Checks Health-Status of Gotify-Server. If any Problems exist, no Messages will be send.


## Needed environment variables
ENV | Default | Sample |  Description
--- | --- | --- | --- 
GFY_LOG_MODE | "" | "DEBUG" | Logs all Messages from System
GFY_GOTIFY_TOKEN | "" | "AGzVycCZ7iJsf8L" | Used as global Gotify message-token for all above listed Mailcow-Services, if no specific message-token is set for a service. (Used as fallback for ( **GFY_\<service\>_GOTIFY_TOKEN** )
GFY_\<service\>_GOTIFYTOKEN | "" | "AGzVycCZ7iJsf8L" | Overwrites the above Gotify token for the specific Mailcow-service. Use if you had created a APP for each Mailcow-Service in Gotify
GFY_\<service\>_ENABLED | 1 | 1 OR 0 | With value 0 the logs will not be parsed
GFY_\<service\>_GOTIFY_TITLE | "" | "Im the Gotify title" | You can use any value from log Model like {{message}} as placeholder. If you have a numeric field, please use {{_time}}. Optional you can use {{toDate(_time)}} to print a timestamp as Strting -> "01.01.2021 10:15:13".
GFY_\<service\>_GOTIFY_MESSAGE | "" | "{{toDate(_time)}}# {{message}}" | same as above just for the Gotify message.
GFY_\<service\>_REDIS_REDIS_KEY | different for each Mailcow-service | "ACME_LOG" | Defines the key for the redis-client to read the Logfiles
GFY_\<service\>_REDIS_SEARCH_FIELD | different for each Mailcow-service | "priority" | Use any key from the log model as trigger, if the Regexp in ENV **GFY_\<service\>_REDIS_SEARCH_REGEXP** matches.
GFY_\<service\>_REDIS_SEARCH_REGEXP | different for each Mailcow-service | "(EMERG\|ALERT\|CRIT\|ERR)" | The regexp is case insensitive and multi-line. another sample would be "\b(0*(?:[1-9][0-9]?\|0))\b" => matches if the searchfield is between 0 and 99.
