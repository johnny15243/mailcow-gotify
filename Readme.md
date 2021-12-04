# Push Mailcow logs to Gotify server

I programmed this to get notified by gotify-service if any problems exists in the Mailcow infrastructure.
Im open for new Ideas or changes. So feel free to use, test and contacting me.


#### Minimal configuration in mailcow.conf
```env
REDIS_SLAVEOF_IP="172.10.55.5"  -- should already exists
REDIS_SLAVEOF_PORT=7654         -- should already exists
GFY_GOTIFY_ADDRESS="https://gotify.sample.com/message"
GFY_GOTYFY_HEALTH="https://gotify.sample.com/health"
GFY_GOTIFY_TOKEN="AGzVycCZ7iJsf8L"
```

Allowed environment variables in mailcow.conf<br>In the table used spacer \<service\> replace with following values.
* ~~API~~ if it is a wish, it could be added quickly
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
GFY_GOTIFY_ADDRESS | "" | "https://gotify.sample.gov/message" | Full address where to send the gotify messages
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

---

# Docker-compose changes in mailcow

If you want to add a Container to the Mailcow-Compose file, you have to add the following to the docker-compose.yml file.
After that, you can add the needed ENVs to mailcow.conf

## NOT TESTED YET

```yaml

    redis-mailcow:
      image: johnny15243/mailcow-gotify:latest
      restart: always
      environment:
        - REDIS_SLAVEOF_IP=${REDIS_SLAVEOF_IP:-}
        - REDIS_SLAVEOF_PORT=${REDIS_SLAVEOF_PORT:-}
        - GFY_GOTIFY_ADDRESS=${GFY_GOTIFY_ADDRESS:-}
        - GFY_GOTYFY_HEALTH=${GFY_GOTYFY_HEALTH:-}
        - GFY_GOTIFY_TOKEN=${GFY_GOTIFY_TOKEN:-}
        - GFY_LOG_MODE=${GFY_LOG_MODE:-}
        - GFY_ACME_ENABLED=${GFY_ACME_ENABLED:-}
        - GFY_ACME_GOTIFY_TITLE=${GFY_ACME_GOTIFY_TITLE:-}
        - GFY_ACME_GOTIFY_MESSAGE=${GFY_ACME_GOTIFY_MESSAGE:-}
        - GFY_ACME_REDIS_REDIS_KEY=${GFY_ACME_REDIS_REDIS_KEY:-}
        - GFY_ACME_REDIS_SEARCH_FIELD=${GFY_ACME_REDIS_SEARCH_FIELD:-}
        - GFY_ACME_REDIS_SEARCH_REGEXP=${GFY_ACME_REDIS_SEARCH_REGEXP:-}
        - GFY_DOVECOT_ENABLED=${GFY_DOVECOT_ENABLED:-}
        - GFY_DOVECOT_GOTIFY_TOKEN=${GFY_DOVECOT_GOTIFY_TOKEN:-}
        - GFY_DOVECOT_GOTIFY_TITLE=${GFY_DOVECOT_GOTIFY_TITLE:-}
        - GFY_DOVECOT_GOTIFY_MESSAGE=${GFY_DOVECOT_GOTIFY_MESSAGE:-}
        - GFY_DOVECOT_REDIS_REDIS_KEY=${GFY_DOVECOT_REDIS_REDIS_KEY:-}
        - GFY_DOVECOT_REDIS_SEARCH_FIELD=${GFY_DOVECOT_REDIS_SEARCH_FIELD:-}
        - GFY_DOVECOT_REDIS_SEARCH_REGEXP=${GFY_DOVECOT_REDIS_SEARCH_REGEXP:-}
        - GFY_SOGO_ENABLED=${GFY_SOGO_ENABLED:-}
        - GFY_SOGO_GOTIFY_TOKEN=${GFY_SOGO_GOTIFY_TOKEN:-}
        - GFY_SOGO_GOTIFY_TITLE=${GFY_SOGO_GOTIFY_TITLE:-}
        - GFY_SOGO_GOTIFY_MESSAGE=${GFY_SOGO_GOTIFY_MESSAGE:-}
        - GFY_SOGO_REDIS_REDIS_KEY=${GFY_SOGO_REDIS_REDIS_KEY:-}
        - GFY_SOGO_REDIS_SEARCH_FIELD=${GFY_SOGO_REDIS_SEARCH_FIELD:-}
        - GFY_SOGO_REDIS_SEARCH_REGEXP=${GFY_SOGO_REDIS_SEARCH_REGEXP:-}
        - GFY_WATCHDOG_ENABLED=${GFY_WATCHDOG_ENABLED:-}
        - GFY_WATCHDOG_GOTIFY_TOKEN=${GFY_WATCHDOG_GOTIFY_TOKEN:-}
        - GFY_WATCHDOG_GOTIFY_TITLE=${GFY_WATCHDOG_GOTIFY_TITLE:-}
        - GFY_WATCHDOG_GOTIFY_MESSAGE=${GFY_WATCHDOG_GOTIFY_MESSAGE:-}
        - GFY_WATCHDOG_REDIS_REDIS_KEY=${GFY_WATCHDOG_REDIS_REDIS_KEY:-}
        - GFY_WATCHDOG_REDIS_SEARCH_FIELD=${GFY_WATCHDOG_REDIS_SEARCH_FIELD:-}
        - GFY_WATCHDOG_REDIS_SEARCH_REGEXP=${GFY_WATCHDOG_REDIS_SEARCH_REGEXP:-}
        - GFY_POSTFIX_ENABLED=${GFY_POSTFIX_ENABLED:-}
        - GFY_POSTFIX_GOTIFY_TOKEN=${GFY_POSTFIX_GOTIFY_TOKEN:-}
        - GFY_POSTFIX_GOTIFY_TITLE=${GFY_POSTFIX_GOTIFY_TITLE:-}
        - GFY_POSTFIX_GOTIFY_MESSAGE=${GFY_POSTFIX_GOTIFY_MESSAGE:-}
        - GFY_POSTFIX_REDIS_REDIS_KEY=${GFY_POSTFIX_REDIS_REDIS_KEY:-}
        - GFY_POSTFIX_REDIS_SEARCH_FIELD=${GFY_POSTFIX_REDIS_SEARCH_FIELD:-}
        - GFY_POSTFIX_REDIS_SEARCH_REGEXP=${GFY_POSTFIX_REDIS_SEARCH_REGEXP:-}
        - GFY_AUTODISCOVER_ENABLED=${GFY_AUTODISCOVER_ENABLED:-}
        - GFY_AUTODISCOVER_GOTIFY_TOKEN=${GFY_AUTODISCOVER_GOTIFY_TOKEN:-}
        - GFY_AUTODISCOVER_GOTIFY_TITLE=${GFY_AUTODISCOVER_GOTIFY_TITLE:-}
        - GFY_AUTODISCOVER_GOTIFY_MESSAGE=${GFY_AUTODISCOVER_GOTIFY_MESSAGE:-}
        - GFY_AUTODISCOVER_REDIS_REDIS_KEY=${GFY_AUTODISCOVER_REDIS_REDIS_KEY:-}
        - GFY_AUTODISCOVER_REDIS_SEARCH_FIELD=${GFY_AUTODISCOVER_REDIS_SEARCH_FIELD:-}
        - GFY_AUTODISCOVER_REDIS_SEARCH_REGEXP=${GFY_AUTODISCOVER_REDIS_SEARCH_REGEXP:-}
        - GFY_NETFILTER_ENABLED=${GFY_NETFILTER_ENABLED:-}
        - GFY_NETFILTER_GOTIFY_TOKEN=${GFY_NETFILTER_GOTIFY_TOKEN:-}
        - GFY_NETFILTER_GOTIFY_TITLE=${GFY_NETFILTER_GOTIFY_TITLE:-}
        - GFY_NETFILTER_GOTIFY_MESSAGE=${GFY_NETFILTER_GOTIFY_MESSAGE:-}
        - GFY_NETFILTER_REDIS_REDIS_KEY=${GFY_NETFILTER_REDIS_REDIS_KEY:-}
        - GFY_NETFILTER_REDIS_SEARCH_FIELD=${GFY_NETFILTER_REDIS_SEARCH_FIELD:-}
        - GFY_NETFILTER_REDIS_SEARCH_REGEXP=${GFY_NETFILTER_REDIS_SEARCH_REGEXP:-}
        - GFY_RATELIMIT_ENABLED=${GFY_RATELIMIT_ENABLED:-}
        - GFY_RATELIMIT_GOTIFY_TOKEN=${GFY_RATELIMIT_GOTIFY_TOKEN:-}
        - GFY_RATELIMIT_GOTIFY_TITLE=${GFY_RATELIMIT_GOTIFY_TITLE:-}
        - GFY_RATELIMIT_GOTIFY_MESSAGE=${GFY_RATELIMIT_GOTIFY_MESSAGE:-}
        - GFY_RATELIMIT_REDIS_REDIS_KEY=${GFY_RATELIMIT_REDIS_REDIS_KEY:-}
        - GFY_RATELIMIT_REDIS_SEARCH_FIELD=${GFY_RATELIMIT_REDIS_SEARCH_FIELD:-}
        - GFY_RATELIMIT_REDIS_SEARCH_REGEXP=${GFY_RATELIMIT_REDIS_SEARCH_REGEXP:-}
      networks:
        mailcow-network:
          aliases:
            - gfy
```

---

# Use as seperate single Dockercontainer

At first, you have to change the *mailcow.conf* file, so external connections through Redis will be allowed.

So change REDIS_PORT from 127.0.0.1:7654 => 0.0.0.0:7654. Or whatever you prever. Now you should be able to access the Mailcow-REDIS instance from another server.
If not, check your iptables.

```shell
docker run docker run -e REDIS_SLAVEOF_IP="192.168.10.44" \
-e REDIS_SLAVEOF_PORT=7654 \
-e GFY_GOTIFY_ADDRESS="https://gotify.sample.com/message" \
-e GFY_GOTYFY_HEALTH="https://gotify.sample.com/health" \
-e GFY_GOTIFY_TOKEN="AGzVycCZ7iJsf8L" \
johnny15243/mailcow-gotify:latest

```
