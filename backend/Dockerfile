# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["Cverse.API/Cverse.API.csproj", "Cverse.API/"]
COPY ["Cverse.Application/Cverse.Application.csproj", "Cverse.Application/"]
COPY ["Cverse.Domain/Cverse.Domain.csproj", "Cverse.Domain/"]
COPY ["Cverse.Infrastructure/Cverse.Infrastructure.csproj", "Cverse.Infrastructure/"]
COPY ["Cverse.Persistence/Cverse.Persistence.csproj", "Cverse.Persistence/"]
RUN dotnet restore "Cverse.API/Cverse.API.csproj"

# Copy everything and build
COPY . .
WORKDIR "/src/Cverse.API"
RUN dotnet build "Cverse.API.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "Cverse.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runner Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 5145

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5145
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=publish /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads

ENTRYPOINT ["dotnet", "Cverse.API.dll"]
