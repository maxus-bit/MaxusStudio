{ pkgs, ... }: {
  # Выбираем стабильный канал пакетов
  channel = "stable-23.11";

  # Что установить в виртуальную машину
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.firebase-tools
    pkgs.nodePackages.typescript
    pkgs.nodePackages.angular-cli
  ];

  # Переменные окружения
  env = {};

  idx = {
    # Какие расширения для VS Code установить сразу
    extensions = [
      "Angular.ng-template"
      "tseven.firebase-vscode"
    ];

    # Настройка превью (чтобы сайт открылся справа)
    previews = {
      enable = true;
      previews = {
        web = {
          # Команда запуска. Важно: host 0.0.0.0 нужен для облака
          command = ["npm" "run" "start" "--" "--port" "$PORT" "--host" "0.0.0.0" "--disable-host-check"];
          manager = "web";
        };
      };
    };

    # Что сделать при первом запуске (установить npm пакеты)
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        # Можно добавить команды, которые нужны при каждом запуске
      };
    };
  };
}