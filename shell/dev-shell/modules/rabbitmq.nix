{ pkgs, ... }:
{
  buildInputs = [
    pkgs.rabbitmq-server
  ];

  shellHook = ''
    FLAKE_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")"

    export RABBITMQ_BASE=$FLAKE_ROOT/.rabbitmq
    export RABBITMQ_MNESIA_BASE=$RABBITMQ_BASE/mnesia
    export RABBITMQ_LOG_BASE=$RABBITMQ_BASE/log
    export RABBITMQ_PID_FILE=$RABBITMQ_BASE/rabbitmq.pid
    export RABBITMQ_ENABLED_PLUGINS_FILE=$RABBITMQ_BASE/enabled_plugins
    export RABBITMQ_NODENAME=rabbit@localhost

    mkdir -p $RABBITMQ_MNESIA_BASE $RABBITMQ_LOG_BASE

    if [ ! -f "$RABBITMQ_ENABLED_PLUGINS_FILE" ]; then
      echo '[rabbitmq_management].' > "$RABBITMQ_ENABLED_PLUGINS_FILE"
    fi

    start-rabbitmq() {
      if ! rabbitmqctl status >/dev/null 2>&1; then
        rabbitmq-server -detached
      fi
    }

    stop-rabbitmq() {
      rabbitmqctl stop
    }

    start-rabbitmq
  '';
}
