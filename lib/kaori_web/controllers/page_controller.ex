defmodule KaoriWeb.PageController do
  use KaoriWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
