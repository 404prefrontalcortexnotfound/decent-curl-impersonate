FROM python:3.13-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
COPY python ./python
RUN pip install --no-cache-dir uv==0.8.22 && uv sync --frozen --no-dev --no-editable
RUN useradd --create-home --uid 10001 fetch
USER 10001
ENV DECENT_CURL_CONTAINER=1
EXPOSE 8765
CMD ["/app/.venv/bin/decent-curl-http"]
