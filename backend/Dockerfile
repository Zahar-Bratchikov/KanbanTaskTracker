FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY KanbanApi/*.csproj ./KanbanApi/
RUN dotnet restore KanbanApi/KanbanApi.csproj
COPY . .
WORKDIR /src/KanbanApi
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "KanbanApi.dll"]