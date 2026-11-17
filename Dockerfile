# FitLog API — multi-stage build for Render (or any container host)

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore first so package layers are cached between builds
COPY FitLog.sln ./
COPY FitLog.API/FitLog.API.csproj FitLog.API/
COPY FitLog.Application/FitLog.Application.csproj FitLog.Application/
COPY FitLog.Domain/FitLog.Domain.csproj FitLog.Domain/
COPY FitLog.Infrastructure/FitLog.Infrastructure.csproj FitLog.Infrastructure/
RUN dotnet restore FitLog.API/FitLog.API.csproj

COPY FitLog.API/ FitLog.API/
COPY FitLog.Application/ FitLog.Application/
COPY FitLog.Domain/ FitLog.Domain/
COPY FitLog.Infrastructure/ FitLog.Infrastructure/
RUN dotnet publish FitLog.API/FitLog.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true

# Run as the image's built-in non-root user
USER $APP_UID

# Render injects PORT; default to 8080 elsewhere
EXPOSE 8080
CMD ["sh", "-c", "ASPNETCORE_HTTP_PORTS=${PORT:-8080} exec dotnet FitLog.API.dll"]
