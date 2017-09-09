using Destiny2.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;

namespace Destiny2.WebServer
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            var assemblyLocation = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            var destinyDataZipFilePath = $"{assemblyLocation}/destinyData.zip";
            var destinyDataUnpackedDir = $"{assemblyLocation}/destinyDataUnpacked";
            const string apiKey = "106c3e8ee80248b5bd0514c7f966dc47";
            var httpService = new DestinyHttpService(apiKey);

            //var query = @"SELECT * FROM [DestinyInventoryItemDefinition] WHERE json LIKE '%""hash"":2903592984%'";
            var query = @"SELECT * FROM [DestinyInventoryItemDefinition]";
            var manifest = httpService.GetStringAsync("https://www.bungie.net/Platform/Destiny2/Manifest/").Result;

            var manifestObject = JObject.Parse(manifest);
            var databasePath = (string)manifestObject.SelectToken("Response.mobileWorldContentPaths.en");
            var databaseFile = Directory.Exists(destinyDataUnpackedDir) ? new DirectoryInfo(destinyDataUnpackedDir).GetFiles().FirstOrDefault()?.Name : null;

            if (File.Exists(destinyDataZipFilePath)) File.Delete(destinyDataZipFilePath);
            if (databaseFile == null || !databasePath.EndsWith(databaseFile))
            {
                if (Directory.Exists(destinyDataUnpackedDir)) Directory.Delete(destinyDataUnpackedDir);
                var database = httpService.GetBytesAsync("https://www.bungie.net/common/destiny2_content/sqlite/en/world_sql_content_281de46e3cd73e5747595936fd2dffa9.content").Result;
                File.WriteAllBytes(destinyDataZipFilePath, database);
                ZipFile.ExtractToDirectory(destinyDataZipFilePath, destinyDataUnpackedDir, overwriteFiles: true);
                File.Delete(destinyDataZipFilePath);
            }

            databaseFile = Directory.GetFiles(destinyDataUnpackedDir).Single();

            var connectionString = $@"Data Source={databaseFile}";
            var dataLayer = new SqlLiteDataLayer(connectionString);
            var results = dataLayer.ExecuteQuery(query).ToList();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMvc(builder =>
            {
                builder.MapRoute("Api", "Api/{controller}/{action}/{id?}");
            });
        }

        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .UseApplicationInsights()
                .Build();

            host.Run();
        }
    }
}