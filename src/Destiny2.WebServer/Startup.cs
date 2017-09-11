using Destiny2.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
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
            var builder = new ConfigurationBuilder().AddUserSecrets<Startup>();
            var configuration = builder.Build();

            services.AddSingleton(configuration);
            //services.AddSingleton(services);
            services.AddMvc();
            services.AddTransient((p) =>
            {
                var config = p.GetService<IConfigurationRoot>();
                var apiKey = config["ApiKey"];
                return new DestinyHttpService(apiKey);
            });
            services.AddTransient<DestinyApiService>();
            services.AddSingleton<DestinyDbService>();
            services.AddTransient((p) =>
            {
                var config = p.GetService<IConfigurationRoot>();
                var conn = config["ConnectionString"];
                return new SqlLiteDataLayer(conn);
            });

            var serviceProvider = services.BuildServiceProvider();
            var destinyApiService = serviceProvider.GetService<DestinyApiService>();

            Assembly.GetAssembly(MethodBase.GetCurrentMethod().DeclaringType.GetType());
            var assemblyLocation = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            var destinyDataZipFilePath = $"{assemblyLocation}/destinyData.zip";
            var destinyDataUnpackedDir = $"{assemblyLocation}/destinyDataUnpacked";

            var manifestObject = destinyApiService.GetManifestAsync().Result;
            var databasePath = (string)manifestObject.SelectToken("Response.mobileWorldContentPaths.en");
            var databaseFile = Directory.Exists(destinyDataUnpackedDir) ? new DirectoryInfo(destinyDataUnpackedDir).GetFiles().FirstOrDefault()?.Name : null;

            if (File.Exists(destinyDataZipFilePath)) File.Delete(destinyDataZipFilePath);
            if (databaseFile == null || !databasePath.EndsWith(databaseFile))
            {
                if (Directory.Exists(destinyDataUnpackedDir)) Directory.Delete(destinyDataUnpackedDir);
                var database = destinyApiService.GetWorldContentDatabase().Result;
                File.WriteAllBytes(destinyDataZipFilePath, database);
                ZipFile.ExtractToDirectory(destinyDataZipFilePath, destinyDataUnpackedDir, overwriteFiles: true);
                File.Delete(destinyDataZipFilePath);
            }

            databaseFile = Directory.GetFiles(destinyDataUnpackedDir).Single();

            configuration["ConnectionString"] = $@"Data Source={databaseFile}";

            //var dataLayer = new SqlLiteDataLayer(connectionString);
            //var query = @"SELECT * FROM [DestinyInventoryItemDefinition] WHERE json LIKE '%""hash"":2903592984%'";
            //var query = @"SELECT * FROM [DestinyInventoryItemDefinition]";
            //var results = dataLayer.ExecuteQuery(query).ToList();
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