use Mix.Config

# In this file, we keep production configuration that
# you'll likely want to automate and keep away from
# your version control system.
#
# You should document the content of this
# file or create a script for recreating it, since it's
# kept out of version control and might be hard to recover
# or recreate for your teammates (or yourself later on).
config :kaori, KaoriWeb.Endpoint,
  secret_key_base: "OGI3VRIC7QJzGjJslMo7ytq522W8M9LVxaXSKLXRJo8Tdipwh0WlO3Y2XTkmiDht"

# Configure your database
config :kaori, Kaori.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "kaori_prod",
  pool_size: 15
