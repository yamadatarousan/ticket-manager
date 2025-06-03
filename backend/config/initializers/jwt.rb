require "jwt"

# JWTライブラリを明示的に読み込み
Rails.logger.info "JWT library loaded successfully" if defined?(Rails.logger)

# Rails 8.0では自動読み込みが改善されているため、明示的なautoload_pathsの設定は不要
